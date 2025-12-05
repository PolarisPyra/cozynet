import { useState } from "react"

import { MaimaiRatingDisplay } from "@/app/features/maimaidx/components/rating-display"
import { MaimaiRatingInfoCard } from "@/app/features/maimaidx/components/rating-info-card"
import { ratingFilters, useMaimaiDxRatingData, useMaimaiDxVersion } from "@/app/features/maimaidx/hooks"
import Header from "@/app/shared/components/common/header"
import { MultiFilter } from "@/app/shared/components/common/multi-filter"
import { Pagination } from "@/app/shared/components/common/pagination"
import Spinner from "@/app/shared/components/common/spinner"
import { Card, CardContent } from "@/app/shared/components/ui/card"
import { getDefaults, useFiltering } from "@/app/shared/hooks/use-filtering"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import { Body, CardGrid, Container, FilterArea } from "@/app/shared/pages/layout/layout"
import type { FilterValues } from "@/app/shared/types"
import { maimaiDxBadgeColors } from "@/app/shared/utils/maimai"

interface MaimaiDxRatingFramesProps {
	disablePagination?: boolean
}

export function MaimaiDxRatingFrames({ disablePagination = true }: MaimaiDxRatingFramesProps = {}) {
	const version = useMaimaiDxVersion()
	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaults(ratingFilters))

	const activeTab = filterValues.tab || "base"
	const { activeData, isLoading, playerRatingValue, highestRatingValue } = useMaimaiDxRatingData(activeTab)

	const filtered = useFiltering(activeData || [], ratingFilters, searchQuery, filterValues)
	const pagination = usePagination(filtered, 20, [searchQuery, filterValues])
	const displayItems = disablePagination ? filtered : pagination.paged

	if (!version) {
		return (
			<Container>
				<Header title="Rating" />
				<Body>
					<div className="text-muted-foreground py-20 text-center">Set your version in settings first</div>
				</Body>
			</Container>
		)
	}

	if (isLoading) {
		return (
			<Container>
				<Header title="Rating" />
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
				title="Rating"
				searchProps={{
					items: filtered.map((r: any, i: number) => ({ id: i, title: r.title || "" })),
					onSelect: setSearchQuery,
					placeholder: "Search...",
					emptyMessage: "No ratings.",
					groupLabel: "Ratings"
				}}
			/>
			<Body>
				<Card className="mb-4 rounded-sm">
					<CardContent className="px-4 py-2">
						<MaimaiRatingDisplay playerRating={playerRatingValue} highestRating={highestRatingValue} />
					</CardContent>
				</Card>

				<FilterArea>
					<MultiFilter
						filters={ratingFilters}
						filterValues={filterValues}
						onFilterChange={(id, val) => setFilterValues(p => ({ ...p, [id]: val }))}
						onClearAll={() => setFilterValues(getDefaults(ratingFilters))}
					/>
				</FilterArea>

				<CardGrid>
					{displayItems.map((rating: any, idx: number) => (
						<MaimaiRatingInfoCard key={idx} score={rating} levelColorBadge={maimaiDxBadgeColors} />
					))}
				</CardGrid>

				{filtered.length === 0 && <div className="text-muted-foreground py-20 text-center">No ratings found</div>}

				{!disablePagination && (
					<Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={pagination.setPage} />
				)}
			</Body>
		</Container>
	)
}

export default MaimaiDxRatingFrames
