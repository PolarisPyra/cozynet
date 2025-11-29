import { useState, useMemo } from "react"

import { MaimaiDxScoreInfoCard } from "@/app/features/maimaidx/components/score-info-card"
import { scoreFilters, useMaimaiDxScores } from "@/app/features/maimaidx/hooks"
import Header from "@/app/shared/components/common/header"
import { MultiFilter } from "@/app/shared/components/common/multi-filter"
import { Pagination } from "@/app/shared/components/common/pagination"
import Spinner from "@/app/shared/components/common/spinner"
import { getDefaults, useFiltering } from "@/app/shared/hooks/use-filtering"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import { Body, CardGrid, Container, FilterArea } from "@/app/shared/pages/layout/layout"
import type { FilterValues } from "@/app/shared/types"
import { maimaiDxBadgeColors } from "@/app/shared/utils/maimai"

export function MaimaiDxScorePage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaults(scoreFilters))

	const { data: scores, isLoading } = useMaimaiDxScores()

	const filtered = useFiltering(scores || [], scoreFilters, searchQuery, filterValues)
	
	const { page, setPage, totalPages, paged, hasMore } = usePagination(filtered, 20, [searchQuery, filterValues])

	const searchItems = useMemo(
		() => (scores || []).map(s => ({ id: s.id, title: s.title || "" })),
		[scores]
	)

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
	const hasActiveFilters = searchQuery || Object.values(filterValues).some(
		(v, i) => v !== Object.values(getDefaults(scoreFilters))[i]
	)

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
				</FilterArea>

				{showEmptyState ? (
					<div className="text-muted-foreground py-20 text-center">
						{hasActiveFilters 
							? "No scores match your filters" 
							: "No scores found"}
					</div>
				) : (
					<>
						<CardGrid>
							{paged.map(score => (
								<MaimaiDxScoreInfoCard 
									key={score.id} 
									score={score} 
									levelColorBadge={maimaiDxBadgeColors} 
								/>
							))}
						</CardGrid>

						{hasMore && (
							<Pagination 
								page={page} 
								totalPages={totalPages} 
								onPageChange={setPage} 
							/>
						)}
					</>
				)}
			</Body>
		</Container>
	)
}