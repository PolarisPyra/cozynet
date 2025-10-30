import { useState } from "react";

import Header from "@/components/common/header";
import { MultiFilter } from "@/components/common/multi-filter";
import ResponsiveGrid from "@/components/common/responsive-grid";
import Spinner from "@/components/common/spinner";
import OngekiScoreInfoCard from "@/components/ongeki/score-info-card";
import {
	type MusicFilterValues,
	getDefaultScoreFilterValues,
	useOngekiScoreFiltering,
	useOngekiVersion,
	useScoreFilters,
} from "@/hooks/ongeki";
import { Body, Container, FilterArea } from "@/pages/layout/layout";
import { ongekiBadgeColors } from "@/utils/helpers";

const OngekiScorePage = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [filterValues, setFilterValues] = useState<MusicFilterValues>(getDefaultScoreFilterValues());

	const version = useOngekiVersion();
	const filters = useScoreFilters();
	const { filteredScores, isLoading, isRefreshOrAbove } = useOngekiScoreFiltering({
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
		setFilterValues(getDefaultScoreFilterValues());
	};

	const searchItems = filteredScores.map((score) => ({
		id: score.id,
		title: score.title || "",
	}));

	if (isLoading) return <LoadingState />;
	if (!version) return <NoVersionState />;

	return (
		<Container>
			<Header
				title="Scores"
				searchProps={{
					items: searchItems,
					searchQuery,
					onSearchChange: setSearchQuery,
					placeholder: "Search scores...",
					emptyMessage: "No scores found.",
					groupLabel: "Scores",
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
				<ResponsiveGrid
					items={filteredScores}
					loading={isLoading}
					isRefreshOrAbove={isRefreshOrAbove}
					levelColorBadge={ongekiBadgeColors}
					CardComponent={OngekiScoreInfoCard}
				/>
			</Body>
		</Container>
	);
};

const LoadingState = () => (
	<Container>
		<Header title="Scores" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<Spinner size={24} color="#ffffff" />
		</div>
	</Container>
);

const NoVersionState = () => (
	<Container>
		<Header title="Scores" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<p className="text-primary">Please set your Ongeki version in settings first</p>
		</div>
	</Container>
);

export default OngekiScorePage;
