export type ToolMode = "container" | "option" | "vhd"

export type Detail = {
	label: string
	value: string
}

export type CompletedResult = {
	outputFolder: string
	outputSize: number
	details: Detail[]
}

export type RunStats = {
	elapsedMs: number
	bytesWritten: number
	totalBytes: number
}

export type WritableFile = {
	write: (chunk: Uint8Array) => Promise<void>
	close: () => Promise<void>
}

export type SavePickerWindow = Window &
	typeof globalThis & {
		showDirectoryPicker?: (options?: {
			id?: string
			mode?: "read" | "readwrite"
			startIn?: "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos"
		}) => Promise<DirectoryHandle>
	}

export type DirectoryHandle = {
	name?: string
	queryPermission?: (descriptor?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>
	requestPermission?: (descriptor?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>
	getDirectoryHandle: (name: string, options?: { create?: boolean }) => Promise<DirectoryHandle>
	removeEntry?: (name: string, options?: { recursive?: boolean }) => Promise<void>
	getFileHandle: (
		name: string,
		options?: { create?: boolean }
	) => Promise<{ createWritable: () => Promise<WritableFile> }>
}

export type StoredOutputRoot = {
	id: string
	handle: DirectoryHandle
}
