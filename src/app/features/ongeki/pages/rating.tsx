import { useState } from "react"

import Header from "@/app/shared/components/common/header"
import { MultiFilter } from "@/app/shared/components/common/multi-filter"
import ResponsiveGrid from "@/app/shared/components/common/responsive-grid"
import Spinner from "@/app/shared/components/common/spinner"
import { OngekiRatingDisplay } from "@/app/features/ongeki/components/rating-display"
import { OngekiRatingInfoCard } from "@/app/features/ongeki/components/rating-info-card"
import { Card, CardContent } from "@/app/shared/components/ui/card"
import {
	getDefaultRatingFilterValues,
	useOngekiRatingFiltering,
	useOngekiVersion,
	useRatingFilters
} from "@/app/features/ongeki/hooks"
import useOngekiRatingData from "@/app/features/ongeki/hooks/use-rating-data"
import { Body, Container, FilterArea } from "@/app/shared/pages/layout/layout"
import type { FilterValues } from "@/app/shared/types"
import { ongekiBadgeColors } from "@/app/shared/utils/ongeki"

export function OngekiRatingFrames() {
	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaultRatingFilterValues())

	const version = useOngekiVersion()
	const filters = useRatingFilters(version || 0)
	const { playerRatingValue, highestRatingValue, ratingDecimals } = useOngekiRatingData(version || 0)

	const { filteredRatings, isLoading } = useOngekiRatingFiltering({
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
				title="Ongeki Rating"
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
						<OngekiRatingDisplay
							playerRating={playerRatingValue}
							highestRating={highestRatingValue}
							ratingDecimals={ratingDecimals}
						/>
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
						levelColorBadge={ongekiBadgeColors}
						ongekiVersion={version}
						CardComponent={OngekiRatingInfoCard}
						isRecommend={filterValues.category === "next"}
					/>
				)}
			</Body>
		</Container>
	)
}

function LoadingState() {
	return (
		<Container>
			<Header title="Ongeki Rating" />
			<div className="flex h-[calc(100vh-64px)] items-center justify-center">
				<Spinner />
			</div>
		</Container>
	)
}

function NoVersionState() {
	return (
		<Container>
			<Header title="Ongeki Rating" />
			<div className="flex h-[calc(100vh-64px)] items-center justify-center">
				<p className="text-primary">Please set your Ongeki version in settings first</p>
			</div>
		</Container>
	)
}
