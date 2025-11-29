import { useState } from "react"

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
	const { page, setPage, totalPages, paged, total, hasMore } = usePagination(filtered, 20, [searchQuery, filterValues])

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
					items: filtered.map(s => ({ id: s.id, title: s.title || "" })),
					onSelect: setSearchQuery,
					placeholder: "Search...",
					emptyMessage: "No scores.",
					groupLabel: "Scores"
				}}
			/>
			<Body>
				<FilterArea>
					<MultiFilter
						filters={scoreFilters}
						filterValues={filterValues}
						onFilterChange={(id, val) => setFilterValues(p => ({ ...p, [id]: val }))}
						onClearAll={() => setFilterValues(getDefaults(scoreFilters))}
					/>
				</FilterArea>

				<CardGrid>
					{paged.map(score => (
						<MaimaiDxScoreInfoCard key={score.id} score={score} levelColorBadge={maimaiDxBadgeColors} />
					))}
				</CardGrid>

				{filtered.length === 0 && <div className="text-muted-foreground py-20 text-center">No scores found</div>}

				{hasMore && <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />}
			</Body>
		</Container>
	)
}
