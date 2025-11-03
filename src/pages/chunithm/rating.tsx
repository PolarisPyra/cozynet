import { useEffect, useState } from "react"

import ChunithmRatingInfoCard from "@/components/chunithm/rating-info-card"
import Header from "@/components/common/header"
import { MultiFilter } from "@/components/common/multi-filter"
import ResponsiveGrid from "@/components/common/responsive-grid"
import Spinner from "@/components/common/spinner"
import { useChunithmVersion } from "@/hooks/chunithm"
import { getDefaultRatingFilterValues, useChunithmRatingFiltering, useRatingFilters } from "@/hooks/chunithm"
import { getRatingFilters } from "@/hooks/chunithm/filters/definitions/rating-filters"
import { Body, Container, FilterArea } from "@/pages/layout/layout"
import type { FilterValues } from "@/shared/types"
import { chunithmBadgeColors } from "@/utils/chunithm"

/**
 * CHUNITHM Rating System:
 *
 * Version < 17 (~LUMINOUS+):
 * - Rating = Best 30 (B30) + Recent 10
 * - Best 30: Top 30 all-time best scores
 * - Recent 10: 10 most recent high scores
 *
 * Version >= 17 (VERSE~):
 * - Rating = Best 30 (B30) + New 20 (N20)
 * - Best 30: Top 30 all-time best scores
 * - New 20: Top 20 scores from current version songs only
 * - No more "Recent 10" folder
 */

const ChunithmRatingFrames = () => {
	const [searchQuery, setSearchQuery] = useState("")
	const version = useChunithmVersion()
	const ratingFilters = useRatingFilters(version || 0)
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaultRatingFilterValues(version || 0))

	// Update filter values when version changes to ensure tab value is valid
	useEffect(() => {
		if (version) {
			const defaults = getDefaultRatingFilterValues(version)
			const currentFilters = getRatingFilters(version)
			// Only update if current tab is not valid for new version
			const currentTab = filterValues.tab
			const validTabs =
				currentFilters
					.find((f: { identifier: string }) => f.identifier === "tab")
					?.options.map((o: { value: string }) => o.value) || []
			if (currentTab && !validTabs.includes(currentTab)) {
				setFilterValues(defaults)
			}
		}
	}, [version, filterValues.tab])

	const { filteredRatings, isLoading } = useChunithmRatingFiltering({
		searchQuery,
		filterValues
	})

	const handleFilterChange = (identifier: string, value: string) => {
		setFilterValues(prev => ({ ...prev, [identifier]: value }))
	}

	const handleClearAll = () => {
		setFilterValues(getDefaultRatingFilterValues(version || 0))
	}

	const searchItems = filteredRatings.map(rating => ({
		id: rating.idx,
		title: rating.title || ""
	}))

	if (isLoading) return <LoadingState />
	if (!version) return <NoVersionState />

	return (
		<Container>
			<Header
				title="Chunithm Rating"
				searchProps={{
					items: searchItems,
					searchQuery,
					onSearchChange: setSearchQuery,
					placeholder: "Search ratings...",
					emptyMessage: "No ratings found.",
					groupLabel: "Ratings"
				}}
			/>
			<Body>
				<FilterArea>
					<div className="flex justify-start">
						<MultiFilter
							filters={ratingFilters}
							filterValues={filterValues}
							onFilterChange={handleFilterChange}
							onClearAll={handleClearAll}
						/>
					</div>
				</FilterArea>
				{filteredRatings.length === 0 ? (
					<div className="text-muted-foreground flex h-40 items-center justify-center">No songs found</div>
				) : (
					<ResponsiveGrid
						items={filteredRatings}
						loading={isLoading}
						levelColorBadge={chunithmBadgeColors}
						CardComponent={ChunithmRatingInfoCard}
						isPotential={filterValues.tab === "potential"}
					/>
				)}
			</Body>
		</Container>
	)
}

const LoadingState = () => (
	<div className="flex-1">
		<Header title="Chunithm Rating" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<Spinner />
		</div>
	</div>
)

const NoVersionState = () => (
	<div className="relative flex-1 overflow-auto">
		<Header title="Chunithm Rating" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<p className="text-primary">Please set your Chunithm version in settings first</p>
		</div>
	</div>
)

export default ChunithmRatingFrames
