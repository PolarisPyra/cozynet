import { useMemo, useRef, useState, ChangeEvent } from "react"
import { toast } from "sonner"
import { DateTime } from "luxon"
import type { DB, ChunithmPlaylog } from "@/app/shared/types"
import type { ChunithmKamaiImportScore } from "./use-score-importer"
import { useChunithmSongs, useScoreImporter } from "@/app/features/chunithm/hooks"



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

type KamaiChartDefinition = {
	chartID: string
	difficulty?: "BASIC" | "ADVANCED" | "EXPERT" | "MASTER" | "ULTIMA"
	data?: {
		inGameID?: number
	}
}

type KamaiPbScore = {
	chartID?: string
	game?: string
	playtype?: string
	songID?: number
	timeAchieved?: number
	scoreData?: {
		score?: number
		noteLamp?: ChunithmKamaiImportScore["noteLamp"]
		clearLamp?: ChunithmKamaiImportScore["clearLamp"]
		judgements?: ChunithmKamaiImportScore["judgements"]
		optional?: {
			maxCombo?: number
		}
	}
}

const KAMAI_DIFFICULTY_TO_CHART_ID: Record<string, number> = {
	BASIC: 0,
	ADVANCED: 1,
	EXPERT: 2,
	MASTER: 3,
	ULTIMA: 4
}

export const getDuplicateScoreKey = (score: { musicId: number; level: number; score: number }) =>
	`${score.musicId}:${score.level}:${score.score}`

export const getPreviewRowId = (
	score: { musicId: number; level: number; score: number; timeAchieved?: number },
	index: number
) => `${getDuplicateScoreKey(score)}:${score.timeAchieved ?? 0}:${index}`

const getExistingPlaylogKey = (score: ChunithmPlaylog) => {
	const millis = score.userPlayDate ? DateTime.fromSQL(score.userPlayDate, { zone: "Asia/Tokyo" }).toMillis() : 0
	return `${score.musicId ?? 0}:${score.chartId ?? score.level ?? -1}:${score.score ?? 0}:${millis || 0}`
}

export const isImportableStatus = (status: ImportedScorePreview["status"]) => status === "ready" || status === "best-update"

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

const normalizeExportScores = (scores: unknown[]): ChunithmKamaiImportScore[] => {
	return scores.flatMap((raw, index) => {
		if (!raw || typeof raw !== "object") {
			return []
		}

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
				musicId,
				level,
				score: score.score,
				noteLamp: score.noteLamp ?? "NONE",
				clearLamp: score.clearLamp ?? "FAILED",
				timeAchieved: score.timeAchieved,
				judgements: score.judgements,
				maxCombo: score.optional?.maxCombo
			}
		]
	})
}

const normalizeKamaiPbScores = (pbs: KamaiPbScore[], charts: KamaiChartDefinition[]): ChunithmKamaiImportScore[] => {
	const chartMap = new Map(charts.map(chart => [chart.chartID, chart]))

	return pbs.flatMap((pb, index) => {
		if (pb.game && pb.game !== "chunithm") {
			return []
		}

		if (pb.playtype && pb.playtype !== "Single") {
			return []
		}

		const chart = pb.chartID ? chartMap.get(pb.chartID) : undefined
		const musicId = chart?.data?.inGameID ?? pb.songID
		const level = chart?.difficulty ? KAMAI_DIFFICULTY_TO_CHART_ID[chart.difficulty] : undefined
		const scoreValue = pb.scoreData?.score

		if (
			typeof musicId !== "number" ||
			!Number.isInteger(musicId) ||
			level === undefined ||
			typeof scoreValue !== "number"
		) {
			console.warn("Skipping invalid PB score at index", index)
			return []
		}

		return [
			{
				musicId,
				level,
				score: scoreValue,
				noteLamp: pb.scoreData?.noteLamp ?? "NONE",
				clearLamp: pb.scoreData?.clearLamp ?? "FAILED",
				timeAchieved: pb.timeAchieved,
				judgements: pb.scoreData?.judgements,
				maxCombo: pb.scoreData?.optional?.maxCombo
			}
		]
	})
}

const parseKamaiFile = (content: string): ChunithmKamaiImportScore[] => {
	const parsed = JSON.parse(content) as {
		scores?: unknown[]
		body?: {
			pbs?: KamaiPbScore[]
			charts?: KamaiChartDefinition[]
		}
	}

	if (Array.isArray(parsed.scores)) {
		return normalizeExportScores(parsed.scores)
	}

	if (Array.isArray(parsed.body?.pbs) && Array.isArray(parsed.body?.charts)) {
		return normalizeKamaiPbScores(parsed.body.pbs, parsed.body.charts)
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

	const { data: songs } = useChunithmSongs()
	const importMutation = useScoreImporter()

	const songMap = useMemo(() => {
		return new Map(((songs ?? []) as DB.ChuniStaticMusic[]).map(song => [`${song.songId}:${song.chartId}`, song]))
	}, [songs])

	const existingScoreKeys = useMemo(() => new Set(existingScores.map(getExistingPlaylogKey)), [existingScores])

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

		return parsedScores.map((score, index) => {
			const song = songMap.get(`${score.musicId}:${score.level}`)
			const duplicateKey = getDuplicateScoreKey(score)
			let status: ImportedScorePreview["status"] = "ready"

			if (!song) {
				status = "unknown-song"
			} else if (existingScoreKeys.has(duplicateKey)) {
				status = isScoreBestUpdate(score, existingBestMap.get(`${score.musicId}:${score.level}`))
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
	}, [existingBestMap, existingScoreKeys, parsedScores, songMap])

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

	const getPreviewTextClassName = (status: ImportedScorePreview["status"]) =>
		isImportableStatus(status) ? "text-foreground" : "text-muted-foreground"

	const getPreviewMetaClassName = (status: ImportedScorePreview["status"]) =>
		isImportableStatus(status) ? "text-foreground" : "text-muted-foreground"

	const normalizedKamaiUsername = kamaiUsername.trim()
	const shouldFetchFromKamai =
		normalizedKamaiUsername.length > 0 && normalizedKamaiUsername !== lastFetchedKamaiUsername

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

	const handleFile = async (file: File) => {
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

	const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return
		await handleFile(file)
	}

	const handleFetchFromKamai = async () => {
		if (!normalizedKamaiUsername) {
			toast.error("Enter a Kamai username")
			return
		}

		setIsFetchingKamai(true)
		try {
			const response = await fetch(
				`https://kamai.tachi.ac/api/v1/users/${encodeURIComponent(normalizedKamaiUsername)}/games/chunithm/Single/pbs/all`
			)

			if (!response.ok) {
				throw new Error(`Kamai returned ${response.status}`)
			}

			const content = await response.text()
			const scores = parseKamaiFile(content)

			if (scores.length === 0) {
				toast.error("No Chunithm scores found for that Kamai user")
				return
			}

			setFileName(`Kamai: ${normalizedKamaiUsername}`)
			setParsedScores(scores)
			setLastFetchedKamaiUsername(normalizedKamaiUsername)
			if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur()
			}
			if (inputRef.current) {
				inputRef.current.value = ""
			}
			toast.success(`Fetched ${scores.length} Chunithm score${scores.length === 1 ? "" : "s"}`)
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
		shouldFetchFromKamai,
		previewRows,
		selectedRows,
		visiblePreviewRows,
		summary,
		importMutation,
		getPreviewTextClassName,
		getPreviewMetaClassName,
		resetState,
		handleFile,
		handleInputChange,
		handleFetchFromKamai
	}
}
