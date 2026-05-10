import { type ReactNode, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { DateTime } from "luxon";
import { Download, FileUp, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/app/shared/components/ui/button";
import { Checkbox } from "@/app/shared/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/shared/components/ui/dialog";
import { Input } from "@/app/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/shared/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/shared/components/ui/tabs";
import { cn } from "@/app/shared/utils";
import { formatLevel } from "@/app/shared/utils/format-level";
import { getDifficultyFromOngekiChart } from "@/app/shared/utils/ongeki";

import {
  isImportableStatus,
  type OngekiExistingScore,
  useKamaiImport,
} from "../hooks/use-kamai-import";

const surfaceClassName =
  "border border-white/[0.08] bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]";
const labelClassName =
  "text-[10px] font-black uppercase leading-none tracking-[0.22em] text-muted-foreground";

export function OngekiKamaiImportDialog({
  existingScores,
}: {
  existingScores: OngekiExistingScore[];
}) {
  const [open, setOpen] = useState(false);
  const kamaiImport = useKamaiImport(existingScores);

  return (
    <OngekiKamaiImportDialogView
      open={open}
      setOpen={setOpen}
      {...kamaiImport}
    />
  );
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
  sortOrder,
  setSortOrder,
  toggleSelectAll,
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
  fetchRemoteScores,
}: any) {
  const closeDialog = () => {
    setOpen(false);
  };

  const syncKamaiScores = async () => {
    if (selectedRows.length === 0) {
      toast.error("Select at least one score to import");
      return;
    }

    try {
      const result = await importMutation.mutateAsync(
        selectedRows.map((row: any) => ({
          songId: row.songId,
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
          totalBellCount: row.totalBellCount,
        })),
      );

      const bestUpdatedCount = result.bestUpdatedCount ?? 0;

      if (
        (result.importedCount > 0 || bestUpdatedCount > 0) &&
        result.skippedCount === 0
      ) {
        toast.success(
          `Imported ${result.importedCount} score${result.importedCount === 1 ? "" : "s"} and updated ${bestUpdatedCount} best record${bestUpdatedCount === 1 ? "" : "s"}`,
        );
      } else if (result.importedCount > 0) {
        toast.success(
          `Imported ${result.importedCount} score${result.importedCount === 1 ? "" : "s"}, updated ${bestUpdatedCount} best record${bestUpdatedCount === 1 ? "" : "s"}, and skipped ${result.skippedCount}`,
        );
      } else if (bestUpdatedCount > 0) {
        toast.success(
          `Updated ${bestUpdatedCount} best record${bestUpdatedCount === 1 ? "" : "s"}`,
        );
      } else if (result.duplicateCount > 0 || result.missingSongCount > 0) {
        toast.error(
          `No scores imported. ${result.duplicateCount} duplicate${result.duplicateCount === 1 ? "" : "s"}, ${result.missingSongCount} missing song${result.missingSongCount === 1 ? "" : "s"}.`,
        );
      } else {
        toast.error("No scores were imported");
      }

      setOpen(false);
      resetState();
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import scores");
    }
  };

  const executeImportAction = async () => {
    if (shouldFetchFromKamai) {
      await fetchRemoteScores();
      return;
    }

    await syncKamaiScores();
  };

  const primaryButtonDisabled = shouldFetchFromKamai
    ? isFetchingKamai || importMutation.isPending
    : selectedRows.length === 0 || importMutation.isPending || isFetchingKamai;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 rounded-lg text-xs font-semibold hover:bg-emerald-500/20 hover:text-emerald-700 dark:hover:text-emerald-300"
        >
          <Download className="h-3.5 w-3.5" />
          Import
        </Button>
      </DialogTrigger>

      <DialogContent className="flex h-[88vh] max-h-[920px] w-[96vw] sm:max-w-[1150px] flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#141414] p-0 shadow-[0_30px_120px_rgba(0,0,0,0.85)] outline-none ring-1 ring-white/[0.06]">
        <DialogHeader className="border-b border-white/[0.06] px-8 pb-6 pt-8 sm:px-9">
          <div className="flex items-center gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.045] shadow-inner">
              <Download className="h-6 w-6 text-white/90" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-2xl font-black tracking-tight text-white sm:text-[1.7rem]">
                Import Records
              </DialogTitle>
              <p className="mt-1 text-sm font-medium leading-6 text-muted-foreground">
                Synchronize your Kamaitachi scores with Cozynet.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-7 overflow-y-auto px-8 py-7 custom-scrollbar sm:px-9">
          <ImportSourceTabs
            fileName={fileName}
            inputRef={inputRef}
            kamaiUsername={kamaiUsername}
            setKamaiUsername={setKamaiUsername}
            isFetchingKamai={isFetchingKamai}
            shouldFetchFromKamai={shouldFetchFromKamai}
            importMutation={importMutation}
            uploadKamaiFile={uploadKamaiFile}
            fetchRemoteScores={fetchRemoteScores}
          />

          {previewRows.length > 0 && (
            <div className="space-y-5">
              <ImportSummary
                summary={summary}
                selectedCount={selectedRows.length}
              />

              <div
                className={cn("overflow-hidden rounded-2xl", surfaceClassName)}
              >
                <PreviewToolbar
                  selectedCount={selectedRows.length}
                  selectedKeys={selectedKeys}
                  visiblePreviewRows={visiblePreviewRows}
                  onlyShowReadyRows={onlyShowReadyRows}
                  setOnlyShowReadyRows={setOnlyShowReadyRows}
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                  toggleSelectAll={toggleSelectAll}
                />

                <ImportPreview
                  visiblePreviewRows={visiblePreviewRows}
                  selectedKeys={selectedKeys}
                  setSelectedKeys={setSelectedKeys}
                  getPreviewTextClassName={getPreviewTextClassName}
                  getPreviewMetaClassName={getPreviewMetaClassName}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-white/[0.06] bg-[#111111] px-8 py-6 sm:px-9">
          <Button
            variant="ghost"
            size="lg"
            onClick={closeDialog}
            disabled={importMutation.isPending || isFetchingKamai}
            className="rounded-xl px-7 font-bold text-muted-foreground hover:bg-white/[0.06]"
          >
            Cancel
          </Button>
          <Button
            onClick={executeImportAction}
            disabled={primaryButtonDisabled}
            size="lg"
            className="min-w-[160px] rounded-xl bg-white px-8 font-black text-black shadow-sm hover:bg-white/90 disabled:bg-white/40"
          >
            <PrimaryButtonContent
              isFetchingKamai={isFetchingKamai}
              shouldFetchFromKamai={shouldFetchFromKamai}
              isImporting={importMutation.isPending}
              selectedCount={selectedRows.length}
            />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ImportSourceTabs({
  fileName,
  inputRef,
  kamaiUsername,
  setKamaiUsername,
  isFetchingKamai,
  shouldFetchFromKamai,
  uploadKamaiFile,
  fetchRemoteScores,
}: any) {
  const [activeTab, setActiveTab] = useState("file");

  return (
    <div className="w-full">
      <div className="relative mb-8 grid h-12 w-full max-w-[400px] grid-cols-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1.5 ring-1 ring-white/[0.05]">
        {/* Sliding Pill */}
        <div
          className={cn(
            "absolute inset-y-1.5 rounded-xl bg-white shadow-lg transition-all duration-500 z-0",
            activeTab === "file" ? "left-1.5 right-[calc(50%+3px)]" : "left-[calc(50%+3px)] right-1.5"
          )}
          style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />

        <button
          onClick={() => setActiveTab("file")}
          className={cn(
            "relative z-10 flex items-center justify-center gap-3 h-9 rounded-xl transition-colors duration-300 select-none cursor-pointer text-xs font-black uppercase tracking-[0.16em]",
            activeTab === "file" ? "text-black" : "text-muted-foreground hover:text-white"
          )}
        >
          <FileUp className={cn("size-4 transition-transform duration-500", activeTab === "file" && "scale-110")} />
          File Upload
        </button>

        <button
          onClick={() => setActiveTab("remote")}
          className={cn(
            "relative z-10 flex items-center justify-center gap-3 h-9 rounded-xl transition-colors duration-300 select-none cursor-pointer text-xs font-black uppercase tracking-[0.16em]",
            activeTab === "remote" ? "text-black" : "text-muted-foreground hover:text-white"
          )}
        >
          <Download className={cn("size-4 transition-transform duration-500", activeTab === "remote" && "scale-110")} />
          Remote Fetch
        </button>
      </div>

      <div className="mt-0">
        {activeTab === "file" ? (
          <div
            className={cn(
              "group flex min-h-36 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/[0.09] p-7 text-center transition-colors hover:bg-white/[0.045]",
              surfaceClassName
            )}
          >
            <Input
              ref={inputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={uploadKamaiFile}
            />
            <div className="mb-4 grid size-14 place-items-center rounded-2xl border border-white/[0.08] bg-black/20 transition-transform group-hover:scale-105">
              <FileUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <Button
              type="button"
              variant="outline"
              size="default"
              className="h-11 rounded-xl border-white/[0.1] bg-white/[0.04] px-6 font-black text-white hover:bg-white/[0.08]"
              onClick={() => inputRef.current?.click()}
            >
              Choose Kamai JSON
            </Button>
            <p className="mt-4 max-w-full truncate text-xs font-semibold text-muted-foreground">
              {fileName ?? "Select a JSON export from Kamaitachi"}
            </p>
          </div>
        ) : (
          <div className={cn("space-y-5 rounded-2xl p-6", surfaceClassName)}>
            <div className="space-y-2">
              <label htmlFor="ongeki-kamai-username" className="block px-1 text-sm font-bold text-white/85">
                Kamaitachi Username
              </label>
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
                className="h-11 rounded-xl border-white/[0.08] bg-black/20 px-4 text-sm font-semibold shadow-sm"
                name="ongeki-kamai-player"
                autoComplete="new-password"
                disabled={isFetchingKamai}
              />
              <p className="px-1 text-xs font-medium leading-5 text-muted-foreground">
                Your scores will be fetched directly through the Kamaitachi API.
              </p>
            </div>

            {shouldFetchFromKamai && (
              <Button
                onClick={fetchRemoteScores}
                disabled={isFetchingKamai}
                className="h-11 w-full rounded-xl bg-white font-black text-black hover:bg-white/90"
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
        )}
      </div>
    </div>
  )
}

function ImportSummary({ summary, selectedCount }: any) {
  const stats = [
    { label: "Ready", value: summary.readyCount, sub: "New scores" },
    { label: "Selected", value: selectedCount, sub: "To import" },
    {
      label: "Synced",
      value: summary.duplicate + summary.duplicateInFile,
      sub: "Already saved",
    },
    { label: "Missing", value: summary.unknownSong, sub: "Not found" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn("min-w-0 rounded-2xl px-5 py-3.5", surfaceClassName)}
        >
          <p className={labelClassName}>{stat.label}</p>
          <div className="mt-2.5 flex items-end gap-2">
            <p className="text-2xl font-black leading-none tracking-tight text-white tabular-nums">
              {stat.value}
            </p>
            <p className="pb-0.5 text-[10px] font-bold leading-tight text-muted-foreground">
              {stat.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PreviewToolbar({
  selectedCount,
  selectedKeys,
  visiblePreviewRows,
  onlyShowReadyRows,
  setOnlyShowReadyRows,
  sortOrder,
  setSortOrder,
  toggleSelectAll,
}: any) {
  const importableRows = visiblePreviewRows.filter((row: any) =>
    isImportableStatus(row.status),
  );
  const allVisibleRowsSelected =
    importableRows.length > 0 &&
    importableRows.every((row: any) => selectedKeys[row.id]);

  return (
    <div className="flex items-center justify-between border-b border-white/[0.07] p-6 bg-white/[0.01]">
      <div className="flex items-center gap-8">
        <label
          htmlFor="ongeki-select-all"
          className="flex cursor-pointer select-none items-center gap-3 transition-opacity hover:opacity-80"
        >
          <Checkbox
            id="ongeki-select-all"
            checked={allVisibleRowsSelected}
            onCheckedChange={(checked) => toggleSelectAll(checked === true)}
            className="size-6 rounded-lg border-white/[0.14] data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
          />
          <span className="text-sm font-black text-white uppercase tracking-wider">Select All</span>
        </label>
        
        <div className="h-10 w-px bg-white/[0.08]" />
        
        <div className="flex flex-col gap-1">
          <p className={labelClassName}>Active Selection</p>
          <p className="text-sm font-black text-white tabular-nums">
            {selectedCount} <span className="text-[10px] text-muted-foreground uppercase tracking-widest ml-1">Scores</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-1.5 mr-2">
          <p className={cn(labelClassName, "text-right")}>Display Order</p>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="h-10 w-48 rounded-xl border-white/[0.08] bg-black/40 text-[10px] font-black uppercase tracking-wider">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border">
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="h-10 w-px bg-white/[0.08] mx-2" />

        <label
          htmlFor="ongeki-only-ready"
          className="group flex flex-col gap-1.5 cursor-pointer select-none"
        >
          <p className={labelClassName}>Visibility</p>
          <div className="flex h-10 items-center gap-3 rounded-xl border border-white/[0.08] bg-black/40 px-5 transition-colors group-hover:bg-white/[0.05]">
            <Checkbox
              id="ongeki-only-ready"
              checked={onlyShowReadyRows}
              onCheckedChange={(checked) =>
                setOnlyShowReadyRows(checked === true)
              }
              className="size-4 border-white/[0.14] data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
            />
            <span className="text-[10px] font-black uppercase tracking-wider text-white">Ready Only</span>
          </div>
        </label>
      </div>
    </div>
  );
}

function ImportPreview({
  visiblePreviewRows,
  selectedKeys,
  setSelectedKeys,
  getPreviewTextClassName,
  getPreviewMetaClassName,
}: any) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: visiblePreviewRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 92,
    getItemKey: (index) => visiblePreviewRows[index].id,
    overscan: 10,
  });

  return (
    <div className="flex flex-col">
      <div className="border-b border-white/[0.07] bg-black/15 px-5 py-3">
        <p className={labelClassName}>Import Preview</p>
      </div>

      <div
        ref={parentRef}
        className="h-[360px] overflow-y-auto custom-scrollbar"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
            width: "100%",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const row = visiblePreviewRows[virtualItem.index];

            return (
              <PreviewRow
                key={virtualItem.key}
                virtualItem={virtualItem}
                rowVirtualizer={rowVirtualizer}
                row={row}
                selectedKeys={selectedKeys}
                setSelectedKeys={setSelectedKeys}
                getPreviewTextClassName={getPreviewTextClassName}
                getPreviewMetaClassName={getPreviewMetaClassName}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PreviewRow({
  virtualItem,
  rowVirtualizer,
  row,
  selectedKeys,
  setSelectedKeys,
  getPreviewTextClassName,
  getPreviewMetaClassName,
}: any) {
  const importable = isImportableStatus(row.status);

  return (
    <label
      data-index={virtualItem.index}
      ref={rowVirtualizer.measureElement}
      style={{
        left: 0,
        position: "absolute",
        top: 0,
        transform: `translateY(${virtualItem.start}px)`,
        width: "100%",
      }}
      className={cn(
        "grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4 border-b border-white/[0.06] px-5 py-4 transition-colors last:border-0 hover:bg-white/[0.045]",
        importable && "bg-white/[0.02]",
      )}
    >
      <div className="pt-1">
        {row.status === "unknown-song" || row.status === "duplicate-in-file" ? (
          <div className="size-5 shrink-0" />
        ) : (
          <Checkbox
            checked={Boolean(selectedKeys[row.id])}
            disabled={!importable}
            onCheckedChange={(checked) =>
              setSelectedKeys((prev: any) => ({
                ...prev,
                [row.id]: checked === true,
              }))
            }
            className="size-5 rounded-md border-white/[0.14] data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
          />
        )}
      </div>

      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          <p
            className={cn(
              "min-w-0 truncate text-base font-black leading-tight",
              getPreviewTextClassName(row.status),
            )}
          >
            {row.title ?? `Song ${row.musicId}`}
          </p>
          <span
            className={cn(
              "shrink-0 rounded-md border px-2 py-1 text-[10px] font-black uppercase leading-none tracking-wide",
              getPreviewMetaClassName(row.status),
            )}
          >
            {getDifficultyFromOngekiChart(row.level)}
            {row.chartLevel != null ? ` ${formatLevel(row.chartLevel)}` : ""}
          </span>
        </div>

        <div
          className={cn(
            "mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold tabular-nums",
            getPreviewMetaClassName(row.status),
          )}
        >
          <span className="text-sm font-black">
            {row.score.toLocaleString()}
          </span>
          <MetaDot />
          <span>{row.noteLamp}</span>
          <MetaDot />
          <span>{row.bellLamp}</span>
          <MetaDot />
          {row.timeAchieved ? (
            <span>
              {DateTime.fromMillis(row.timeAchieved).toFormat(
                "yyyy-LL-dd HH:mm",
              )}
            </span>
          ) : (
            <span className="italic opacity-60">No timestamp</span>
          )}
        </div>
      </div>

      <div className="pt-0.5">
        <StatusBadge status={row.status} />
      </div>
    </label>
  );
}

function MetaDot() {
  return <span className="opacity-35">•</span>;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "ready")
    return (
      <Badge className="text-muted-foreground bg-white/[0.06] border-white/[0.08]">
        Ready
      </Badge>
    );
  if (status === "best-update")
    return (
      <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-500">
        PB
      </Badge>
    );
  if (status === "duplicate")
    return (
      <Badge className="border-white/[0.06] bg-white/[0.035] text-muted-foreground/70">
        Synced
      </Badge>
    );
  if (status === "duplicate-in-file")
    return (
      <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-500">
        Duplicate
      </Badge>
    );
  if (status === "unknown-song")
    return (
      <Badge className="border-rose-500/20 bg-rose-500/10 text-rose-500">
        Missing
      </Badge>
    );

  return null;
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2.5 py-1 text-[10px] font-black uppercase leading-none tracking-wider",
        className,
      )}
    >
      {children}
    </span>
  );
}

function PrimaryButtonContent({
  isFetchingKamai,
  shouldFetchFromKamai,
  isImporting,
  selectedCount,
}: {
  isFetchingKamai: boolean;
  shouldFetchFromKamai: boolean;
  isImporting: boolean;
  selectedCount: number;
}) {
  if (isFetchingKamai) {
    return (
      <>
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        Fetching…
      </>
    );
  }

  if (shouldFetchFromKamai) {
    return (
      <>
        <Download className="mr-2 h-4 w-4" />
        Download
      </>
    );
  }

  if (isImporting) {
    return (
      <>
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        Importing…
      </>
    );
  }

  return (
    <>
      <Download className="mr-2 h-4 w-4" />
      Sync{selectedCount > 0 ? ` ${selectedCount}` : ""}
    </>
  );
}
