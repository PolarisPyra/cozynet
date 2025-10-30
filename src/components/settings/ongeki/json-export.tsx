import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useReiwaExport } from "@/hooks/ongeki";

const JsonExport = () => {
	const { data: exportData, isLoading } = useReiwaExport();

	const handleExportB45 = () => {
		if (!exportData) {
			toast.error("No data available to export");
			return;
		}

		const blob = new Blob([JSON.stringify(exportData, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "ongeki_reiwa_export.json";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);

		toast.success("Successfully exported B45 data");
	};

	return (
		<div className="bg-card rounded-sm p-4 md:p-6">
			<h2 className="text-primary mb-4 text-xl font-semibold">Export Data</h2>
			<Button onClick={handleExportB45} variant="custom" disabled={isLoading || !exportData}>
				{isLoading ? "Exporting..." : "Export ratings as json (for reiwa.f5.si)"}
			</Button>
		</div>
	);
};

export default JsonExport;
