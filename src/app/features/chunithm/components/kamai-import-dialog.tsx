import { useState } from "react"

import { Download, FileUp, LoaderCircle } from "lucide-react"
import { DateTime } from "luxon"
import { toast } from "sonner"

import { Button } from "@/app/shared/components/ui/button"
import { Checkbox } from "@/app/shared/components/ui/checkbox"
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/app/shared/components/ui/dialog"
import { Input } from "@/app/shared/components/ui/input"
import { cn, getDifficultyFromChunithmChart } from "@/app/shared/utils"
import { formatLevel } from "@/app/shared/utils/format-level"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/shared/components/ui/tabs"

import {
	useKamaiImport,
	isImportableStatus,
	type ChunithmExistingScore
} from "../hooks/use-kamai-import"

export function ChunithmKamaiImportDialog({ existingScores }: { existingScores: ChunithmExistingScore[] }) {
	const [open, setOpen] = useState(false)
	const {
		inputRef,
		fileName,
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
		handleInputChange,
		handleFetchFromKamai
	} = useKamaiImport(existingScores)

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
											name="chunithm-kamai-player"
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
																{getDifficultyFromChunithmChart(row.level)}
																{row.chartLevel != null ? ` ${formatLevel(row.chartLevel)}` : ""}
															</span>
														</div>
														<div className={cn("mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-70", getPreviewMetaClassName(row.status))}>
															<span className="font-mono">{row.score.toLocaleString()}</span>
															<span>{row.noteLamp}</span>
															<span>{row.clearLamp}</span>
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
