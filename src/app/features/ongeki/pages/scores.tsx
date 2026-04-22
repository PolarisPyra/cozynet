import { useMemo, useState } from "react"

import { toast } from "sonner"

import { OngekiKamaiImportDialog } from "@/app/features/ongeki/components/kamai-import-dialog"
import { OngekiScoreInfoCard } from "@/app/features/ongeki/components/score-info-card"
import { scoreFilters, useOngekiScoreExporter, useOngekiScores, useOngekiVersion } from "@/app/features/ongeki/hooks"
import Header from "@/app/shared/components/common/header"
import { MultiFilter } from "@/app/shared/components/common/multi-filter"
import { Pagination } from "@/app/shared/components/common/pagination"
import Spinner from "@/app/shared/components/common/spinner"
import { Button } from "@/app/shared/components/ui/button"
import { getDefaults, useFiltering } from "@/app/shared/hooks/use-filtering"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import { Body, CardGrid, Container, FilterArea } from "@/app/shared/pages/layout/layout"
import type { FilterValues } from "@/app/shared/types"
import { ongekiBadgeColors } from "@/app/shared/utils/ongeki"

export function OngekiScorePage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaults(scoreFilters))
	const [isExporting, setIsExporting] = useState(false)

	const version = useOngekiVersion()
	const { data: scores, isLoading } = useOngekiScores()
	const { refetch: fetchExport } = useOngekiScoreExporter()

	const filtered = useFiltering(scores || [], scoreFilters, searchQuery, filterValues)

	const { page, setPage, totalPages, paged, hasMore } = usePagination(filtered, 20, [searchQuery, filterValues])

	const searchItems = useMemo(() => (scores || []).map(s => ({ id: s.id, title: s.title || "" })), [scores])

	const handleExport = async () => {
		setIsExporting(true)
		try {
			const result = await fetchExport()

			if (!result.data) {
				toast.error("No data to export")
				return
			}

			const blob = new Blob([JSON.stringify(result.data, null, 2)], {
				type: "application/json"
			})
			const url = URL.createObjectURL(blob)
			const a = document.createElement("a")
			a.href = url
			a.download = `ongeki_kamai_export_${new Date().toISOString().split("T")[0]}.json`
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			URL.revokeObjectURL(url)

			toast.success("Scores exported successfully")
		} catch (error) {
			console.error("Export error:", error)
			toast.error("Failed to export scores")
		} finally {
			setIsExporting(false)
		}
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

	const showEmptyState = !isLoading && filtered.length === 0
	const hasActiveFilters =
		searchQuery || Object.values(filterValues).some((v, i) => v !== Object.values(getDefaults(scoreFilters))[i])

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
				<FilterArea>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<MultiFilter
							filters={scoreFilters}
							filterValues={filterValues}
							onFilterChange={(id, val) => {
								setFilterValues(prev => ({ ...prev, [id]: val }))
								setPage(1) // Reset to first page when filters change
							}}
							onClearAll={() => {
								setFilterValues(getDefaults(scoreFilters))
								setPage(1)
							}}
						/>
						<div className="flex flex-wrap gap-2">
							<Button onClick={handleExport} variant="outline" size="sm" disabled={isExporting}>
								{isExporting ? "Exporting..." : "Export for Kamai"}
							</Button>
							<OngekiKamaiImportDialog existingScores={scores || []} />
						</div>
					</div>
				</FilterArea>

				{showEmptyState ? (
					<div className="text-muted-foreground py-20 text-center">
						{hasActiveFilters ? "No scores match your filters" : "No scores found"}
					</div>
				) : (
					<>
						<CardGrid>
							{paged.map(score => (
								<OngekiScoreInfoCard
									key={score.id}
									score={score}
									levelColorBadge={ongekiBadgeColors}
									ongekiVersion={version}
								/>
							))}
						</CardGrid>

						{hasMore && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
					</>
				)}
			</Body>
		</Container>
	)
}
