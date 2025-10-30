import { useState } from "react";

import Header from "@/components/common/header";
import { MultiFilter } from "@/components/common/multi-filter";
import Spinner from "@/components/common/spinner";
import CardGallery from "@/components/ongeki/cards/card-gallery";
import { getDefaultFilterValues, useCardFiltering, useCardFilters } from "@/hooks/ongeki";
import { Body, Container, FilterArea } from "@/pages/layout/layout";
import type { FilterValues } from "@/shared/types";

const CardManagement = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaultFilterValues());

	const filters = useCardFilters();
	const { filteredCards, isLoading, error } = useCardFiltering({
		searchQuery,
		filterValues,
	});

	const handleFilterChange = (identifier: string, value: string) => {
		setFilterValues((prev) => ({
			...prev,
			[identifier]: value,
		}));
	};

	const handleClearAll = () => {
		setFilterValues(getDefaultFilterValues());
	};

	const searchItems = filteredCards.map((card) => ({
		id: card.cardId,
		title: card.name || "",
	}));

	if (isLoading) return <LoadingState />;
	if (error) return <ErrorState />;

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
					groupLabel: "Cards",
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
	);
};

const LoadingState = () => (
	<Container>
		<Header title="Cards" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<Spinner />
		</div>
	</Container>
);

const ErrorState = () => (
	<Container>
		<Header title="Cards" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<p className="text-destructive">Failed to load cards</p>
		</div>
	</Container>
);

export default CardManagement;
