import { toast } from "sonner"

import { Button } from "@/app/shared/components/ui/button"
import { useOngekiVersion, useReiwaExport, useReiwaRefreshExport } from "@/app/features/ongeki/hooks"

const JsonExport = () => {
	const version = useOngekiVersion()
	const isRefreshOrAbove = version ? Number(version) >= 8 : false

	// Only fetch the appropriate export based on version
	const { data: exportData, isLoading } = useReiwaExport()
	const { data: refreshExportData, isLoading: isLoadingRefresh } = useReiwaRefreshExport()

	const currentData = isRefreshOrAbove ? refreshExportData : exportData
	const isLoadingData = isRefreshOrAbove ? isLoadingRefresh : isLoading

	const handleExport = () => {
		if (!currentData) {
			toast.error("No data available to export")
			return
		}

		const blob = new Blob([JSON.stringify(currentData, null, 2)], {
			type: "application/json"
		})
		const url = URL.createObjectURL(blob)
		const link = document.createElement("a")
		link.href = url
		link.download = isRefreshOrAbove
			? "ongeki_reiwa_refresh_export.json"
			: "ongeki_reiwa_export.json"
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		URL.revokeObjectURL(url)

		toast.success(
			isRefreshOrAbove
				? "Successfully exported Re:Fresh data"
				: "Successfully exported B45 data"
		)
	}

	return (
		<div className="bg-card rounded-sm p-4 md:p-6">
			<h2 className="text-primary mb-4 text-xl font-semibold">Export Data</h2>
			<Button onClick={handleExport} variant="custom" disabled={isLoadingData || !currentData}>
				{isLoadingData ? "Exporting..." : "Export ratings as json (for reiwa.f5.si)"}
			</Button>
		</div>
	)
}

export default JsonExport
