import { useRef, useState } from "react";

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
import { cn } from "@/app/shared/utils";
import { formatLevel } from "@/app/shared/utils/format-level";
import { getDifficultyFromChunithmChart } from "@/app/shared/utils/chunithm";

import {
  isImportableStatus,
  type ChunithmExistingScore,
  useKamaiImport,
} from "../hooks/use-kamai-import";

const surfaceClassName =
  "border border-white/[0.08] bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]";
const labelClassName =
  "text-[11px] font-medium leading-none text-muted-foreground";

export function ChunithmKamaiImportDialog({
  existingScores,
}: {
  existingScores: ChunithmExistingScore[];
}) {
  const [open, setOpen] = useState(false);
  const kamaiImport = useKamaiImport(existingScores);

  return (
    <ChunithmKamaiImportDialogView
      open={open}
      setOpen={setOpen}
      {...kamaiImport}
    />
  );
}

function ChunithmKamaiImportDialogView({
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
  processKamaiFile,
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
          clearLamp: row.clearLamp,
          timeAchieved: row.timeAchieved,
          judgements: row.judgements,
          maxCombo: row.maxCombo,
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

  const primaryButtonDisabled =
    selectedRows.length === 0 || importMutation.isPending || isFetchingKamai;

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

      <DialogContent className="flex max-h-[86vh] w-[calc(100vw-2rem)] sm:max-w-[760px] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#171717] p-0 outline-none" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className="border-b border-white/[0.07] px-6 py-5">
          <DialogTitle className="text-base font-medium text-white">
            Import Kamaitachi records
          </DialogTitle>
          <p className="text-xs font-normal text-muted-foreground">
            Upload a Kamaitachi JSON export or fetch records from a user.
          </p>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 custom-scrollbar">
          <ImportSources
            fileName={fileName}
            inputRef={inputRef}
            kamaiUsername={kamaiUsername}
            setKamaiUsername={setKamaiUsername}
            isFetchingKamai={isFetchingKamai}
            shouldFetchFromKamai={shouldFetchFromKamai}
            processKamaiFile={processKamaiFile}
            uploadKamaiFile={uploadKamaiFile}
            fetchRemoteScores={fetchRemoteScores}
          />

          {previewRows.length > 0 && (
            <div className="space-y-4">
              <ImportSummary
                summary={summary}
                selectedCount={selectedRows.length}
              />

              <div
                className={cn("overflow-hidden rounded-xl", surfaceClassName)}
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

        <DialogFooter className="border-t border-white/[0.07] bg-[#141414] px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={closeDialog}
            disabled={importMutation.isPending || isFetchingKamai}
            className="rounded-md px-4 font-medium text-muted-foreground hover:bg-white/[0.06]"
          >
            Cancel
          </Button>
          <Button
            onClick={syncKamaiScores}
            disabled={primaryButtonDisabled}
            size="sm"
            className="min-w-[104px] rounded-md bg-white px-5 font-medium text-black shadow-sm hover:bg-white/90 disabled:bg-white/40"
          >
            <PrimaryButtonContent
              isFetchingKamai={isFetchingKamai}
              isImporting={importMutation.isPending}
              selectedCount={selectedRows.length}
            />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ImportSources({
  fileName,
  inputRef,
  kamaiUsername,
  setKamaiUsername,
  isFetchingKamai,
  shouldFetchFromKamai,
  processKamaiFile,
  uploadKamaiFile,
  fetchRemoteScores,
}: any) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void processKamaiFile(file);
  };

  return (
    <div className="space-y-5">
      <div
        className={cn(
          "group flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-white/15 p-6 text-center transition-colors hover:border-white/25 hover:bg-white/[0.025]",
          isDragging && "border-blue-400/70 bg-blue-500/[0.06]",
          surfaceClassName
        )}
        onDragEnter={event => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={event => event.preventDefault()}
        onDragLeave={event => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false);
        }}
        onDrop={handleDrop}
      >
        <Input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={uploadKamaiFile}
        />
        <FileUp className="mb-3 size-5 text-muted-foreground" />
        <p className="text-sm font-normal text-white/90">
          Drag and drop or{" "}
          <button
            type="button"
            className="font-medium text-blue-400 hover:text-blue-300 hover:underline"
            onClick={() => inputRef.current?.click()}
          >
            choose a file
          </button>
        </p>
        <p className="mt-2 text-xs font-normal text-muted-foreground">
          {fileName ?? "Kamaitachi JSON export"}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="space-y-2">
        <label htmlFor="chunithm-kamai-username" className="block text-xs font-normal text-white/80">
          Import from user
        </label>
        <div className="flex items-stretch gap-2">
          <Input
            id="chunithm-kamai-username"
            value={kamaiUsername}
            onChange={event => setKamaiUsername(event.target.value)}
            onKeyDown={event => {
              if (event.key !== "Enter" || event.nativeEvent.isComposing || !shouldFetchFromKamai || isFetchingKamai)
                return
              event.preventDefault()
              void fetchRemoteScores()
            }}
            placeholder="Kamaitachi username"
            className="h-10 rounded-md border-white/10 bg-black/20 px-3 text-sm font-normal shadow-none"
            name="chunithm-kamai-player"
            autoComplete="new-password"
            disabled={isFetchingKamai}
          />
          <Button
            type="button"
            variant="outline"
            onClick={fetchRemoteScores}
            disabled={!shouldFetchFromKamai || isFetchingKamai}
            className="h-10 min-w-[96px] shrink-0 rounded-md border-white/10 bg-white/[0.04] px-4 py-0 font-medium text-white hover:bg-white/[0.08]"
          >
            {isFetchingKamai ? <LoaderCircle className="size-4 animate-spin" /> : "Fetch"}
          </Button>
        </div>
        <p className="text-[11px] font-normal text-muted-foreground">
          Fetch public Chunithm records from a Kamaitachi profile.
        </p>
      </div>
    </div>
  );
}

function ImportSummary({ summary, selectedCount }: any) {
  const stats = [
    { label: "Ready", value: summary.ready, sub: "New scores" },
    { label: "Selected", value: selectedCount, sub: "To import" },
    {
      label: "Synced",
      value: summary.duplicate + summary.duplicateInFile,
      sub: "Already saved",
    },
    { label: "Missing", value: summary.unknownSong, sub: "Not found" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn("min-w-0 rounded-lg px-4 py-3", surfaceClassName)}
        >
          <p className={labelClassName}>{stat.label}</p>
          <div className="mt-2 flex items-end gap-2">
            <p className="text-lg font-semibold leading-none text-white tabular-nums">
              {stat.value}
            </p>
            <p className="pb-0.5 text-[10px] font-normal leading-tight text-muted-foreground">
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
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] bg-white/[0.01] p-4">
      <div className="flex items-center gap-5">
        <label
          htmlFor="chunithm-select-all"
          className="flex cursor-pointer select-none items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Checkbox
            id="chunithm-select-all"
            checked={allVisibleRowsSelected}
            onCheckedChange={(checked) => toggleSelectAll(checked === true)}
            className="size-4 rounded border-white/[0.14] data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
          />
          <span className="text-xs font-medium text-white">Select all</span>
        </label>
        
        <div className="h-6 w-px bg-white/[0.08]" />
        
        <p className="text-xs font-normal text-muted-foreground">
          <span className="font-medium text-white tabular-nums">{selectedCount}</span> selected
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="h-8 w-40 rounded-md border-white/[0.08] bg-black/30 text-xs font-normal">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="rounded-md border-border">
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <label
          htmlFor="chunithm-only-ready"
          className="group flex h-8 cursor-pointer select-none items-center gap-2 rounded-md border border-white/[0.08] bg-black/30 px-3 transition-colors hover:bg-white/[0.05]"
        >
          <Checkbox
            id="chunithm-only-ready"
            checked={onlyShowReadyRows}
            onCheckedChange={(checked) =>
              setOnlyShowReadyRows(checked === true)
            }
            className="size-3.5 border-white/[0.14] data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
          />
          <span className="text-xs font-normal text-white">Ready only</span>
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
      <div className="border-b border-white/[0.07] bg-black/15 px-4 py-3">
        <p className="text-xs font-medium text-white/80">Import preview</p>
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
        "grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 border-b border-white/[0.06] px-4 py-3 transition-colors last:border-0 hover:bg-white/[0.045]",
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
              "min-w-0 truncate text-sm font-medium leading-tight",
              getPreviewTextClassName(row.status),
            )}
          >
            {row.title ?? `Song ${row.musicId}`}
          </p>
          <span
            className={cn(
              "shrink-0 rounded border px-2 py-1 text-[10px] font-medium leading-none",
              getPreviewMetaClassName(row.status),
            )}
          >
            {getDifficultyFromChunithmChart(row.level)}
            {row.chartLevel != null ? ` ${formatLevel(row.chartLevel)}` : ""}
          </span>
        </div>

        <div
          className={cn(
            "mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-normal tabular-nums",
            getPreviewMetaClassName(row.status),
          )}
        >
          <span className="text-xs font-medium">
            {row.score.toLocaleString()}
          </span>
          <MetaDot />
          <span>{row.noteLamp}</span>
          <MetaDot />
          <span>{row.clearLamp}</span>
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
        "inline-flex rounded border px-2 py-1 text-[10px] font-medium leading-none",
        className,
      )}
    >
      {children}
    </span>
  );
}

function PrimaryButtonContent({
  isFetchingKamai,
  isImporting,
  selectedCount,
}: {
  isFetchingKamai: boolean;
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
      Import{selectedCount > 0 ? ` ${selectedCount}` : ""}
    </>
  );
}
