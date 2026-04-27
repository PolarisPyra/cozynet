import { useMemo } from "react"

import { Upload } from "lucide-react"

import { ChunithmKamaiImportDialog } from "@/app/features/chunithm/components/kamai-import-dialog"
import { scoreFilters, useChunithmScores, useScoreExporter, useChunithmVersion } from "@/app/features/chunithm/hooks"
import { KamaiSyncButtons } from "@/app/shared/components/common/kamai-sync-buttons"
import { ChunithmScoreGrid } from "@/app/features/chunithm/components/scores/score-grid"
import { ChunithmScoreTable } from "@/app/features/chunithm/components/scores/score-table"
import Header from "@/app/shared/components/common/header"
import { InlineFilters } from "@/app/shared/components/common/inline-filters"
import { Pagination } from "@/app/shared/components/common/pagination"
import Spinner from "@/app/shared/components/common/spinner"
import { Button } from "@/app/shared/components/ui/button"
import { DensityToggle } from "@/app/shared/components/common/density-toggle"
import { useScorePageState } from "@/app/shared/hooks/use-score-page-state"
import { Body, Container } from "@/app/shared/pages/layout/layout"
import { exportToJson, useExportState } from "@/app/shared/utils/export-utils"

const CHUNITHM_SCORES_DENSITY_KEY = "scores-density"

export default function ChunithmScorePage() {
	const version = useChunithmVersion()
	const { data: scores, isLoading } = useChunithmScores()
	const { refetch: fetchExport } = useScoreExporter()
	const { isExporting, setIsExporting } = useExportState()

	const {
		setSearchQuery,
		filterValues,
		density,
		setDensity,
		page,
		setPage,
		totalPages,
		paged,
		hasActiveFilters,
		showEmptyState,
		handleFilterChange,
		resetFilters
	} = useScorePageState({
		data: scores,
		filters: scoreFilters,
		storageKey: CHUNITHM_SCORES_DENSITY_KEY
	})

	const searchItems = useMemo(() => (scores || []).map(score => ({ id: score.id, title: score.title || "" })), [scores])

	const handleExport = async () => {
		const result = await fetchExport()
		await exportToJson(result.data, {
			filename: `chunithm_kamai_export_${new Date().toISOString().split("T")[0]}.json`,
			onStart: () => setIsExporting(true),
			onComplete: () => setIsExporting(false)
		})
	}

	if (isLoading) {
		return (
			<Container>
				<Header title="Scores" />
				<Body>
					<div className="flex h-96 items-center justify-center">
						<Spinner />
					</div>
				</Body>
			</Container>
		)
	}

	return (
		<Container>
			<Header
				title="Scores"
				actions={
					<InlineFilters
						filters={scoreFilters}
						filterValues={filterValues}
						onFilterChange={handleFilterChange}
						onClearAll={resetFilters}
					/>
				}
				searchProps={{
					items: searchItems,
					onSelect: setSearchQuery,
					placeholder: "Search scores...",
					emptyMessage: "No scores found.",
					groupLabel: "Scores",
					recentStorageKey: "recent:chunithm:scores"
				}}
			/>

			<Body>
				<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
					<div className="flex flex-wrap gap-2">
						<KamaiSyncButtons
							onExport={handleExport}
							isExporting={isExporting}
							importDialog={<ChunithmKamaiImportDialog existingScores={scores || []} />}
						/>
					</div>

					<DensityToggle density={density} onChange={setDensity} className="ml-auto" />
				</div>

				{showEmptyState ? (
					<div className="text-muted-foreground py-20 text-center">
						{hasActiveFilters ? "No scores match your filters" : "No scores found"}
					</div>
				) : (
					<>
						{density === "list" ? (
							<ChunithmScoreTable scores={paged} version={version} />
						) : (
							<ChunithmScoreGrid scores={paged} version={version} />
						)}

						{totalPages > 1 && (
							<div className="mt-4">
								<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
							</div>
						)}
					</>
				)}
			</Body>
		</Container>
	)
}