import { useState } from "react"

import Header from "@/app/shared/components/common/header"
import { MultiFilter } from "@/app/shared/components/common/multi-filter"
import Spinner from "@/app/shared/components/common/spinner"
import { CardGallery } from "@/app/features/ongeki/components/cards/card-gallery"
import { getDefaultFilterValues, useCardFiltering, useCardFilters } from "@/app/features/ongeki/hooks"
import { Body, Container, FilterArea } from "@/app/shared/pages/layout/layout"
import type { FilterValues } from "@/app/shared/types"

export function CardManagement() {
	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaultFilterValues())

	const filters = useCardFilters()
	const { filteredCards, isLoading, error } = useCardFiltering({
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
		setFilterValues(getDefaultFilterValues())
	}

	const searchItems = filteredCards.map(card => ({
		id: card.cardId,
		title: card.name || ""
	}))

	if (isLoading) return <LoadingState />
	if (error) return <ErrorState />

	return (
		<Container>
			<Header
				title="Cards"
				searchProps={{
					items: searchItems,
					searchQuery,
					onSearchChange: setSearchQuery,
					placeholder: "Search cards...",
					emptyMessage: "No cards found.",
					groupLabel: "Cards"
				}}
			/>
			<Body>
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
				{filteredCards.length === 0 ? (
					<div className="text-muted-foreground flex h-40 items-center justify-center">No cards found</div>
				) : (
					<CardGallery cards={filteredCards} />
				)}
			</Body>
		</Container>
	)
}

function LoadingState() {
	return (
		<Container>
			<Header title="Cards" />
			<div className="flex h-[calc(100vh-64px)] items-center justify-center">
				<Spinner />
			</div>
		</Container>
	)
}

function ErrorState() {
	return (
		<Container>
			<Header title="Cards" />
			<div className="flex h-[calc(100vh-64px)] items-center justify-center">
				<p className="text-destructive">Failed to load cards</p>
			</div>
		</Container>
	)
}
