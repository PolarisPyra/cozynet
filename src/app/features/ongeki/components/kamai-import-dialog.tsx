import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react"

import { Download, FileUp, LoaderCircle, Upload } from "lucide-react"
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
import type { DB, OngekiPlaylog } from "@/app/shared/types"
import { cn } from "@/app/shared/utils"
import { formatLevel } from "@/app/shared/utils/format-level"
import { getDifficultyFromOngekiChart } from "@/app/shared/utils/ongeki"

import type { OngekiKamaiImportScore } from "../hooks/use-score-importer"

type ImportedScorePreview = OngekiKamaiImportScore & {
	id: string
	title: string | null
	chartLevel: number | null
	status: "ready" | "duplicate" | "unknown-song" | "duplicate-in-file"
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
	timeAchieved?: number
	scoreData?: {
		score?: number
		noteLamp?: OngekiKamaiImportScore["noteLamp"]
		bellLamp?: OngekiKamaiImportScore["bellLamp"]
		platinumScore?: number | null
		platinumStars?: number | null
		judgements?: OngekiKamaiImportScore["judgements"]
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
				timeAchieved: score.timeAchieved,
				judgements: score.judgements,
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
				timeAchieved: pb.timeAchieved,
				judgements: pb.scoreData?.judgements,
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

export function OngekiKamaiImportDialog({ existingScores }: { existingScores: OngekiPlaylog[] }) {
	const inputRef = useRef<HTMLInputElement | null>(null)
	const [open, setOpen] = useState(false)
	const [isDragActive, setIsDragActive] = useState(false)
	const [fileName, setFileName] = useState<string | null>(null)
	const [parsedScores, setParsedScores] = useState<OngekiKamaiImportScore[]>([])
	const [selectedKeys, setSelectedKeys] = useState<Record<string, boolean>>({})

	const { data: songs } = useOngekiSongs()
	const importMutation = useOngekiScoreImporter()

	const songMap = useMemo(() => {
		return new Map(((songs ?? []) as DB.OngekiStaticMusic[]).map(song => [`${song.songId}:${song.chartId}`, song]))
	}, [songs])

	const existingScoreKeys = useMemo(() => new Set(existingScores.map(getExistingPlaylogKey)), [existingScores])

	const previewRows = useMemo<ImportedScorePreview[]>(() => {
		const fileSeenKeys = new Set<string>()

		return parsedScores.map((score, index) => {
			const song = songMap.get(`${score.musicId}:${score.level}`)
			const duplicateKey = getDuplicateScoreKey(score)
			let status: ImportedScorePreview["status"] = "ready"

			if (!song) {
				status = "unknown-song"
			} else if (existingScoreKeys.has(duplicateKey)) {
				status = "duplicate"
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
	}, [existingScoreKeys, parsedScores, songMap])

	useEffect(() => {
		const defaults = Object.fromEntries(previewRows.map(row => [row.id, row.status === "ready"]))
		setSelectedKeys(defaults)
	}, [previewRows])

	const selectedRows = useMemo(
		() => previewRows.filter(row => row.status === "ready" && selectedKeys[row.id]),
		[previewRows, selectedKeys]
	)

	const summary = useMemo(
		() => ({
			ready: previewRows.filter(row => row.status === "ready").length,
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
		setIsDragActive(false)
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

	const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault()
		setIsDragActive(false)
		const file = event.dataTransfer.files?.[0]
		if (!file) return
		await handleFile(file)
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

			if (result.importedCount > 0 && result.skippedCount === 0) {
				toast.success(`Imported ${result.importedCount} score${result.importedCount === 1 ? "" : "s"}`)
			} else if (result.importedCount > 0) {
				toast.success(
					`Imported ${result.importedCount} score${result.importedCount === 1 ? "" : "s"} and skipped ${result.skippedCount}`
				)
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
			<DialogContent className="max-w-4xl">
				<DialogHeader>
					<DialogTitle>Import from Kamai</DialogTitle>
					<DialogDescription>
						Upload a Kamai JSON file, review the appended Ongeki scores, and confirm which rows to import into your
						`ongeki_score_playlog`.
					</DialogDescription>
				</DialogHeader>

				<div
					className={cn(
						"border-border bg-muted/20 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-8 text-center transition-colors",
						isDragActive && "border-primary bg-primary/5"
					)}
					onClick={() => inputRef.current?.click()}
					onDragOver={event => {
						event.preventDefault()
						setIsDragActive(true)
					}}
					onDragLeave={() => setIsDragActive(false)}
					onDrop={handleDrop}
				>
					<input
						ref={inputRef}
						type="file"
						accept=".json,application/json"
						className="hidden"
						onChange={handleInputChange}
					/>
					<div className="bg-background mb-3 rounded-full border p-3">
						<FileUp className="h-5 w-5" />
					</div>
					<p className="text-sm font-medium">{fileName ?? "Drag and drop a Kamai JSON here"}</p>
					<p className="text-muted-foreground mt-1 text-xs">
						or click to browse for `ongekiall.json` or an export file
					</p>
				</div>

				{previewRows.length > 0 && (
					<>
						<div className="grid gap-2 text-sm sm:grid-cols-4">
							<div className="bg-muted/40 rounded-md border px-3 py-2">Ready: {summary.ready}</div>
							<div className="bg-muted/40 rounded-md border px-3 py-2">Selected: {selectedRows.length}</div>
							<div className="bg-muted/40 rounded-md border px-3 py-2">
								Existing: {summary.duplicate + summary.duplicateInFile}
							</div>
							<div className="bg-muted/40 rounded-md border px-3 py-2">Unknown songs: {summary.unknownSong}</div>
						</div>

						<div className="rounded-lg border">
							<div className="border-b px-4 py-3">
								<p className="text-sm font-medium">Preview</p>
								<p className="text-muted-foreground text-xs">Only checked rows with a ready status will be imported.</p>
							</div>
							<div className="h-80 overflow-y-auto">
								<div className="divide-y">
									{previewRows.map(row => (
										<label
											key={row.id}
											className={cn("flex items-start gap-3 px-4 py-3", row.status !== "ready" && "opacity-60")}
										>
											<Checkbox
												checked={Boolean(selectedKeys[row.id])}
												disabled={row.status !== "ready"}
												onCheckedChange={checked => setSelectedKeys(prev => ({ ...prev, [row.id]: checked === true }))}
											/>
											<div className="min-w-0 flex-1">
												<div className="flex flex-wrap items-center gap-2">
													<p className="text-sm font-medium">{row.title ?? `Song ${row.musicId}`}</p>
													<span className="text-muted-foreground text-xs">
														{getDifficultyFromOngekiChart(row.level)}
														{row.chartLevel != null ? ` ${formatLevel(row.chartLevel)}` : ""}
													</span>
													<span className="text-muted-foreground text-xs">ID {row.musicId}</span>
												</div>
												<div className="text-muted-foreground mt-1 flex flex-wrap gap-3 text-xs">
													<span>{row.score.toLocaleString()}</span>
													<span>{row.noteLamp}</span>
													<span>{row.bellLamp}</span>
													{row.platinumScore != null && <span>Plat {row.platinumScore}</span>}
													{row.timeAchieved ? (
														<span>{DateTime.fromMillis(row.timeAchieved).toFormat("yyyy-LL-dd HH:mm")}</span>
													) : (
														<span>No play time</span>
													)}
												</div>
											</div>
											<div className="text-xs font-medium">
												{row.status === "ready" && <span className="text-emerald-600">Ready</span>}
												{row.status === "duplicate" && <span className="text-amber-600">Already imported</span>}
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
					<Button variant="outline" onClick={() => setOpen(false)} disabled={importMutation.isPending}>
						Cancel
					</Button>
					<Button onClick={handleImport} disabled={selectedRows.length === 0 || importMutation.isPending}>
						{importMutation.isPending ? (
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
