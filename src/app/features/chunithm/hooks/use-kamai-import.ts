import { useEffect, useMemo, useRef, useState, ChangeEvent } from "react"
import { toast } from "sonner"
import { DateTime } from "luxon"
import type { DB, ChunithmPlaylog } from "@/app/shared/types"
import type { KamaiPbScore, KamaiChartDefinition, KamaiFileFormat } from "@/app/shared/types/kamai"
import { useChunithmSongs, useScoreImporter } from "@/app/features/chunithm/hooks"
import type { ChunithmKamaiImportScore } from "./use-score-importer"

export type ImportedScorePreview = ChunithmKamaiImportScore & {
	id: string
	title: string | null
	chartLevel: number | null
	status: "ready" | "best-update" | "duplicate" | "unknown-song" | "duplicate-in-file"
}

export type ChunithmExistingScore = ChunithmPlaylog & {
	bestScoreMax?: number | null
	bestMissCount?: number | null
	bestMaxComboCount?: number | null
	bestIsFullCombo?: number | null
	bestIsAllJustice?: number | null
	bestIsSuccess?: number | null
}

type ExistingBestScore = {
	scoreMax: number | null
	missCount: number | null
	maxComboCount: number | null
	isFullCombo: number | null
	isAllJustice: number | null
	isSuccess: number | null
}

type ImportSortOrder = "date-desc" | "date-asc" | "title-asc"

const KAMAI_DIFFICULTY_TO_CHART_ID: Record<string, number> = {
	BASIC: 0,
	ADVANCED: 1,
	EXPERT: 2,
	MASTER: 3,
	ULTIMA: 4
}

const getDuplicateScoreKey = (score: ChunithmKamaiImportScore) =>
	`${score.songId}:${score.level}:${score.score}${score.timeAchieved ? `:${score.timeAchieved}` : ""}`

const getGeneralScoreKey = (score: { songId: number; level: number; score: number }) =>
	`${score.songId}:${score.level}:${score.score}`

const getPreviewRowId = (
	score: { songId: number; level: number; score: number; timeAchieved?: number | null },
	index: number
) => `${getGeneralScoreKey(score)}:${score.timeAchieved ?? 0}:${index}`

const getExistingPlaylogKey = (score: ChunithmPlaylog) => {
	const musicId = score.musicId ?? 0
	const difficulty = score.chartId ?? score.level ?? -1
	const scoreValue = score.score ?? 0
	const timestamp = score.userPlayDate ? DateTime.fromSQL(score.userPlayDate, { zone: "Asia/Tokyo" }).toMillis() : null
	
	return `${musicId}:${difficulty}:${scoreValue}${timestamp ? `:${timestamp}` : ""}`
}

export const isImportableStatus = (status: ImportedScorePreview["status"]) =>
	status === "ready" || status === "best-update"

const isScoreBestUpdate = (score: ChunithmKamaiImportScore, best?: ExistingBestScore) => {
	const isAllJustice = score.noteLamp === "ALL JUSTICE" || score.noteLamp === "ALL JUSTICE CRITICAL" ? 1 : 0
	const isFullCombo = isAllJustice === 1 || score.noteLamp === "FULL COMBO" ? 1 : 0
	const isSuccess = score.clearLamp === "FAILED" ? 0 : 1

	if (!best || best.scoreMax == null) return true
	if (score.score > best.scoreMax) return true
	if (score.maxCombo != null && score.maxCombo > (best.maxComboCount ?? 0)) return true
	if (score.judgements?.miss != null && (best.missCount == null || score.judgements.miss < best.missCount)) return true
	if (isFullCombo > (best.isFullCombo ?? 0)) return true
	if (isAllJustice > (best.isAllJustice ?? 0)) return true
	if (isSuccess > (best.isSuccess ?? 0)) return true

	return false
}

const sanitizeTimeAchieved = (value: unknown) => (typeof value === "number" ? value : undefined)

const isImportSortOrder = (value: string | null): value is ImportSortOrder =>
	value === "date-desc" || value === "date-asc" || value === "title-asc"

const sanitizeJudgements = (value: unknown): ChunithmKamaiImportScore["judgements"] | undefined => {
	if (!value || typeof value !== "object") return undefined

	const judgements = value as Partial<Record<keyof NonNullable<ChunithmKamaiImportScore["judgements"]>, unknown>>
	const keys: (keyof NonNullable<ChunithmKamaiImportScore["judgements"]>)[] = ["jcrit", "justice", "attack", "miss"]

	if (!keys.every(key => typeof judgements[key] === "number")) return undefined

	return {
		jcrit: judgements.jcrit as number,
		justice: judgements.justice as number,
		attack: judgements.attack as number,
		miss: judgements.miss as number
	}
}

const normalizeExportScores = (scores: unknown[]): ChunithmKamaiImportScore[] => {
	return scores.flatMap((raw, index) => {
		if (!raw || typeof raw !== "object") return []

		const score = raw as {
			identifier?: string
			difficulty?: string
			score?: number
			noteLamp?: ChunithmKamaiImportScore["noteLamp"]
			clearLamp?: ChunithmKamaiImportScore["clearLamp"]
			timeAchieved?: number
			judgements?: ChunithmKamaiImportScore["judgements"]
			optional?: {
				maxCombo?: number
			}
		}

		const musicId = Number(score.identifier)
		const level = KAMAI_DIFFICULTY_TO_CHART_ID[score.difficulty ?? ""]

		if (!Number.isInteger(musicId) || level === undefined || typeof score.score !== "number") {
			console.warn("Skipping invalid export score at index", index)
			return []
		}

		return [
			{
				songId: musicId,
				level,
				score: score.score,
				noteLamp: score.noteLamp ?? "NONE",
				clearLamp: score.clearLamp ?? "FAILED",
				timeAchieved: sanitizeTimeAchieved(score.timeAchieved),
				judgements: sanitizeJudgements(score.judgements),
				maxCombo: score.optional?.maxCombo
			}
		]
	})
}

const normalizeKamaiPbScores = (
	pbs: KamaiPbScore[],
	charts: KamaiChartDefinition[]
): ChunithmKamaiImportScore[] => {
	const chartMap = new Map(charts.map((chart) => [chart.chartID, chart]))

	return pbs.flatMap((pb, index) => {
		if (pb.game !== "chunithm") return []
		if (pb.playtype && pb.playtype !== "Single") return []

		const chart = pb.chartID ? chartMap.get(pb.chartID) : undefined
		const musicId = chart?.data?.inGameID ?? null

		const level = chart?.difficulty ? KAMAI_DIFFICULTY_TO_CHART_ID[chart.difficulty] : undefined
		const scoreValue = pb.scoreData?.score

		if (
			musicId === null ||
			!Number.isInteger(musicId) ||
			level === undefined ||
			typeof scoreValue !== "number"
		) {
			console.warn(`Skipping PB score at index ${index}: Missing inGameID or invalid data`)
			return []
		}

		return [
			{
				songId: musicId,
				level,
				score: scoreValue,
				noteLamp: (pb.scoreData?.noteLamp as ChunithmKamaiImportScore["noteLamp"]) ?? "NONE",
				clearLamp: (pb.scoreData?.clearLamp as ChunithmKamaiImportScore["clearLamp"]) ?? "FAILED",
				timeAchieved: sanitizeTimeAchieved(pb.timeAchieved),
				judgements: sanitizeJudgements(pb.scoreData?.judgements),
				maxCombo: pb.scoreData?.optional?.maxCombo
			}
		]
	})
}

const parseKamaiFile = (content: string): ChunithmKamaiImportScore[] => {
	const parsed = JSON.parse(content) as KamaiFileFormat

	if (Array.isArray(parsed.scores)) {
		return normalizeExportScores(parsed.scores)
	}

	if (Array.isArray(parsed.body?.pbs) && Array.isArray(parsed.body?.charts)) {
		return normalizeKamaiPbScores(
			parsed.body.pbs,
			parsed.body.charts
		)
	}

	throw new Error("Unsupported Kamai JSON format")
}

export function useKamaiImport(existingScores: ChunithmExistingScore[]) {
	const inputRef = useRef<HTMLInputElement | null>(null)
	const [fileName, setFileName] = useState<string | null>(null)
	const [parsedScores, setParsedScores] = useState<ChunithmKamaiImportScore[]>([])
	const [selectedKeys, setSelectedKeys] = useState<Record<string, boolean>>({})
	const [onlyShowReadyRows, setOnlyShowReadyRows] = useState(false)
	const [kamaiUsername, setKamaiUsername] = useState("")
	const [lastFetchedKamaiUsername, setLastFetchedKamaiUsername] = useState<string | null>(null)
	const [isFetchingKamai, setIsFetchingKamai] = useState(false)
	const [sortOrder, setSortOrder] = useState<ImportSortOrder>(() => {
		if (typeof window !== "undefined") {
			const savedSortOrder = localStorage.getItem("chunithm-kamai-import-sort")
			return isImportSortOrder(savedSortOrder) ? savedSortOrder : "date-desc"
		}
		return "date-desc"
	})

	useEffect(() => {
		localStorage.setItem("chunithm-kamai-import-sort", sortOrder)
	}, [sortOrder])

	const { data: songs } = useChunithmSongs()
	const importMutation = useScoreImporter()

	const songMap = useMemo(() => {
		const map = new Map<string, DB.ChuniStaticMusic>()
		for (const song of (songs ?? []) as DB.ChuniStaticMusic[]) {
			map.set(`${song.songId}:${song.chartId}`, song)
		}
		return map
	}, [songs])


	const existingExactPlayKeys = useMemo(() => new Set(existingScores.map(getExistingPlaylogKey)), [existingScores])
	const existingGeneralScoreKeys = useMemo(
		() =>
			new Set(
				existingScores.map((score) =>
					getGeneralScoreKey({
						songId: score.musicId ?? 0,
						level: score.chartId ?? score.level ?? -1,
						score: score.score ?? 0
					})
				)
			),
		[existingScores]
	)

	const existingBestMap = useMemo(() => {
		const bestMap = new Map<string, ExistingBestScore>()

		for (const score of existingScores) {
			const musicId = score.musicId ?? 0
			const chartId = score.chartId ?? score.level ?? -1
			const key = `${musicId}:${chartId}`

			if (!bestMap.has(key)) {
				bestMap.set(key, {
					scoreMax: score.bestScoreMax ?? null,
					maxComboCount: score.bestMaxComboCount ?? null,
					missCount: score.bestMissCount ?? null,
					isFullCombo: score.bestIsFullCombo ?? null,
					isAllJustice: score.bestIsAllJustice ?? null,
					isSuccess: score.bestIsSuccess ?? null
				})
			}
		}

		return bestMap
	}, [existingScores])

	const previewRows = useMemo<ImportedScorePreview[]>(() => {
		const fileSeenKeys = new Set<string>()

		const rows = parsedScores.map((score, index) => {
			const song = songMap.get(`${score.songId}:${score.level}`)
			const duplicateKey = getDuplicateScoreKey(score)
			const generalKey = getGeneralScoreKey(score)
			let status: ImportedScorePreview["status"] = "ready"

			if (!song) {
				status = "unknown-song"
			} else if (existingExactPlayKeys.has(duplicateKey) || existingGeneralScoreKeys.has(generalKey)) {
				status = isScoreBestUpdate(score, existingBestMap.get(`${score.songId}:${score.level}`))
					? "best-update"
					: "duplicate"
			} else if (fileSeenKeys.has(duplicateKey)) {
				status = "duplicate-in-file"
			}

			fileSeenKeys.add(duplicateKey)

			return {
				...score,
				id: getPreviewRowId(score, index),
				title: song?.title ?? null,
				chartLevel: song?.level ?? null,
				status
			}
		})

		return [...rows].sort((a, b) => {
			if (sortOrder === "date-desc") {
				return (b.timeAchieved ?? 0) - (a.timeAchieved ?? 0)
			}
			if (sortOrder === "date-asc") {
				return (a.timeAchieved ?? 0) - (b.timeAchieved ?? 0)
			}
			if (sortOrder === "title-asc") {
				return (a.title ?? "").localeCompare(b.title ?? "")
			}
			return 0
		})
	}, [existingBestMap, existingExactPlayKeys, existingGeneralScoreKeys, parsedScores, songMap, sortOrder])

	const selectedRows = useMemo(
		() => previewRows.filter(row => isImportableStatus(row.status) && selectedKeys[row.id]),
		[previewRows, selectedKeys]
	)

	const visiblePreviewRows = useMemo(
		() => previewRows.filter(row => !onlyShowReadyRows || isImportableStatus(row.status)),
		[previewRows, onlyShowReadyRows]
	)

	const summary = useMemo(
		() => ({
			ready: previewRows.filter(row => row.status === "ready").length,
			bestUpdate: previewRows.filter(row => row.status === "best-update").length,
			duplicate: previewRows.filter(row => row.status === "duplicate").length,
			duplicateInFile: previewRows.filter(row => row.status === "duplicate-in-file").length,
			unknownSong: previewRows.filter(row => row.status === "unknown-song").length
		}),
		[previewRows]
	)

	const resetState = () => {
		setFileName(null)
		setParsedScores([])
		setSelectedKeys({})
		setOnlyShowReadyRows(false)
		setKamaiUsername("")
		setLastFetchedKamaiUsername(null)
		setIsFetchingKamai(false)
		if (inputRef.current) {
			inputRef.current.value = ""
		}
	}

	const toggleSelectAll = (checked: boolean) => {
		if (checked) {
			const newSelected: Record<string, boolean> = {}
			for (const row of visiblePreviewRows) {
				if (isImportableStatus(row.status)) {
					newSelected[row.id] = true
				}
			}
			setSelectedKeys(newSelected)
		} else {
			setSelectedKeys({})
		}
	}

	const processKamaiFile = async (file: File) => {
		try {
			const content = await file.text()
			const scores = parseKamaiFile(content)

			if (scores.length === 0) {
				toast.error("No Chunithm scores found in that file")
				return
			}

			setFileName(file.name)
			setParsedScores(scores)
			setKamaiUsername("")
			setLastFetchedKamaiUsername(null)
		} catch (error) {
			console.error("Import parse error:", error)
			toast.error("Failed to read the Kamai JSON file")
		}
	}

	const uploadKamaiFile = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return
		await processKamaiFile(file)
	}

	const fetchRemoteScores = async () => {
		const normalized = kamaiUsername.trim()
		if (!normalized) {
			toast.error("Enter a Kamai username")
			return
		}

		setIsFetchingKamai(true)
		try {
			const response = await fetch(
				`https://kamai.tachi.ac/api/v1/users/${encodeURIComponent(normalized)}/games/chunithm/pbs/all`
			)

			if (!response.ok) throw new Error(`Kamai returned ${response.status}`)

			const content = await response.text()
			const scores = parseKamaiFile(content)

			if (scores.length === 0) {
				toast.error("No Chunithm scores found for that Kamai user")
				return
			}

			setFileName(`Kamai: ${normalized}`)
			setParsedScores(scores)
			setLastFetchedKamaiUsername(normalized)
			toast.success(`Fetched ${scores.length} scores from Kamaitachi`)
		} catch (error) {
			console.error("Kamai fetch error:", error)
			toast.error("Failed to fetch scores from Kamai")
		} finally {
			setIsFetchingKamai(false)
		}
	}

	return {
		inputRef,
		fileName,
		parsedScores,
		selectedKeys,
		setSelectedKeys,
		onlyShowReadyRows,
		setOnlyShowReadyRows,
		kamaiUsername,
		setKamaiUsername,
		isFetchingKamai,
		shouldFetchFromKamai: kamaiUsername.trim().length > 0 && kamaiUsername.trim() !== lastFetchedKamaiUsername,
		previewRows,
		selectedRows,
		visiblePreviewRows,
		summary,
		importMutation,
		getPreviewTextClassName: (status: ImportedScorePreview["status"]) =>
			isImportableStatus(status) ? "text-foreground" : "text-muted-foreground",
		getPreviewMetaClassName: (status: ImportedScorePreview["status"]) =>
			isImportableStatus(status) ? "text-foreground" : "text-muted-foreground",
		sortOrder,
		setSortOrder,
		toggleSelectAll,
		resetState,
		processKamaiFile,
		uploadKamaiFile,
		fetchRemoteScores
	}
}
