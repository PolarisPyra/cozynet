import { toast } from "sonner"

import { Button } from "@/app/shared/components/ui/button"
import { useKamaitachiExport, useReiwaExport } from "@/app/features/chunithm/hooks"

const JsonExport = () => {
	const { data: exportData, isLoading: isLoadingReiwa, refetch: refetchReiwa } = useReiwaExport()
	const { data: kamaitachiData, isLoading: isLoadingKamaitachi, refetch: refetchKamaitachi } = useKamaitachiExport()

	const handleExportReiwa = async () => {
		try {
			// Fetch data if not already loaded
			let data = exportData
			if (!data) {
				const result = await refetchReiwa()
				data = result.data
			}

			if (!data) {
				toast.error("No export data available")
				return
			}

			const blob = new Blob([JSON.stringify(data, null, 2)], {
				type: "application/json"
			})
			const url = URL.createObjectURL(blob)
			const link = document.createElement("a")
			link.href = url
			link.download = "chunithm_reiwa_export.json"
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			URL.revokeObjectURL(url)

			toast.success("Successfully exported B30 data")
		} catch (error) {
			toast.error("Failed to export data")
		}
	}

	const handleExportKamaitachi = async () => {
		try {
			// Fetch data if not already loaded
			let data = kamaitachiData
			if (!data) {
				const result = await refetchKamaitachi()
				data = result.data
			}

			if (!data) {
				toast.error("No Kamaitachi data available")
				return
			}

			const blob = new Blob([JSON.stringify(data, null, 2)], {
				type: "application/json"
			})
			const url = URL.createObjectURL(blob)
			const link = document.createElement("a")
			link.href = url
			link.download = "chunithm_kamaitachi_export.json"
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			URL.revokeObjectURL(url)

			toast.success("Successfully exported Kamaitachi data")
		} catch (error) {
			toast.error("Failed to export data")
		}
	}

	return (
		<div className="bg-card rounded-sm p-4 md:p-6">
			<h2 className="text-primary mb-4 text-xl font-semibold">Export Data</h2>
			<div className="flex gap-4">
				<Button onClick={handleExportReiwa} variant="custom" disabled={isLoadingReiwa}>
					{isLoadingReiwa ? "Exporting..." : "Export Ratings (Reiwa)"}
				</Button>
				<Button onClick={handleExportKamaitachi} variant="custom" disabled={isLoadingKamaitachi}>
					{isLoadingKamaitachi ? "Exporting..." : "Export Scores (Kamaitachi)"}
				</Button>
			</div>
		</div>
	)
}

export default JsonExport
