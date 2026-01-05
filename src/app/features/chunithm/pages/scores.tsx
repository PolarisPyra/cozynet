import { useMemo, useState } from "react"

import { toast } from "sonner"

import ChunithmScoreInfoCard from "@/app/features/chunithm/components/score-info-card"
import { scoreFilters, useChunithmScores, useScoreExporter } from "@/app/features/chunithm/hooks"
import Header from "@/app/shared/components/common/header"
import { MultiFilter } from "@/app/shared/components/common/multi-filter"
import { Pagination } from "@/app/shared/components/common/pagination"
import Spinner from "@/app/shared/components/common/spinner"
import { Button } from "@/app/shared/components/ui/button"
import { getDefaults, useFiltering } from "@/app/shared/hooks/use-filtering"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import { Body, CardGrid, Container, FilterArea } from "@/app/shared/pages/layout/layout"
import type { FilterValues } from "@/app/shared/types"
import { chunithmBadgeColors } from "@/app/shared/utils/chunithm"

export default function ChunithmScorePage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaults(scoreFilters))
	const [isExporting, setIsExporting] = useState(false)

	const { data: scores, isLoading } = useChunithmScores()
	const { refetch: fetchExport } = useScoreExporter()

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
			a.download = `chunithm_kamai_export_${new Date().toISOString().split("T")[0]}.json`
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
						<Button onClick={handleExport} variant="outline" size="sm" disabled={isExporting}>
							{isExporting ? "Exporting..." : "Export for Kamai"}
						</Button>
					</div>
				</FilterArea>

				{showEmptyState ? (
					<div className="text-muted-foreground py-20 text-center">
						{searchQuery || Object.values(filterValues).some(v => v !== getDefaults(scoreFilters)[0])
							? "No scores match your filters"
							: "No scores found"}
					</div>
				) : (
					<>
						<CardGrid>
							{paged.map(score => (
								<ChunithmScoreInfoCard key={score.id} score={score} levelColorBadge={chunithmBadgeColors} />
							))}
						</CardGrid>

						{hasMore && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
					</>
				)}
			</Body>
		</Container>
	)
}
