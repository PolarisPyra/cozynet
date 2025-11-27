import { useState } from "react"

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
import { Body, Container, FilterArea } from "@/app/shared/pages/layout/layout"
import type { FilterValues } from "@/app/shared/types"
import { chunithmBadgeColors } from "@/app/shared/utils/chunithm"

export default function ChunithmScorePage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaults(scoreFilters))

	const { data: scores, isLoading } = useChunithmScores()
	const { data: exportData, isLoading: isLoadingExport, refetch: refetchExport } = useScoreExporter()

	const filtered = useFiltering(scores || [], scoreFilters, searchQuery, filterValues)
	const { page, setPage, totalPages, paged, total, hasMore } = usePagination(filtered, 20, [searchQuery, filterValues])

	const handleExport = async () => {
		try {
			const result = exportData || (await refetchExport()).data
			if (!result) return toast.error("No data")
			const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" })
			const a = document.createElement("a")
			a.href = URL.createObjectURL(blob)
			a.download = "chunithm_scores.json"
			a.click()
			toast.success("Exported")
		} catch {
			toast.error("Export failed")
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

	return (
		<Container>
			<Header
				title="Scores"
				searchProps={{
					items: filtered.slice(0, 100).map(s => ({ id: s.id, title: s.title || "" })),
					searchQuery,
					onSearchChange: setSearchQuery,
					placeholder: "Search...",
					emptyMessage: "No scores.",
					groupLabel: "Scores"
				}}
			/>
			<Body>
				<FilterArea>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<MultiFilter
							filters={scoreFilters}
							filterValues={filterValues}
							onFilterChange={(id, val) => setFilterValues(p => ({ ...p, [id]: val }))}
							onClearAll={() => setFilterValues(getDefaults(scoreFilters))}
						/>
						<Button onClick={handleExport} variant="outline" size="sm" disabled={isLoadingExport}>
							{isLoadingExport ? "..." : "Export"}
						</Button>
					</div>
				</FilterArea>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{paged.map(score => (
						<ChunithmScoreInfoCard key={score.id} score={score} levelColorBadge={chunithmBadgeColors} />
					))}
				</div>

				{filtered.length === 0 && <div className="text-muted-foreground py-20 text-center">No scores found</div>}

				{hasMore && <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />}
			</Body>
		</Container>
	)
}
