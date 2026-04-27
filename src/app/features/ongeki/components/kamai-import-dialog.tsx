import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react"

import { Cloud, Download, FileUp, LoaderCircle, Upload } from "lucide-react"
import { DateTime } from "luxon"
import { toast } from "sonner"

import { useOngekiScoreImporter, useOngekiSongs } from "@/app/features/ongeki/hooks"
import { Button } from "@/app/shared/components/ui/button"
import { Checkbox } from "@/app/shared/components/ui/checkbox"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/app/shared/components/ui/dialog"
import { Input } from "@/app/shared/components/ui/input"
import type { DB, OngekiPlaylog } from "@/app/shared/types"
import { cn } from "@/app/shared/utils"
import { formatLevel } from "@/app/shared/utils/format-level"
import { getDifficultyFromOngekiChart } from "@/app/shared/utils/ongeki"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/shared/components/ui/tabs"

import type { OngekiKamaiImportScore } from "../hooks/use-score-importer"

type ImportedScorePreview = OngekiKamaiImportScore & {
	id: string
	title: string | null
	chartLevel: number | null
	status: "ready" | "best-update" | "duplicate" | "unknown-song" | "duplicate-in-file"
}

type OngekiExistingScore = OngekiPlaylog & {
	bestTechScoreMax?: number | null
	bestMaxComboCount?: number | null
	bestIsFullBell?: number | null
	bestIsFullCombo?: number | null
	bestIsAllBreake?: number | null
	bestClearStatus?: number | null
	bestPlatinumScoreMax?: number | null
	bestPlatinumScoreStar?: number | null
}

type ExistingBestScore = {
	techScoreMax: number | null
	maxComboCount: number | null
	isFullBell: number | null
	isFullCombo: number | null
	isAllBreake: number | null
	clearStatus: number | null
	platinumScoreMax: number | null
	platinumScoreStar: number | null
}

type KamaiChartDefinition = {
	chartID: string
	difficulty?: "BASIC" | "ADVANCED" | "EXPERT" | "MASTER" | "LUNATIC"
	data?: {
		inGameID?: number
		maxPlatScore?: number
	}
}

type KamaiPbScore = {
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

const KAMAI_DIFFICULTY_TO_CHART_ID: Record<string, OngekiKamaiImportScore["level"]> = {
	BASIC: 0,
	ADVANCED: 1,
	EXPERT: 2,
	MASTER: 3,
	LUNATIC: 10
}

const getDuplicateScoreKey = (score: { musicId: number; level: number; score: number }) =>
	`${score.musicId}:${score.level}:${score.score}`

const getPreviewRowId = (
	score: { musicId: number; level: number; score: number; timeAchieved?: number },
	index: number
) => `${getDuplicateScoreKey(score)}:${score.timeAchieved ?? 0}:${index}`

const getExistingPlaylogKey = (score: OngekiPlaylog) =>
	`${score.musicId ?? 0}:${score.chartId ?? score.level ?? -1}:${score.techScore ?? 0}`

const isImportableStatus = (status: ImportedScorePreview["status"]) => status === "ready" || status === "best-update"

const isScoreBestUpdate = (score: OngekiKamaiImportScore, best?: ExistingBestScore) => {
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

// Kamai PB exports may use null for missing play times. Omit the field so the
// importer sends the optional shape expected by the backend schema.
const sanitizeTimeAchieved = (value: unknown) => (typeof value === "number" ? value : undefined)

const sanitizeJudgements = (value: unknown): OngekiKamaiImportScore["judgements"] | undefined => {
	if (!value || typeof value !== "object") {
		return undefined
	}

	const judgements = value as Partial<Record<keyof NonNullable<OngekiKamaiImportScore["judgements"]>, unknown>>
	const keys: (keyof NonNullable<OngekiKamaiImportScore["judgements"]>)[] = ["cbreak", "break", "hit", "miss"]

	// Some exports include an empty judgements object. Drop it entirely instead of
	// forwarding a partial object that would fail request validation.
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

const normalizeExportScores = (scores: unknown[]): OngekiKamaiImportScore[] => {
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

const normalizeKamaiPbScores = (pbs: KamaiPbScore[], charts: KamaiChartDefinition[]): OngekiKamaiImportScore[] => {
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

const parseKamaiFile = (content: string): OngekiKamaiImportScore[] => {
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

export function OngekiKamaiImportDialog({ existingScores }: { existingScores: OngekiExistingScore[] }) {
	const inputRef = useRef<HTMLInputElement | null>(null)
	const [open, setOpen] = useState(false)
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

	useEffect(() => {
		const defaults = Object.fromEntries(previewRows.map(row => [row.id, isImportableStatus(row.status)]))
		setSelectedKeys(defaults)
	}, [previewRows])

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
			if (inputRef.current) {
				inputRef.current.value = ""
			}
			toast.success(`Fetched ${scores.length} Ongeki score${scores.length === 1 ? "" : "s"}`)
		} catch (error) {
			console.error("Kamai fetch error:", error)
			toast.error("Failed to fetch scores from Kamai")
		} finally {
			setIsFetchingKamai(false)
		}
	}

	const handleImport = async () => {
		if (selectedRows.length === 0) {
			toast.error("Select at least one score to import")
			return
		}

		try {
			const result = await importMutation.mutateAsync(
				selectedRows.map(row => ({
					musicId: row.musicId,
					level: row.level,
					score: row.score,
					noteLamp: row.noteLamp,
					bellLamp: row.bellLamp,
					platinumScore: row.platinumScore,
					platinumScoreMax: row.platinumScoreMax,
					platinumStars: row.platinumStars,
					timeAchieved: row.timeAchieved,
					judgements: row.judgements,
					maxCombo: row.maxCombo,
					damage: row.damage,
					bellCount: row.bellCount,
					totalBellCount: row.totalBellCount
				}))
			)

			const bestUpdatedCount = result.bestUpdatedCount ?? 0
			if ((result.importedCount > 0 || bestUpdatedCount > 0) && result.skippedCount === 0) {
				toast.success(
					`Imported ${result.importedCount} score${result.importedCount === 1 ? "" : "s"} and updated ${bestUpdatedCount} best record${bestUpdatedCount === 1 ? "" : "s"}`
				)
			} else if (result.importedCount > 0) {
				toast.success(
					`Imported ${result.importedCount} score${result.importedCount === 1 ? "" : "s"}, updated ${bestUpdatedCount} best record${bestUpdatedCount === 1 ? "" : "s"}, and skipped ${result.skippedCount}`
				)
			} else if (bestUpdatedCount > 0) {
				toast.success(`Updated ${bestUpdatedCount} best record${bestUpdatedCount === 1 ? "" : "s"}`)
			} else if (result.duplicateCount > 0 || result.missingSongCount > 0) {
				toast.error(
					`No scores imported. ${result.duplicateCount} duplicate${result.duplicateCount === 1 ? "" : "s"}, ${result.missingSongCount} missing song${result.missingSongCount === 1 ? "" : "s"}.`
				)
			} else {
				toast.error("No scores were imported")
			}
			setOpen(false)
			resetState()
		} catch (error) {
			console.error("Import error:", error)
			toast.error("Failed to import scores")
		}
	}

	const handlePrimaryAction = async () => {
		if (shouldFetchFromKamai) {
			await handleFetchFromKamai()
			return
		}

		await handleImport()
	}

	const primaryButtonDisabled = shouldFetchFromKamai
		? isFetchingKamai || importMutation.isPending
		: selectedRows.length === 0 || importMutation.isPending || isFetchingKamai

	return (
		<Dialog
			open={open}
			onOpenChange={nextOpen => {
				setOpen(nextOpen)
				if (!nextOpen) {
					resetState()
				}
			}}
		>
			<DialogTrigger asChild>
				<Button variant="ghost" size="sm" className="h-8 gap-2 rounded-lg text-xs font-medium hover:bg-emerald-500/20 hover:text-emerald-700 dark:hover:text-emerald-300">
					<Download className="h-3.5 w-3.5" />
					Import
				</Button>
			</DialogTrigger>
			<DialogContent
				className="bg-background w-[95vw] max-w-4xl h-[600px] rounded-xl !border-0 shadow-2xl outline-none flex flex-col p-0 overflow-hidden"
			>
				<div className="flex flex-col h-full p-6">
					<DialogHeader className="mb-4">
						<div className="flex items-center gap-3">
							<div>
								<DialogTitle className="text-xl">Import from Kamai</DialogTitle>
								<DialogDescription>Sync your scores from the cloud or a local file</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<div className="flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
						<Tabs defaultValue="file" className="w-full">
							<TabsList className="mb-4 w-full justify-start border-b border-border/50 bg-transparent p-0 h-auto">
								<TabsTrigger
									value="file"
									className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-pink-500 data-[state=active]:bg-transparent data-[state=active]:text-pink-500"
								>
									Import
								</TabsTrigger>
								<TabsTrigger
									value="remote"
									className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-pink-500 data-[state=active]:bg-transparent data-[state=active]:text-pink-500"
								>
									Download
								</TabsTrigger>
							</TabsList>

							<TabsContent value="file" className="mt-0 outline-none">
								<div className="border-border/50 bg-muted/20 transition-all flex min-h-32 flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-6 text-center">
									<input
										ref={inputRef}
										type="file"
										accept=".json,application/json"
										className="hidden"
										onChange={handleInputChange}
									/>
									<div className="mb-3 rounded-full bg-background p-3 shadow-sm">
										<FileUp className="h-6 w-6 text-muted-foreground" />
									</div>
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="border-pink-500/50 text-pink-500 hover:bg-pink-500/10 gap-2 font-semibold"
										onClick={() => inputRef.current?.click()}
									>
										Choose Kamai JSON
									</Button>
									<p className="mt-3 text-sm font-medium text-muted-foreground">{fileName ?? "No file selected"}</p>
								</div>
							</TabsContent>

							<TabsContent value="remote" className="mt-0 outline-none">
								<div className="space-y-4 rounded-xl border border-border/50 bg-muted/20 p-6">
									<div className="space-y-2">
										<Input
											value={kamaiUsername}
											onChange={event => setKamaiUsername(event.target.value)}
											onKeyDown={event => {
												if (event.key !== "Enter" || event.nativeEvent.isComposing || !shouldFetchFromKamai || isFetchingKamai)
													return
												event.preventDefault()
												void handleFetchFromKamai()
											}}
											placeholder="Enter Kamai player name..."
											className="bg-background border-border/50"
											name="ongeki-kamai-player"
											autoComplete="new-password"
											disabled={isFetchingKamai || importMutation.isPending}
										/>
										<p className="text-muted-foreground text-xs">
											Fetch your latest scores directly from Kamaitachi's servers.
										</p>
									</div>
									{shouldFetchFromKamai && (
										<Button
											onClick={handleFetchFromKamai}
											disabled={isFetchingKamai}
											className="w-full bg-pink-500 text-white hover:bg-pink-600"
										>
											{isFetchingKamai ? (
												<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
											) : (
												<Download className="mr-2 h-4 w-4" />
											)}
											Download Scores
										</Button>
									)}
								</div>
							</TabsContent>
						</Tabs>

						{previewRows.length > 0 && (
							<>
								<div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
									<div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl px-3 py-2 border border-emerald-500/20">
										<p className="text-[10px] font-bold uppercase opacity-70">Ready</p>
										<p className="text-lg font-bold">{summary.ready + summary.bestUpdate}</p>
									</div>
									<div className="bg-pink-500/10 text-pink-600 dark:text-pink-400 rounded-xl px-3 py-2 border border-pink-500/20">
										<p className="text-[10px] font-bold uppercase opacity-70">Selected</p>
										<p className="text-lg font-bold">{selectedRows.length}</p>
									</div>
									<div className="bg-muted/50 text-muted-foreground rounded-xl px-3 py-2 border border-border/50">
										<p className="text-[10px] font-bold uppercase opacity-70">Existing</p>
										<p className="text-lg font-bold">{summary.duplicate + summary.duplicateInFile}</p>
									</div>
									<div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl px-3 py-2 border border-rose-500/20">
										<p className="text-[10px] font-bold uppercase opacity-70">Missing</p>
										<p className="text-lg font-bold">{summary.unknownSong}</p>
									</div>
								</div>

								<div className="bg-muted/20 overflow-hidden rounded-xl border border-border/50">
									<div className="px-4 py-3 bg-muted/30 border-b border-border/50">
										<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
											<div>
												<p className="text-sm font-bold">Import Preview</p>
												<p className="text-muted-foreground text-[10px] uppercase tracking-wider">
													Review scores before final sync
												</p>
											</div>
											<label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
												<Checkbox
													checked={onlyShowReadyRows}
													onCheckedChange={checked => setOnlyShowReadyRows(checked === true)}
													className="data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
												/>
												Importable only
											</label>
										</div>
									</div>
									<div className="h-80 overflow-y-auto">
										<div className="divide-y divide-border/30">
											{visiblePreviewRows.map(row => (
												<label
													key={row.id}
													className={cn(
														"flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/50",
														isImportableStatus(row.status) && "bg-emerald-500/5 hover:bg-emerald-500/10"
													)}
												>
													{row.status === "unknown-song" || row.status === "duplicate-in-file" ? (
														<div className="size-4 shrink-0" />
													) : (
														<Checkbox
															checked={Boolean(selectedKeys[row.id])}
															disabled={!isImportableStatus(row.status)}
															onCheckedChange={checked =>
																setSelectedKeys(prev => ({ ...prev, [row.id]: checked === true }))
															}
															className="mt-1 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
														/>
													)}
													<div className="min-w-0 flex-1">
														<div className="flex flex-wrap items-center gap-2">
															<p className={cn("text-sm font-bold", getPreviewTextClassName(row.status))}>
																{row.title ?? `Song ${row.musicId}`}
															</p>
															<span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase border border-current", getPreviewMetaClassName(row.status))}>
																{getDifficultyFromOngekiChart(row.level)}
																{row.chartLevel != null ? ` ${formatLevel(row.chartLevel)}` : ""}
															</span>
														</div>
														<div className={cn("mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-70", getPreviewMetaClassName(row.status))}>
															<span className="font-mono">{row.score.toLocaleString()}</span>
															<span>{row.noteLamp}</span>
															<span>{row.bellLamp}</span>
															{row.platinumScore != null && <span>Plat {row.platinumScore}</span>}
															{row.timeAchieved ? (
																<span className="tabular-nums">{DateTime.fromMillis(row.timeAchieved).toFormat("yyyy-LL-dd HH:mm")}</span>
															) : (
																<span>No play time</span>
															)}
														</div>
													</div>
													<div className="text-[10px] font-bold uppercase tracking-widest pt-1">
														{row.status === "ready" && <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Ready</span>}
														{row.status === "best-update" && <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">Update</span>}
														{row.status === "duplicate" && <span className="text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Synced</span>}
														{row.status === "duplicate-in-file" && (
															<span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">Duplicate</span>
														)}
														{row.status === "unknown-song" && <span className="text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">Missing</span>}
													</div>
												</label>
											))}
										</div>
									</div>
								</div>
							</>
						)}
					</div>

					<DialogFooter className="mt-2">
						<Button
							variant="ghost"
							onClick={() => setOpen(false)}
							disabled={importMutation.isPending || isFetchingKamai}
							className="hover:bg-muted"
						>
							Cancel
						</Button>
						<Button
							onClick={handlePrimaryAction}
							disabled={primaryButtonDisabled}
							className="bg-pink-500 text-white hover:bg-pink-600 min-w-32"
						>
							{isFetchingKamai ? (
								<>
									<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
									Syncing...
								</>
							) : shouldFetchFromKamai ? (
								<>
									<Download className="mr-2 h-4 w-4" />
									Fetch
								</>
							) : importMutation.isPending ? (
								<>
									<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
									Importing...
								</>
							) : (
								<>
									<Download className="mr-2 h-4 w-4" />
									Import {selectedRows.length > 0 ? selectedRows.length : ""}
								</>
							)}
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	)
}
