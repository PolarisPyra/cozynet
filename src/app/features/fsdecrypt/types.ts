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
