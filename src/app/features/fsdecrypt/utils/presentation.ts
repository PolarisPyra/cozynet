import { FileArchive, FileKey, HardDriveDownload, type LucideIcon } from "lucide-react"

import { RunStats, ToolMode } from "../types"
import { VhdNtfsSource } from "./vhd"

export const MODES = [
	{ mode: "container", label: "Base", icon: FileArchive },
	{ mode: "option", label: "Option", icon: FileKey },
	{ mode: "vhd", label: "Merge", icon: HardDriveDownload }
] as const satisfies ReadonlyArray<{ mode: ToolMode; label: string; icon: LucideIcon }>

export function formatBytes(bytes: number) {
	const units = ["B", "KB", "MB", "GB", "TB"]
	let value = bytes
	let unitIndex = 0

	while (value >= 1024 && unitIndex < units.length - 1) {
		value /= 1024
		unitIndex += 1
	}

	return `${value.toLocaleString(undefined, { maximumFractionDigits: unitIndex === 0 ? 0 : 2 })} ${units[unitIndex]}`
}

export function stripExtension(name: string) {
	return name.replace(/\.[^.]+$/, "")
}

export function sanitizePathSegment(name: string) {
	return Array.from(name, character => {
		const code = character.charCodeAt(0)
		return code < 32 || '<>:"/\\|?*'.includes(character) ? "_" : character
	}).join("")
}

export function modeLabel(mode: ToolMode) {
	return MODES.find(item => item.mode === mode)?.label.toUpperCase() ?? mode.toUpperCase()
}

export function formatDuration(ms: number) {
	if (ms < 60_000) {
		return `${(ms / 1000).toFixed(1)}s`
	}

	return `${Math.floor(ms / 60_000)}m ${((ms % 60_000) / 1000).toFixed(0)}s`
}

export function formatThroughput(bytes: number, elapsedMs: number) {
	if (bytes <= 0 || elapsedMs <= 0) {
		return "0 B/s"
	}

	return `${formatBytes((bytes / elapsedMs) * 1000)}/s`
}

export function formatEta(stats: RunStats) {
	if (stats.bytesWritten <= 0 || stats.totalBytes <= 0 || stats.bytesWritten >= stats.totalBytes) {
		return "..."
	}

	const bytesPerMs = stats.bytesWritten / Math.max(stats.elapsedMs, 1)
	return formatDuration((stats.totalBytes - stats.bytesWritten) / bytesPerMs)
}

export function vhdDetails(result: VhdNtfsSource) {
	return [
		{ label: "Layers", value: result.chain.length.toString() },
		{ label: "Parent", value: result.chain[0] ?? "" },
		{ label: "Child", value: result.chain[result.chain.length - 1] ?? "" },
		{ label: "NTFS Offset", value: formatBytes(result.ntfsOffset) }
	]
}
