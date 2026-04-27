import { useState } from "react"

import { toast } from "sonner"

interface ExportOptions {
	filename: string
	onStart?: () => void
	onSuccess?: () => void
	onError?: (error: unknown) => void
	onComplete?: () => void
}

/**
 * Utility to handle JSON export as a file download.
 */
export async function exportToJson(data: any, options: ExportOptions) {
	const { filename, onStart, onSuccess, onError, onComplete } = options

	onStart?.()

	try {
		if (!data) {
			toast.error("No data to export")
			return
		}

		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json"
		})

		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")

		a.href = url
		a.download = filename

		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)

		URL.revokeObjectURL(url)

		toast.success("Export successful")
		onSuccess?.()
	} catch (error) {
		console.error("Export error:", error)
		toast.error("Failed to export data")
		onError?.(error)
	} finally {
		onComplete?.()
	}
}

/**
 * Hook to manage the export state.
 */
export function useExportState() {
	const [isExporting, setIsExporting] = useState(false)

	return {
		isExporting,
		setIsExporting
	}
}
