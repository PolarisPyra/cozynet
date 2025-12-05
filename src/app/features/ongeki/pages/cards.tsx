import { useState } from "react"

import { CardGallery } from "@/app/features/ongeki/components/cards/card-gallery"
import { cardFilters, useOngekiCards } from "@/app/features/ongeki/hooks"
import Header from "@/app/shared/components/common/header"
import { MultiFilter } from "@/app/shared/components/common/multi-filter"
import Spinner from "@/app/shared/components/common/spinner"
import { getDefaults, useFiltering } from "@/app/shared/hooks/use-filtering"
import { Body, Container, FilterArea } from "@/app/shared/pages/layout/layout"
import type { DB, FilterValues } from "@/app/shared/types"

export function CardManagement() {
	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaults(cardFilters))

	const { data, isLoading, error } = useOngekiCards()
	const filtered = useFiltering(data?.cards || [], cardFilters, searchQuery, filterValues, "name")

	if (isLoading) {
		return (
			<Container>
				<Header title="Cards" />
				<Body>
					<div className="flex h-96 items-center justify-center">
						<Spinner />
					</div>
				</Body>
			</Container>
		)
	}

	if (error) {
		return (
			<Container>
				<Header title="Cards" />
				<Body>
					<div className="text-destructive py-20 text-center">Failed to load cards</div>
				</Body>
			</Container>
		)
	}

	return (
		<Container>
			<Header
				title="Cards"
				searchProps={{
					items: filtered.map((c: DB.OngekiUserCard & DB.OngekiStaticCards) => ({ id: c.cardId, title: c.name || "" })),
					onSelect: setSearchQuery,
					placeholder: "Search...",
					emptyMessage: "No cards.",
					groupLabel: "Cards"
				}}
			/>
			<Body>
				<FilterArea>
					<MultiFilter
						filters={cardFilters}
						filterValues={filterValues}
						onFilterChange={(id, val) => setFilterValues(p => ({ ...p, [id]: val }))}
						onClearAll={() => setFilterValues(getDefaults(cardFilters))}
					/>
				</FilterArea>

				{filtered.length === 0 ? (
					<div className="text-muted-foreground py-20 text-center">No cards found</div>
				) : (
					<CardGallery cards={filtered} />
				)}
			</Body>
		</Container>
	)
}
