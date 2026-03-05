import { useEffect, useMemo, useState } from "react"

import ChunithmRatingInfoCard from "@/app/features/chunithm/components/rating-info-card"
import { ratingFilters, useChunithmRatingData, useChunithmVersion } from "@/app/features/chunithm/hooks"
import Header from "@/app/shared/components/common/header"
import { MultiFilter } from "@/app/shared/components/common/multi-filter"
import Spinner from "@/app/shared/components/common/spinner"
import { getDefaults, useFiltering } from "@/app/shared/hooks/use-filtering"
import { Body, CardGrid, Container, FilterArea } from "@/app/shared/pages/layout/layout"
import type { FilterValues, ChunithmRating } from "@/app/shared/types"
import { chunithmBadgeColors } from "@/app/shared/utils/chunithm"

const getLevelSortValue = (rating: ChunithmRating): number => {
	// For normal charts use the numeric constant level directly.
	// Treat missing levels or WORLDS END as very large so they fall to the end for "Floor" and to the front for "Ceiling".
	if (rating.level == null || !Number.isFinite(rating.level) || rating.chartId === 5) {
		return Number.POSITIVE_INFINITY
	}
	return rating.level
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
			// Strictly lowest level first
			list.sort((a, b) => getLevelSortValue(a) - getLevelSortValue(b))
		} else if (sortMode === "ceiling") {
			// Strictly highest level first
			list.sort((a, b) => getLevelSortValue(b) - getLevelSortValue(a))
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
