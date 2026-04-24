import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react"

import { Download, FileUp, LoaderCircle, Upload } from "lucide-react"
import { DateTime } from "luxon"
import { toast } from "sonner"

import { useChunithmSongs, useScoreImporter } from "@/app/features/chunithm/hooks"
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
import type { ChunithmPlaylog, DB } from "@/app/shared/types"
import { cn, getDifficultyFromChunithmChart } from "@/app/shared/utils"
import { formatLevel } from "@/app/shared/utils/format-level"

import type { ChunithmKamaiImportScore } from "../hooks/use-score-importer"

type ImportedScorePreview = ChunithmKamaiImportScore & {
	id: string
	title: string | null
	chartLevel: number | null
	status: "ready" | "best-update" | "duplicate" | "unknown-song" | "duplicate-in-file"
}

type ChunithmExistingScore = ChunithmPlaylog & {
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

const getPlaylogKey = (score: { musicId: number; level: number; score: number; timeAchieved?: number }) =>
	`${score.musicId}:${score.level}:${score.score}:${score.timeAchieved ?? 0}`

const getExistingPlaylogKey = (score: ChunithmPlaylog) => {
	const millis = score.userPlayDate ? DateTime.fromSQL(score.userPlayDate, { zone: "Asia/Tokyo" }).toMillis() : 0
	return `${score.musicId ?? 0}:${score.chartId ?? score.level ?? -1}:${score.score ?? 0}:${millis || 0}`
}

const isImportableStatus = (status: ImportedScorePreview["status"]) => status === "ready" || status === "best-update"

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

export function ChunithmKamaiImportDialog({ existingScores }: { existingScores: ChunithmExistingScore[] }) {
	const inputRef = useRef<HTMLInputElement | null>(null)
	const [open, setOpen] = useState(false)
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
					missCount: score.bestMissCount ?? null,
					maxComboCount: score.bestMaxComboCount ?? null,
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
			const scoreKey = getPlaylogKey(score)
			let status: ImportedScorePreview["status"] = "ready"

			if (!song) {
				status = "unknown-song"
			} else if (existingScoreKeys.has(scoreKey)) {
				status = isScoreBestUpdate(score, existingBestMap.get(`${score.musicId}:${score.level}`))
					? "best-update"
					: "duplicate"
			} else if (fileSeenKeys.has(scoreKey)) {
				status = "duplicate-in-file"
			}

			fileSeenKeys.add(scoreKey)

			return {
				...score,
				id: `${scoreKey}:${index}`,
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
					clearLamp: row.clearLamp,
					timeAchieved: row.timeAchieved,
					judgements: row.judgements,
					maxCombo: row.maxCombo
				}))
			)

			const bestUpdatedCount = result.bestUpdatedCount ?? 0
			toast.success(
				`Imported ${result.importedCount} score${result.importedCount === 1 ? "" : "s"} and updated ${bestUpdatedCount} best record${bestUpdatedCount === 1 ? "" : "s"}`
			)
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
				<Button variant="outline" size="sm" className="gap-2">
					<Download className="h-4 w-4" />
					Import from Kamai
				</Button>
			</DialogTrigger>
			<DialogContent
				className="bg-background max-w-4xl rounded-lg !border-0 shadow-2xl outline-none focus:outline-none focus-visible:ring-0"
				onInteractOutside={event => event.preventDefault()}
			>
				<DialogHeader>
					<DialogTitle>Import from Kamai</DialogTitle>
					<DialogDescription>Choose a Kamai JSON file to upload.</DialogDescription>
				</DialogHeader>

				<div className="border-border/70 bg-background/40 flex min-h-28 flex-col items-center justify-center rounded-lg border px-6 py-6 text-center">
					<input
						ref={inputRef}
						type="file"
						accept=".json,application/json"
						className="hidden"
						onChange={handleInputChange}
					/>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="border-primary/60 text-primary hover:bg-primary/10 gap-2 font-semibold"
						onClick={() => inputRef.current?.click()}
					>
						<FileUp className="h-4 w-4" />
						Choose Kamai JSON
					</Button>
					<p className="mt-3 text-sm font-medium">{fileName ?? "No file selected"}</p>
				</div>

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
						placeholder="Kamai player name"
						name="chunithm-kamai-player"
						autoComplete="new-password"
						autoCapitalize="none"
						autoCorrect="off"
						spellCheck={false}
						data-bwignore="true"
						data-lpignore="true"
						data-1p-ignore="true"
						disabled={isFetchingKamai || importMutation.isPending}
					/>
					<p className="text-muted-foreground text-xs">
						Enter your Kamai username to download scores instead of uploading a file.
					</p>
				</div>

				{previewRows.length > 0 && (
					<>
						<div className="grid gap-2 text-sm sm:grid-cols-4">
							<div className="bg-muted rounded-md px-3 py-2">Ready: {summary.ready + summary.bestUpdate}</div>
							<div className="bg-muted rounded-md px-3 py-2">Selected: {selectedRows.length}</div>
							<div className="bg-muted rounded-md px-3 py-2">
								Existing: {summary.duplicate + summary.duplicateInFile}
							</div>
							<div className="bg-muted rounded-md px-3 py-2">Unknown songs: {summary.unknownSong}</div>
						</div>

						<div className="bg-muted overflow-hidden rounded-lg">
							<div className="px-4 py-3">
								<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
									<div>
										<p className="text-sm font-medium">Preview</p>
										<p className="text-muted-foreground text-xs">
											Checked ready rows append playlogs; checked best-update rows sync improved best records.
										</p>
									</div>
									<label className="flex items-center gap-2 text-xs font-medium">
										<Checkbox
											checked={onlyShowReadyRows}
											onCheckedChange={checked => setOnlyShowReadyRows(checked === true)}
										/>
										Only show importable songs
									</label>
								</div>
							</div>
							<div className="h-80 overflow-y-auto">
								<div className="divide-y">
									{visiblePreviewRows.map(row => (
										<label
											key={row.id}
											className={cn(
												"flex items-start gap-3 px-4 py-3 transition-colors",
												isImportableStatus(row.status) && "bg-accent"
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
												/>
											)}
											<div className="min-w-0 flex-1">
												<div className="flex flex-wrap items-center gap-2">
													<p className={cn("text-sm font-semibold", getPreviewTextClassName(row.status))}>
														{row.title ?? `Song ${row.musicId}`}
													</p>
													<span className={cn("text-xs", getPreviewMetaClassName(row.status))}>
														{getDifficultyFromChunithmChart(row.level)}
														{row.chartLevel != null ? ` ${formatLevel(row.chartLevel)}` : ""}
													</span>
													<span className={cn("text-xs", getPreviewMetaClassName(row.status))}>ID {row.musicId}</span>
												</div>
												<div className={cn("mt-1 flex flex-wrap gap-3 text-xs", getPreviewMetaClassName(row.status))}>
													<span>{row.score.toLocaleString()}</span>
													<span>{row.noteLamp}</span>
													<span>{row.clearLamp}</span>
													{row.timeAchieved ? (
														<span>{DateTime.fromMillis(row.timeAchieved).toFormat("yyyy-LL-dd HH:mm")}</span>
													) : (
														<span>No play time</span>
													)}
												</div>
											</div>
											<div className="text-xs font-medium">
												{row.status === "ready" && <span className="text-emerald-600">Ready</span>}
												{row.status === "best-update" && <span className="text-amber-600">Best update only</span>}
												{row.status === "duplicate" && <span className="text-muted-foreground">Already synced</span>}
												{row.status === "duplicate-in-file" && (
													<span className="text-amber-600">Duplicate in file</span>
												)}
												{row.status === "unknown-song" && <span className="text-rose-600">Song not found</span>}
											</div>
										</label>
									))}
								</div>
							</div>
						</div>
					</>
				)}

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={importMutation.isPending || isFetchingKamai}
					>
						Cancel
					</Button>
					<Button onClick={handlePrimaryAction} disabled={primaryButtonDisabled}>
						{isFetchingKamai ? (
							<>
								<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
								Fetching...
							</>
						) : shouldFetchFromKamai ? (
							<>
								<Download className="mr-1 h-4 w-4" />
								Download
							</>
						) : importMutation.isPending ? (
							<>
								<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
								Importing...
							</>
						) : (
							<>
								<Upload className="mr-2 h-4 w-4" />
								Import Selected
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
