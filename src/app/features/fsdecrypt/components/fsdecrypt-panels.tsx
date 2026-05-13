import { type ChangeEvent, type RefObject } from "react"

import { FileKey, FileUp, HardDriveDownload, type LucideIcon, Terminal } from "lucide-react"

import { Button } from "@/app/shared/components/ui/button"
import { Progress } from "@/app/shared/components/ui/progress"
import { cn } from "@/app/shared/utils"

import { CompletedResult, RunStats, ToolMode } from "../types"
import { BUILT_IN_KEY_IDS } from "../utils/fsdecrypt"
import { MODES, formatBytes, formatDuration, formatEta, formatThroughput, modeLabel } from "../utils/presentation"

export function ModeToggle({ mode, onChange }: { mode: ToolMode; onChange: (mode: ToolMode) => void }) {
	const activeIndex = MODES.findIndex(item => item.mode === mode)

	return (
		<div className="bg-muted/40 border-border/50 relative grid h-10 w-full max-w-xl grid-cols-3 gap-1 rounded-sm border p-1">
			<div
				className="bg-foreground absolute top-1 bottom-1 left-1 z-0 rounded-sm shadow-sm transition-transform duration-500"
				style={{
					width: "calc((100% - 1rem) / 3)",
					transform: `translateX(calc(${activeIndex} * (100% + 0.25rem)))`,
					transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)"
				}}
			/>
			{MODES.map(item => {
				const Icon = item.icon
				const isActive = mode === item.mode
				return (
					<button
						key={item.mode}
						type="button"
						onClick={() => onChange(item.mode)}
						className={cn(
							"relative z-10 flex h-8 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-sm px-2 text-xs font-semibold whitespace-nowrap uppercase transition-colors duration-300 select-none",
							isActive ? "text-background" : "text-muted-foreground hover:text-foreground"
						)}
					>
						<Icon className={cn("size-3.5 shrink-0 transition-transform duration-500", isActive && "scale-110")} />
						<span className="truncate">{item.label}</span>
					</button>
				)
			})}
		</div>
	)
}

function FileAction({
	icon: Icon,
	label,
	disabled,
	onClick
}: {
	icon: LucideIcon
	label: string
	disabled: boolean
	onClick: () => void
}) {
	return (
		<Button
			type="button"
			variant="outline"
			className="h-12 w-full justify-start rounded-sm"
			disabled={disabled}
			onClick={onClick}
		>
			<Icon />
			{label}
		</Button>
	)
}

function MetadataRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
	return (
		<div className="min-w-0">
			<div className="text-muted-foreground text-xs">{label}</div>
			<div className={cn("truncate text-sm font-medium", muted && "text-muted-foreground")}>{value}</div>
		</div>
	)
}

export function ControlPanel({
	containerInputRef,
	keyInputRef,
	vhdInputRef,
	mode,
	isBusy,
	keyLabel,
	selectedFiles,
	onContainerChange,
	onKeyChange,
	onVhdChange
}: {
	containerInputRef: RefObject<HTMLInputElement | null>
	keyInputRef: RefObject<HTMLInputElement | null>
	vhdInputRef: RefObject<HTMLInputElement | null>
	mode: ToolMode
	isBusy: boolean
	keyLabel: string
	selectedFiles: File[]
	onContainerChange: (event: ChangeEvent<HTMLInputElement>) => void
	onKeyChange: (event: ChangeEvent<HTMLInputElement>) => void
	onVhdChange: (event: ChangeEvent<HTMLInputElement>) => void
}) {
	const isVhdMode = mode === "vhd"

	return (
		<div className="space-y-3">
			<input
				ref={containerInputRef}
				className="hidden"
				type="file"
				accept={mode === "option" ? ".opt,application/octet-stream" : ".app,application/octet-stream"}
				onChange={onContainerChange}
			/>
			<input
				ref={keyInputRef}
				className="hidden"
				type="file"
				accept=".bin,application/octet-stream"
				onChange={onKeyChange}
			/>
			<input
				ref={vhdInputRef}
				className="hidden"
				type="file"
				accept=".app,.vhd,application/octet-stream"
				multiple
				onChange={onVhdChange}
			/>

			{isVhdMode ? (
				<FileAction
					icon={HardDriveDownload}
					label="Choose Apps"
					disabled={isBusy}
					onClick={() => vhdInputRef.current?.click()}
				/>
			) : (
				<FileAction
					icon={mode === "option" ? FileKey : FileUp}
					label={mode === "option" ? "Choose Option" : "Choose Base"}
					disabled={isBusy}
					onClick={() => containerInputRef.current?.click()}
				/>
			)}
			<FileAction icon={FileKey} label="Choose Key" disabled={isBusy} onClick={() => keyInputRef.current?.click()} />

			<div className="bg-background/60 rounded-sm border p-3">
				<MetadataRow label="Selected" value={selectedFiles.length === 0 ? "None" : `${selectedFiles.length} file(s)`} />
				{selectedFiles.length > 0 && (
					<div className="mt-2 space-y-2">
						{selectedFiles.map(file => (
							<div key={`${file.name}-${file.size}-${file.lastModified}`} className="min-w-0">
								<div className="truncate text-sm font-medium">{file.name}</div>
								<div className="text-muted-foreground text-xs">{formatBytes(file.size)}</div>
							</div>
						))}
					</div>
				)}
				<div className="border-border my-3 border-t" />
				<MetadataRow label="Key" value={keyLabel} />
			</div>
		</div>
	)
}

export function WorkspacePanel({
	mode,
	isBusy,
	progress,
	runStats,
	result,
	selectedFileCount
}: {
	mode: ToolMode
	isBusy: boolean
	progress: number
	runStats: RunStats
	result: CompletedResult | null
	selectedFileCount: number
}) {
	return (
		<div className="bg-background/40 flex min-h-72 flex-col rounded-sm border">
			<div className="grid gap-3 p-4 sm:grid-cols-3">
				<MetadataRow label="Mode" value={modeLabel(mode)} />
				<MetadataRow label="Files" value={selectedFileCount.toString()} />
				<div className="min-w-0">
					<div className="text-muted-foreground text-xs">Output</div>
					<div className={cn("truncate text-sm font-medium", !result && "text-muted-foreground")}>
						{result?.outputFolder ?? "Pending"}
					</div>
				</div>
			</div>

			<div className="border-border border-t" />

			<div className="flex flex-1 flex-col justify-between gap-4 p-4">
				{(isBusy || progress > 0) && (
					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Progress</span>
							<span className="font-medium">{progress}%</span>
						</div>
						<Progress value={progress} />
						<div className="grid gap-3 pt-2 text-sm sm:grid-cols-3">
							<MetadataRow label="Elapsed" value={formatDuration(runStats.elapsedMs)} />
							<MetadataRow label="Throughput" value={formatThroughput(runStats.bytesWritten, runStats.elapsedMs)} />
							<MetadataRow label="ETA" value={formatEta(runStats)} />
						</div>
					</div>
				)}

				{result ? (
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						{result.details.map(item => (
							<MetadataRow key={item.label} label={item.label} value={item.value} />
						))}
						<MetadataRow label="Size" value={formatBytes(result.outputSize)} />
					</div>
				) : (
					<div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">Ready</div>
				)}
			</div>
		</div>
	)
}

export function BuiltInKeysPanel() {
	return (
		<div className="bg-background/40 rounded-sm border">
			<div className="border-b p-3 text-sm font-medium">Built-in keys</div>
			<div className="grid max-h-72 grid-cols-4 gap-1 overflow-auto p-3 xl:grid-cols-3">
				{BUILT_IN_KEY_IDS.map(keyId => (
					<div key={keyId} className="bg-muted/40 rounded-sm px-2 py-1 text-center font-mono text-xs">
						{keyId}
					</div>
				))}
			</div>
		</div>
	)
}

export function LogPanel({ logs, terminalRef }: { logs: string[]; terminalRef: RefObject<HTMLDivElement | null> }) {
	return (
		<section className="bg-card text-card-foreground rounded-sm border">
			<div className="flex items-center gap-2 border-b p-3 text-sm font-medium">
				<Terminal className="size-4" />
				Log
			</div>
			<div ref={terminalRef} className="h-56 overflow-auto bg-black p-3 font-mono text-xs text-green-300">
				{logs.map((line, index) => (
					<div key={`${line}-${index}`} className="whitespace-pre-wrap">
						{line}
					</div>
				))}
			</div>
		</section>
	)
}
