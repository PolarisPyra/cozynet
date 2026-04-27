import { useMemo, useRef, useState, ChangeEvent } from "react"
import { toast } from "sonner"
import type { DB, OngekiPlaylog } from "@/app/shared/types"
import type { OngekiKamaiImportScore } from "./use-score-importer"
import { useOngekiSongs, useOngekiScoreImporter } from "@/app/features/ongeki/hooks"

export type ImportedScorePreview = OngekiKamaiImportScore & {
	id: string
	title: string | null
	chartLevel: number | null
	status: "ready" | "best-update" | "duplicate" | "unknown-song" | "duplicate-in-file"
}

export type OngekiExistingScore = OngekiPlaylog & {
	bestTechScoreMax?: number | null
	bestMaxComboCount?: number | null
	bestIsFullBell?: number | null
	bestIsFullCombo?: number | null
	bestIsAllBreake?: number | null
	bestClearStatus?: number | null
	bestPlatinumScoreMax?: number | null
	bestPlatinumScoreStar?: number | null
}

export type ExistingBestScore = {
	techScoreMax: number | null
	maxComboCount: number | null
	isFullBell: number | null
	isFullCombo: number | null
	isAllBreake: number | null
	clearStatus: number | null
	platinumScoreMax: number | null
	platinumScoreStar: number | null
}

export type KamaiChartDefinition = {
	chartID: string
	difficulty?: "BASIC" | "ADVANCED" | "EXPERT" | "MASTER" | "LUNATIC"
	data?: {
		inGameID?: number
		maxPlatScore?: number
	}
}

export type KamaiPbScore = {
	chartID?: string
	game?: string
	playtype?: string
	songID?: number
	timeAchieved?: number | null
	scoreData?: {
		score?: number
		noteLamp?: OngekiKamaiImportScore["noteLamp"]
		bellLamp?: OngekiKamaiImportScore["bellLamp"]
		platinumScore?: number | null
		platinumStars?: number | null
		judgements?: Partial<OngekiKamaiImportScore["judgements"]>
		optional?: {
			maxCombo?: number
			damage?: number | null
			bellCount?: number | null
			totalBellCount?: number | null
		}
	}
}

export const KAMAI_DIFFICULTY_TO_CHART_ID: Record<string, OngekiKamaiImportScore["level"]> = {
	BASIC: 0,
	ADVANCED: 1,
	EXPERT: 2,
	MASTER: 3,
	LUNATIC: 10
}

export const getDuplicateScoreKey = (score: { musicId: number; level: number; score: number }) =>
	`${score.musicId}:${score.level}:${score.score}`

export const getPreviewRowId = (
	score: { musicId: number; level: number; score: number; timeAchieved?: number },
	index: number
) => `${getDuplicateScoreKey(score)}:${score.timeAchieved ?? 0}:${index}`

export const getExistingPlaylogKey = (score: OngekiPlaylog) =>
	`${score.musicId ?? 0}:${score.chartId ?? score.level ?? -1}:${score.techScore ?? 0}`

export const isImportableStatus = (status: ImportedScorePreview["status"]) =>
	status === "ready" || status === "best-update"

export const isScoreBestUpdate = (score: OngekiKamaiImportScore, best?: ExistingBestScore) => {
	const isAllBreake = score.noteLamp === "ALL BREAK" || score.noteLamp === "ALL BREAK+" ? 1 : 0
	const isFullCombo = isAllBreake === 1 || score.noteLamp === "FULL COMBO" ? 1 : 0
	const isFullBell = score.bellLamp === "FULL BELL" ? 1 : 0
	const clearStatus = score.noteLamp === "LOSS" ? 0 : 1
	if (!best || best.techScoreMax == null) return true
	if (score.score > best.techScoreMax) return true
	if (score.maxCombo != null && score.maxCombo > (best.maxComboCount ?? 0)) return true
	if (isFullBell > (best.isFullBell ?? 0)) return true
	if (isFullCombo > (best.isFullCombo ?? 0)) return true
	if (isAllBreake > (best.isAllBreake ?? 0)) return true
	if (clearStatus > (best.clearStatus ?? 0)) return true
	if (score.platinumScore != null && (best.platinumScoreMax == null || score.platinumScore > best.platinumScoreMax))
		return true
	if (score.platinumStars != null && score.platinumStars > (best.platinumScoreStar ?? 0)) return true

	return false
}

export const sanitizeTimeAchieved = (value: unknown) => (typeof value === "number" ? value : undefined)

export const sanitizeJudgements = (value: unknown): OngekiKamaiImportScore["judgements"] | undefined => {
	if (!value || typeof value !== "object") {
		return undefined
	}

	const judgements = value as Partial<Record<keyof NonNullable<OngekiKamaiImportScore["judgements"]>, unknown>>
	const keys: (keyof NonNullable<OngekiKamaiImportScore["judgements"]>)[] = ["cbreak", "break", "hit", "miss"]

	if (!keys.every(key => typeof judgements[key] === "number")) {
		return undefined
	}

	return {
		cbreak: judgements.cbreak as number,
		break: judgements.break as number,
		hit: judgements.hit as number,
		miss: judgements.miss as number
	}
}

export const normalizeExportScores = (scores: unknown[]): OngekiKamaiImportScore[] => {
	return scores.flatMap((raw, index) => {
		if (!raw || typeof raw !== "object") {
			return []
		}

		const score = raw as {
			identifier?: string
			difficulty?: string
			score?: number
			noteLamp?: OngekiKamaiImportScore["noteLamp"]
			bellLamp?: OngekiKamaiImportScore["bellLamp"]
			platinumScore?: number | null
			timeAchieved?: number
			judgements?: OngekiKamaiImportScore["judgements"]
			optional?: {
				maxCombo?: number
				damage?: number | null
				bellCount?: number | null
				totalBellCount?: number | null
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
				noteLamp: score.noteLamp ?? "LOSS",
				bellLamp: score.bellLamp ?? "NONE",
				platinumScore: score.platinumScore ?? null,
				timeAchieved: sanitizeTimeAchieved(score.timeAchieved),
				judgements: sanitizeJudgements(score.judgements),
				maxCombo: score.optional?.maxCombo,
				damage: score.optional?.damage ?? null,
				bellCount: score.optional?.bellCount ?? null,
				totalBellCount: score.optional?.totalBellCount ?? null
			}
		]
	})
}

export const normalizeKamaiPbScores = (pbs: KamaiPbScore[], charts: KamaiChartDefinition[]): OngekiKamaiImportScore[] => {
	const chartMap = new Map(charts.map(chart => [chart.chartID, chart]))

	return pbs.flatMap((pb, index) => {
		if (pb.game && pb.game !== "ongeki") {
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
				noteLamp: pb.scoreData?.noteLamp ?? "LOSS",
				bellLamp: pb.scoreData?.bellLamp ?? "NONE",
				platinumScore: pb.scoreData?.platinumScore ?? null,
				platinumScoreMax: chart?.data?.maxPlatScore ?? null,
				platinumStars: pb.scoreData?.platinumStars ?? null,
				timeAchieved: sanitizeTimeAchieved(pb.timeAchieved),
				judgements: sanitizeJudgements(pb.scoreData?.judgements),
				maxCombo: pb.scoreData?.optional?.maxCombo,
				damage: pb.scoreData?.optional?.damage ?? null,
				bellCount: pb.scoreData?.optional?.bellCount ?? null,
				totalBellCount: pb.scoreData?.optional?.totalBellCount ?? null
			}
		]
	})
}

export const parseKamaiFile = (content: string): OngekiKamaiImportScore[] => {
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

export function useKamaiImport(existingScores: OngekiExistingScore[]) {
	const inputRef = useRef<HTMLInputElement | null>(null)
	const [fileName, setFileName] = useState<string | null>(null)
	const [parsedScores, setParsedScores] = useState<OngekiKamaiImportScore[]>([])
	const [selectedKeys, setSelectedKeys] = useState<Record<string, boolean>>({})
	const [onlyShowReadyRows, setOnlyShowReadyRows] = useState(false)
	const [kamaiUsername, setKamaiUsername] = useState("")
	const [lastFetchedKamaiUsername, setLastFetchedKamaiUsername] = useState<string | null>(null)
	const [isFetchingKamai, setIsFetchingKamai] = useState(false)

	const { data: songs } = useOngekiSongs()
	const importMutation = useOngekiScoreImporter()

	const songMap = useMemo(() => {
		return new Map(((songs ?? []) as DB.OngekiStaticMusic[]).map(song => [`${song.songId}:${song.chartId}`, song]))
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
					techScoreMax: score.bestTechScoreMax ?? null,
					maxComboCount: score.bestMaxComboCount ?? null,
					isFullBell: score.bestIsFullBell ?? null,
					isFullCombo: score.bestIsFullCombo ?? null,
					isAllBreake: score.bestIsAllBreake ?? null,
					clearStatus: score.bestClearStatus ?? null,
					platinumScoreMax: score.bestPlatinumScoreMax ?? null,
					platinumScoreStar: score.bestPlatinumScoreStar ?? null
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
				toast.error("No Ongeki scores found in that file")
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
				`https://kamai.tachi.ac/api/v1/users/${encodeURIComponent(normalizedKamaiUsername)}/games/ongeki/Single/pbs/all`
			)

			if (!response.ok) {
				throw new Error(`Kamai returned ${response.status}`)
			}

			const content = await response.text()
			const scores = parseKamaiFile(content)

			if (scores.length === 0) {
				toast.error("No Ongeki scores found for that Kamai user")
				return
			}

			setFileName(`Kamai: ${normalizedKamaiUsername}`)
			setParsedScores(scores)
			setLastFetchedKamaiUsername(normalizedKamaiUsername)
			if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur()
			}
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
