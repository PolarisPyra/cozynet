import { useState } from "react"

import { OngekiRatingDisplay } from "@/app/features/ongeki/components/rating-display"
import { OngekiRatingInfoCard } from "@/app/features/ongeki/components/rating-info-card"
import { ratingFilters, useOngekiRatingData, useOngekiVersion } from "@/app/features/ongeki/hooks"
import Header from "@/app/shared/components/common/header"
import { MultiFilter } from "@/app/shared/components/common/multi-filter"
import { Pagination } from "@/app/shared/components/common/pagination"
import Spinner from "@/app/shared/components/common/spinner"
import { Card, CardContent } from "@/app/shared/components/ui/card"
import { getDefaults, useFiltering } from "@/app/shared/hooks/use-filtering"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import { Body, CardGrid, Container, FilterArea } from "@/app/shared/pages/layout/layout"
import type { FilterValues } from "@/app/shared/types"
import { ongekiBadgeColors } from "@/app/shared/utils/ongeki"

export function OngekiRatingFrames() {
	const version = useOngekiVersion()
	const filters = ratingFilters(version || 0)
	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaults(filters))

	const activeTab = filterValues.category || "base"
	const { getActiveData, getActiveLoading, playerRatingValue, highestRatingValue, ratingDecimals } = useOngekiRatingData(version || 0, activeTab)
	const data = getActiveData(activeTab)
	const isLoading = getActiveLoading(activeTab)

	const filtered = useFiltering(data || [], filters, searchQuery, filterValues)
	const { page, setPage, totalPages, paged, hasMore } = usePagination(filtered, 20, [searchQuery, filterValues])

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
						<OngekiRatingDisplay playerRating={playerRatingValue} highestRating={highestRatingValue} ratingDecimals={ratingDecimals} />
					</CardContent>
				</Card>

				<FilterArea>
					<MultiFilter
						filters={filters}
						filterValues={filterValues}
						onFilterChange={(id, val) => setFilterValues(p => ({ ...p, [id]: val }))}
						onClearAll={() => setFilterValues(getDefaults(filters))}
					/>
				</FilterArea>

				<CardGrid>
					{paged.map((rating: any, idx: number) => (
						<OngekiRatingInfoCard
							key={idx}
							score={rating}
							levelColorBadge={ongekiBadgeColors}
							ongekiVersion={version}
							isRecommend={filterValues.category === "next"}
							activeTab={activeTab}
						/>
					))}
				</CardGrid>

				{filtered.length === 0 && <div className="text-muted-foreground py-20 text-center">No ratings found</div>}

				{hasMore && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
			</Body>
		</Container>
	)
}
