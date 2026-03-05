import { useEffect, useMemo, useState } from "react"

import ChunithmRatingInfoCard from "@/app/features/chunithm/components/rating-info-card"
import { ratingFilters, useChunithmRatingData, useChunithmVersion } from "@/app/features/chunithm/hooks"
import Header from "@/app/shared/components/common/header"
import { MultiFilter } from "@/app/shared/components/common/multi-filter"
import Spinner from "@/app/shared/components/common/spinner"
import { getDefaults, useFiltering } from "@/app/shared/hooks/use-filtering"
import { Body, CardGrid, Container, FilterArea } from "@/app/shared/pages/layout/layout"
import type { FilterValues, ChunithmRating } from "@/app/shared/types"
import { LEVELS } from "@/app/shared/config/filter-options"
import { LEVEL_CONFIGS } from "@/app/shared/utils/level-filter"
import { chunithmBadgeColors } from "@/app/shared/utils/chunithm"

const CHUNI_LEVEL_ORDER = LEVELS.filter(l => l.value !== "all").map(l => l.value)

const getChuniLevelBucketIndex = (rating: ChunithmRating): number => {
	// Treat invalid or WORLDS END charts as very high so they naturally fall to the ends
	if (rating.level == null || !Number.isFinite(rating.level) || rating.chartId === 5) return Number.POSITIVE_INFINITY

	const idx = CHUNI_LEVEL_ORDER.findIndex(value => LEVEL_CONFIGS.CHUNITHM(rating.level, value))
	return idx === -1 ? Number.POSITIVE_INFINITY : idx
}

export default function ChunithmRatingPage() {
	const version = useChunithmVersion()
	const filters = ratingFilters(version || 0)
	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaults(filters))

	const activeTab = filterValues.tab || "base"
	const { getActiveData, getActiveLoading } = useChunithmRatingData(activeTab)
	const data = getActiveData(activeTab)
	const isLoading = getActiveLoading(activeTab)

	const filtered = useFiltering(data || [], filters, searchQuery, filterValues)

	const sorted = useMemo(() => {
		const list = [...filtered]
		const sortMode = filterValues.sort || "default"

		if (sortMode === "floor") {
			// Lowest level first
			list.sort((a, b) => getChuniLevelBucketIndex(a) - getChuniLevelBucketIndex(b))
		} else if (sortMode === "ceiling") {
			// Highest level first
			list.sort((a, b) => getChuniLevelBucketIndex(b) - getChuniLevelBucketIndex(a))
		}

		return list
	}, [filtered, filterValues.sort])

	useEffect(() => {
		if (version) {
			const newFilters = ratingFilters(version)
			const validTabs = newFilters.find(f => f.identifier === "tab")?.options.map(o => o.value) || []
			if (filterValues.tab && !validTabs.includes(filterValues.tab)) {
				setFilterValues(getDefaults(newFilters))
			}
		}
	}, [version, filterValues.tab])

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
					items: sorted.map((r: ChunithmRating, i: number) => ({ id: i, title: r.title || "" })),
					onSelect: setSearchQuery,
					placeholder: "Search...",
					emptyMessage: "No ratings.",
					groupLabel: "Ratings"
				}}
			/>
			<Body>
				<FilterArea>
					<MultiFilter
						filters={filters}
						filterValues={filterValues}
						onFilterChange={(id, val) => setFilterValues(p => ({ ...p, [id]: val }))}
						onClearAll={() => setFilterValues(getDefaults(filters))}
					/>
				</FilterArea>

				<CardGrid>
					{sorted.map((rating: ChunithmRating, idx: number) => (
						<ChunithmRatingInfoCard
							key={idx}
							score={rating}
							levelColorBadge={chunithmBadgeColors}
							isPotential={filterValues.tab === "potential"}
						/>
					))}
				</CardGrid>

				{sorted.length === 0 && <div className="text-muted-foreground py-20 text-center">No ratings found</div>}
			</Body>
		</Container>
	)
}
