import { useRef, useState } from "react"

import { useVirtualizer } from "@tanstack/react-virtual"
import { DateTime } from "luxon"
import { Download, FileUp, LoaderCircle } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/shared/components/ui/tabs"
import { cn } from "@/app/shared/utils"
import { formatLevel } from "@/app/shared/utils/format-level"
import { getDifficultyFromOngekiChart } from "@/app/shared/utils/ongeki"

import { isImportableStatus, type OngekiExistingScore, useKamaiImport } from "../hooks/use-kamai-import"

export function OngekiKamaiImportDialog({ existingScores }: { existingScores: OngekiExistingScore[] }) {
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
		uploadKamaiFile,
		fetchRemoteScores
	} = useKamaiImport(existingScores)
	return (
		<OngekiKamaiImportDialogView
			open={open}
			setOpen={setOpen}
			fileName={fileName}
			inputRef={inputRef}
			selectedKeys={selectedKeys}
			setSelectedKeys={setSelectedKeys}
			onlyShowReadyRows={onlyShowReadyRows}
			setOnlyShowReadyRows={setOnlyShowReadyRows}
			kamaiUsername={kamaiUsername}
			setKamaiUsername={setKamaiUsername}
			isFetchingKamai={isFetchingKamai}
			shouldFetchFromKamai={shouldFetchFromKamai}
			previewRows={previewRows}
			selectedRows={selectedRows}
			visiblePreviewRows={visiblePreviewRows}
			summary={summary}
			importMutation={importMutation}
			getPreviewTextClassName={getPreviewTextClassName}
			getPreviewMetaClassName={getPreviewMetaClassName}
			resetState={resetState}
			uploadKamaiFile={uploadKamaiFile}
			fetchRemoteScores={fetchRemoteScores}
		/>
	)
}

function OngekiKamaiImportDialogView({
	open,
	setOpen,
	fileName,
	inputRef,
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
	uploadKamaiFile,
	fetchRemoteScores
}: any) {



	const syncKamaiScores = async () => {
		if (selectedRows.length === 0) {
			toast.error("Select at least one score to import")
			return
		}

		try {
			const result = await importMutation.mutateAsync(
				selectedRows.map((row: any) => ({
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

	const executeImportAction = async () => {
		if (shouldFetchFromKamai) {
			await fetchRemoteScores()
			return
		}

		await syncKamaiScores()
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
				<Button
					variant="ghost"
					size="sm"
					className="h-8 gap-2 rounded-lg text-xs font-medium hover:bg-emerald-500/20 hover:text-emerald-700 dark:hover:text-emerald-300"
				>
					<Download className="h-3.5 w-3.5" />
					Import
				</Button>
			</DialogTrigger>
			<DialogContent className="bg-background w-[95vw] max-w-4xl h-[750px] rounded-xl border border-border shadow-2xl outline-none flex flex-col p-0 overflow-hidden">
				<div className="flex flex-col h-full p-8">
					<DialogHeader className="mb-6">
						<div className="flex items-center gap-4">
							<div className="bg-muted p-2.5 rounded-lg border border-border">
								<Download className="h-5 w-5 text-muted-foreground" />
							</div>
							<div>
								<DialogTitle className="text-xl font-bold tracking-tight text-foreground">Import from Kamai</DialogTitle>
								<p className="text-muted-foreground text-sm">Synchronize your records from Kamaitachi</p>
							</div>
						</div>
					</DialogHeader>

					<div className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar space-y-8">
						<Tabs defaultValue="file" className="w-full">
							<TabsList className="mb-6 w-full justify-start border-b border-border bg-transparent p-0 h-auto gap-8">
								<TabsTrigger
									value="file"
									className="rounded-none border-b-2 border-transparent px-2 py-3 text-sm font-medium text-muted-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground transition-all"
								>
									File Upload
								</TabsTrigger>
								<TabsTrigger
									value="remote"
									className="rounded-none border-b-2 border-transparent px-2 py-3 text-sm font-medium text-muted-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground transition-all"
								>
									Remote Fetch
								</TabsTrigger>
							</TabsList>

							<TabsContent value="file" className="mt-0 outline-none">
								<div className="border-border bg-muted/20 transition-all flex min-h-40 flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center hover:bg-muted/30 group">
									<Input
										ref={inputRef}
										type="file"
										accept=".json,application/json"
										className="hidden"
										onChange={uploadKamaiFile}
									/>
									<div className="mb-4 rounded-xl bg-background p-4 border border-border shadow-sm group-hover:scale-105 transition-transform">
										<FileUp className="h-8 w-8 text-muted-foreground" />
									</div>
									<Button
										type="button"
										variant="outline"
										size="default"
										className="gap-2 font-semibold px-6 h-11 rounded-lg"
										onClick={() => inputRef.current?.click()}
									>
										Choose Kamai JSON
									</Button>
									<p className="mt-4 text-xs font-medium text-muted-foreground truncate max-w-md italic">
										{fileName ?? "Select a JSON export from Kamaitachi"}
									</p>
								</div>
							</TabsContent>

							<TabsContent value="remote" className="mt-0 outline-none">
								<div className="space-y-6 rounded-xl border border-border bg-muted/20 p-8">
									<div className="space-y-4">
										<label htmlFor="ongeki-kamai-username" className="text-sm font-semibold px-1 block text-foreground/80">Kamaitachi Username</label>
										<Input
											id="ongeki-kamai-username"
											value={kamaiUsername}
											onChange={event => setKamaiUsername(event.target.value)}
											onKeyDown={event => {
												if (event.key !== "Enter" || event.nativeEvent.isComposing || !shouldFetchFromKamai || isFetchingKamai)
													return
												event.preventDefault()
												void fetchRemoteScores()
											}}
											placeholder="e.g. PlayerName"
											className="bg-background border-border h-11 px-4 rounded-lg text-sm shadow-sm"
											name="ongeki-kamai-player"
											autoComplete="new-password"
											disabled={isFetchingKamai || importMutation.isPending}
										/>
										<p className="text-muted-foreground text-xs px-1 leading-relaxed italic">
											Your scores will be fetched directly via the Kamaitachi API.
										</p>
									</div>
									{shouldFetchFromKamai && (
										<Button
											onClick={fetchRemoteScores}
											disabled={isFetchingKamai}
											className="w-full bg-foreground text-background hover:bg-foreground/90 h-11 rounded-lg font-bold shadow-sm"
										>
											{isFetchingKamai ? (
												<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
											) : (
												<Download className="mr-2 h-4 w-4" />
											)}
											Download Latest Scores
										</Button>
									)}
								</div>
							</TabsContent>
						</Tabs>

						{previewRows.length > 0 && (
							<div className="space-y-6">
								<ImportSummary summary={summary} selectedCount={selectedRows.length} />
								<ImportPreview
									visiblePreviewRows={visiblePreviewRows}
									selectedKeys={selectedKeys}
									setSelectedKeys={setSelectedKeys}
									onlyShowReadyRows={onlyShowReadyRows}
									setOnlyShowReadyRows={setOnlyShowReadyRows}
									getPreviewTextClassName={getPreviewTextClassName}
									getPreviewMetaClassName={getPreviewMetaClassName}
								/>
							</div>
						)}
					</div>

					<DialogFooter className="mt-8 pt-6 border-t border-border/50">
						<Button
							variant="ghost"
							size="lg"
							onClick={() => setOpen(false)}
							disabled={importMutation.isPending || isFetchingKamai}
							className="hover:bg-muted font-bold text-muted-foreground px-8 rounded-lg"
						>
							Cancel
						</Button>
						<Button
							onClick={executeImportAction}
							disabled={primaryButtonDisabled}
							size="lg"
							className="bg-foreground text-background hover:bg-foreground/90 min-w-[160px] font-bold rounded-lg shadow-sm px-8"
						>
							{isFetchingKamai ? (
								<>
									<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
									Fetching…
								</>
							) : shouldFetchFromKamai ? (
								<>
									<Download className="mr-2 h-4 w-4" />
									Download
								</>
							) : importMutation.isPending ? (
								<>
									<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
									Importing…
								</>
							) : (
								<>
									<Download className="mr-2 h-4 w-4" />
									Sync {selectedRows.length > 0 ? `${selectedRows.length}` : ""}
								</>
							)}
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	)
}

function ImportSummary({ summary, selectedCount }: any) {
	return (
		<div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
			<div className="bg-muted/40 rounded-xl px-5 py-4 border border-border shadow-sm">
				<p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ready</p>
				<p className="text-xl font-bold mt-1 text-foreground">{summary.ready + summary.bestUpdate}</p>
			</div>
			<div className="bg-muted/40 rounded-xl px-5 py-4 border border-border shadow-sm">
				<p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Selected</p>
				<p className="text-xl font-bold mt-1 text-foreground">{selectedCount}</p>
			</div>
			<div className="bg-muted/40 rounded-xl px-5 py-4 border border-border shadow-sm">
				<p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Synced</p>
				<p className="text-xl font-bold mt-1 text-foreground">{summary.duplicate + summary.duplicateInFile}</p>
			</div>
			<div className="bg-muted/40 rounded-xl px-5 py-4 border border-border shadow-sm">
				<p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Missing</p>
				<p className="text-xl font-bold mt-1 text-foreground">{summary.unknownSong}</p>
			</div>
		</div>
	)
}

function ImportPreview({
	visiblePreviewRows,
	selectedKeys,
	setSelectedKeys,
	onlyShowReadyRows,
	setOnlyShowReadyRows,
	getPreviewTextClassName,
	getPreviewMetaClassName
}: any) {
	const parentRef = useRef<HTMLDivElement>(null)

	const rowVirtualizer = useVirtualizer({
		count: visiblePreviewRows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 92,
		getItemKey: index => visiblePreviewRows[index].id,
		overscan: 5
	})

	return (
		<div className="bg-card overflow-hidden rounded-xl border border-border shadow-sm">
			<div className="px-6 py-4 bg-muted/30 border-b border-border">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-sm font-bold text-foreground">Import Preview</p>
						<p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mt-0.5">
							Review changes before synchronizing
						</p>
					</div>
					<label htmlFor="ongeki-only-ready" className="flex items-center gap-3 text-xs font-semibold cursor-pointer bg-background/50 px-3 py-2 rounded-lg border border-border hover:bg-background transition-colors">
						<Checkbox
							id="ongeki-only-ready"
							checked={onlyShowReadyRows}
							onCheckedChange={checked => setOnlyShowReadyRows(checked === true)}
							className="data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
						/>
						Show Importable Only
					</label>
				</div>
			</div>
			<div ref={parentRef} className="h-[320px] overflow-y-auto custom-scrollbar">
				<div
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
						width: "100%",
						position: "relative"
					}}
				>
					{rowVirtualizer.getVirtualItems().map(virtualItem => {
						const row = visiblePreviewRows[virtualItem.index]
						return (
							<label
								key={virtualItem.key}
								data-index={virtualItem.index}
								ref={rowVirtualizer.measureElement}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									transform: `translateY(${virtualItem.start}px)`
								}}
								className={cn(
									"flex items-start gap-5 px-6 py-5 transition-colors hover:bg-muted/50 cursor-pointer border-b border-border/50 last:border-0",
									isImportableStatus(row.status) && "bg-muted/10 hover:bg-muted/20"
								)}
							>
								<div className="pt-1">
									{row.status === "unknown-song" || row.status === "duplicate-in-file" ? (
										<div className="size-5 shrink-0" />
									) : (
										<Checkbox
											checked={Boolean(selectedKeys[row.id])}
											disabled={!isImportableStatus(row.status)}
											onCheckedChange={checked => setSelectedKeys((prev: any) => ({ ...prev, [row.id]: checked === true }))}
											className="size-5 rounded-md data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
										/>
									)}
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-3">
										<p className={cn("text-base font-bold leading-tight", getPreviewTextClassName(row.status))}>
											{row.title ?? `Song ${row.musicId}`}
										</p>
										<span
											className={cn(
												"rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase border-2",
												getPreviewMetaClassName(row.status)
											)}
										>
											{getDifficultyFromOngekiChart(row.level)}
											{row.chartLevel != null ? ` ${formatLevel(row.chartLevel)}` : ""}
										</span>
									</div>
									<div
										className={cn(
											"mt-2.5 flex flex-wrap gap-x-6 gap-y-1.5 text-xs font-medium opacity-80 tabular-nums",
											getPreviewMetaClassName(row.status)
										)}
									>
										<span className="font-bold">{row.score.toLocaleString()}</span>
										<span className="opacity-50">•</span>
										<span>{row.noteLamp}</span>
										<span className="opacity-50">•</span>
										<span>{row.bellLamp}</span>
										<span className="opacity-50">•</span>
										{row.timeAchieved ? (
											<span>{DateTime.fromMillis(row.timeAchieved).toFormat("yyyy-LL-dd HH:mm")}</span>
										) : (
											<span className="italic opacity-60">No timestamp</span>
										)}
									</div>
								</div>
								<div className="shrink-0 pt-0.5">
									{row.status === "ready" && (
										<span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground bg-muted px-2.5 py-1 rounded-md border border-border shadow-sm">
											Ready
										</span>
									)}
									{row.status === "best-update" && (
										<span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 shadow-sm">
											PB
										</span>
									)}
									{row.status === "duplicate" && (
										<span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60 bg-muted/40 px-2.5 py-1 rounded-md border border-border/50">
											Synced
										</span>
									)}
									{row.status === "duplicate-in-file" && (
										<span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 shadow-sm">
											Duplicate
										</span>
									)}
									{row.status === "unknown-song" && (
										<span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20 shadow-sm">
											Missing
										</span>
									)}
								</div>
							</label>
						)
					})}
				</div>
			</div>
		</div>
	)
}
