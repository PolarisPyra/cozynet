import { useState } from "react"

import { MaimaiRatingDisplay } from "@/app/features/maimaidx/components/rating-display"
import { MaimaiRatingInfoCard } from "@/app/features/maimaidx/components/rating-info-card"
import {
	getDefaultRatingFilterValues,
	useMaimaiDxRatingFiltering,
	useMaimaiDxVersion,
	useRatingFilters
} from "@/app/features/maimaidx/hooks"
import Header from "@/app/shared/components/common/header"
import { MultiFilter } from "@/app/shared/components/common/multi-filter"
import ResponsiveGrid from "@/app/shared/components/common/responsive-grid"
import Spinner from "@/app/shared/components/common/spinner"
import { Card, CardContent } from "@/app/shared/components/ui/card"
import { Body, Container, FilterArea } from "@/app/shared/pages/layout/layout"
import type { FilterValues } from "@/app/shared/types"
import { maimaiDxBadgeColors } from "@/app/shared/utils/maimai"

export function MaimaiDxRatingFrames() {
	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaultRatingFilterValues())

	const version = useMaimaiDxVersion()
	const filters = useRatingFilters()
	const { filteredRatings, isLoading, playerRatingValue, highestRatingValue } = useMaimaiDxRatingFiltering({
		searchQuery,
		filterValues
	})

	const handleFilterChange = (identifier: string, value: string) => {
		setFilterValues(prev => ({
			...prev,
			[identifier]: value
		}))
	}

	const handleClearAll = () => {
		setFilterValues(getDefaultRatingFilterValues())
	}

	const searchItems = filteredRatings
		.filter((rating): rating is typeof rating & { musicId: number } => rating.musicId !== null)
		.map(rating => ({
			id: rating.musicId,
			title: rating.title || ""
		}))

	if (isLoading) return <LoadingState />
	if (!version) return <NoVersionState />

	return (
		<Container>
			<Header
				title="Maimai DX Rating"
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
				<Card className="rounded-sm">
					<CardContent className="px-4 py-2">
						<MaimaiRatingDisplay playerRating={playerRatingValue} highestRating={highestRatingValue} />
					</CardContent>
				</Card>
				<FilterArea>
					<div className="flex justify-start">
						<MultiFilter
							filters={filters}
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
						levelColorBadge={maimaiDxBadgeColors}
						CardComponent={MaimaiRatingInfoCard}
					/>
				)}
			</Body>
		</Container>
	)
}

function LoadingState() {
	return (
		<Container>
			<Header title="Maimai DX Rating" />
			<div className="flex h-[calc(100vh-64px)] items-center justify-center">
				<Spinner />
			</div>
		</Container>
	)
}

function NoVersionState() {
	return (
		<Container>
			<Header title="Maimai DX Rating" />
			<div className="flex h-[calc(100vh-64px)] items-center justify-center">
				<p className="text-primary">Please set your Maimai DX version in settings first</p>
			</div>
		</Container>
	)
}

export default MaimaiDxRatingFrames
