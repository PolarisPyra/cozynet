import { useState } from "react";

import Header from "@/components/common/header";
import { MultiFilter } from "@/components/common/multi-filter";
import ResponsiveGrid from "@/components/common/responsive-grid";
import Spinner from "@/components/common/spinner";
import OngekiRatingDisplay from "@/components/ongeki/rating-display";
import OngekiRatingInfoCard from "@/components/ongeki/rating-info-card";
import { Card, CardContent } from "@/components/ui/card";
import {
	getDefaultRatingFilterValues,
	useOngekiRatingFiltering,
	useOngekiVersion,
	useRatingFilters,
} from "@/hooks/ongeki";
import useOngekiRatingData from "@/hooks/ongeki/use-rating-data";
import { Body, Container, FilterArea } from "@/pages/layout/layout";
import type { FilterValues } from "@/shared/types";
import { ongekiBadgeColors } from "@/utils/helpers";

const OngekiRatingFrames = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaultRatingFilterValues());

	const version = useOngekiVersion();
	const filters = useRatingFilters(version || 0);
	const { playerRatingValue, highestRatingValue, ratingDecimals, isRefreshOrAbove } = useOngekiRatingData(version || 0);

	const { filteredRatings, isLoading } = useOngekiRatingFiltering({
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
		setFilterValues(getDefaultRatingFilterValues());
	};

	const searchItems = filteredRatings
		.filter((rating): rating is typeof rating & { musicId: number } => rating.musicId !== null)
		.map((rating) => ({
			id: rating.musicId,
			title: rating.title || "",
		}));

	if (isLoading) return <LoadingState />;
	if (!version) return <NoVersionState />;

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
					groupLabel: "Ratings",
				}}
			/>
			<Body>
				<Card className="rounded-sm">
					<CardContent className="px-4 py-2">
						<OngekiRatingDisplay
							playerRating={playerRatingValue}
							highestRating={highestRatingValue}
							ratingDecimals={ratingDecimals}
							isRefreshOrAbove={isRefreshOrAbove}
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
						isRefreshOrAbove={isRefreshOrAbove}
						CardComponent={OngekiRatingInfoCard}
						isRecommend={filterValues.category === "next"}
					/>
				)}
			</Body>
		</Container>
	);
};

const LoadingState = () => (
	<Container>
		<Header title="Ongeki Rating" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<Spinner />
		</div>
	</Container>
);

const NoVersionState = () => (
	<Container>
		<Header title="Ongeki Rating" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<p className="text-primary">Please set your Ongeki version in settings first</p>
		</div>
	</Container>
);

export default OngekiRatingFrames;
