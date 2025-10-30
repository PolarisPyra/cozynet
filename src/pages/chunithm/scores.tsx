import { useState } from "react";

import ChunithmScoreInfoCard from "@/components/chunithm/score-info-card";
import Header from "@/components/common/header";
import { MultiFilter } from "@/components/common/multi-filter";
import ResponsiveGrid from "@/components/common/responsive-grid";
import Spinner from "@/components/common/spinner";
import {
	type ChunithmFilterValues,
	getDefaultScoreFilterValues,
	useNewScoreFiltering as useChunithmScoreFiltering,
	useScoreFilters,
} from "@/hooks/chunithm";
import { Body, Container, FilterArea } from "@/pages/layout/layout";
import { chunithmBadgeColors } from "@/utils/helpers";

const ChunithmScorePage = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [filterValues, setFilterValues] = useState<ChunithmFilterValues>(getDefaultScoreFilterValues());

	const scoreFilters = useScoreFilters();
	const { filteredScores, isLoading } = useChunithmScoreFiltering({ searchQuery, filterValues });

	const handleFilterChange = (identifier: string, value: string) => {
		setFilterValues((prev) => ({ ...prev, [identifier]: value }));
	};

	const handleClearAll = () => {
		setFilterValues(getDefaultScoreFilterValues());
	};

	const searchItems = filteredScores.map((score) => ({
		id: score.id,
		title: score.title || "",
	}));

	if (isLoading) return <LoadingState />;

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
							filters={scoreFilters}
							filterValues={filterValues}
							onFilterChange={handleFilterChange}
							onClearAll={handleClearAll}
						/>
					</div>
				</FilterArea>
				<ResponsiveGrid
					items={filteredScores}
					loading={isLoading}
					levelColorBadge={chunithmBadgeColors}
					CardComponent={ChunithmScoreInfoCard}
				/>
			</Body>
		</Container>
	);
};

const LoadingState = () => (
	<div className="flex-1">
		<Header title="Scores" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<Spinner size={24} color="#ffffff" />
		</div>
	</div>
);

export default ChunithmScorePage;
