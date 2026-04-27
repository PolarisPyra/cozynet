import { useMemo } from "react"



import { OngekiKamaiImportDialog } from "@/app/features/ongeki/components/kamai-import-dialog"
import { OngekiScoreGrid } from "@/app/features/ongeki/components/scores/score-grid"
import { KamaiSyncButtons } from "@/app/shared/components/common/kamai-sync-buttons"
import { OngekiScoreTable } from "@/app/features/ongeki/components/scores/score-table"
import { scoreFilters, useOngekiScoreExporter, useOngekiScores, useOngekiVersion } from "@/app/features/ongeki/hooks"
import Header from "@/app/shared/components/common/header"
import { InlineFilters } from "@/app/shared/components/common/inline-filters"
import { Pagination } from "@/app/shared/components/common/pagination"
import Spinner from "@/app/shared/components/common/spinner"

import { DensityToggle } from "@/app/shared/components/common/density-toggle"
import { useScorePageState } from "@/app/shared/hooks/use-score-page-state"
import { Body, Container } from "@/app/shared/pages/layout/layout"
import { exportToJson, useExportState } from "@/app/shared/utils/export-utils"

const ONGEKI_SCORES_DENSITY_KEY = "ongeki-scores-density"

export function OngekiScorePage() {
	const version = useOngekiVersion()
	const { data: scores, isLoading } = useOngekiScores()
	const { refetch: fetchExport } = useOngekiScoreExporter()
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
		storageKey: ONGEKI_SCORES_DENSITY_KEY
	})

	const searchItems = useMemo(
		() => (scores || []).map(score => ({ id: score.id, title: score.title || "" })),
		[scores]
	)

	const handleExport = async () => {
		const result = await fetchExport()
		await exportToJson(result.data, {
			filename: `ongeki_kamai_export_${new Date().toISOString().split("T")[0]}.json`,
			onStart: () => setIsExporting(true),
			onComplete: () => setIsExporting(false)
		})
	}

	if (!version) {
		return (
			<Container>
				<Header title="Scores" />
				<Body>
					<div className="text-muted-foreground py-20 text-center">Set your version in settings first</div>
				</Body>
			</Container>
		)
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
				searchProps={{
					items: searchItems,
					onSelect: setSearchQuery,
					placeholder: "Search scores...",
					emptyMessage: "No scores found.",
					groupLabel: "Scores"
				}}
			/>

			<Body>
				<div className="mb-4 flex flex-col gap-4">
					<div className="flex flex-wrap items-center justify-center gap-4 sm:justify-between">
						<KamaiSyncButtons
							onExport={handleExport}
							isExporting={isExporting}
							importDialog={<OngekiKamaiImportDialog existingScores={scores || []} />}
						/>
						<DensityToggle density={density} onChange={setDensity} />
					</div>

					<div className="flex justify-center sm:justify-end">
						<InlineFilters
							filters={scoreFilters}
							filterValues={filterValues}
							onFilterChange={handleFilterChange}
							onClearAll={resetFilters}
						/>
					</div>
				</div>

				{showEmptyState ? (
					<div className="text-muted-foreground py-20 text-center">
						{hasActiveFilters ? "No scores match your filters" : "No scores found"}
					</div>
				) : (
					<>
						{density === "list" ? (
							<OngekiScoreTable scores={paged} version={version} />
						) : (
							<OngekiScoreGrid scores={paged} version={version} />
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