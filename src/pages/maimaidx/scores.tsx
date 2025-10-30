import { useState } from "react";

import Header from "@/components/common/header";
import { MultiFilter } from "@/components/common/multi-filter";
import ResponsiveGrid from "@/components/common/responsive-grid";
import Spinner from "@/components/common/spinner";
import MaimaiDxScoreInfoCard from "@/components/maimaidx/score-info-card";
import {
	getDefaultScoreFilterValues,
	useMaimaiDxScoreFiltering,
	useMaimaiDxVersion,
	useScoreFilters,
} from "@/hooks/maimaidx";
import type { FilterValues } from "@/shared/types";
import { maimaiDxBadgeColors } from "@/utils/helpers";

const MaimaiDxScorePage = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaultScoreFilterValues());

	const version = useMaimaiDxVersion();
	const versionNum = version ? Number(version) : null;
	const scoreFilters = useScoreFilters();
	const { filteredScores, isLoading } = useMaimaiDxScoreFiltering({
		searchQuery,
		filterValues,
		versionNum,
		showAllScores: false,
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
		<div className="relative flex-1 overflow-auto">
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
			<div className="mb-4 px-4 pb-4 sm:py-0">
				<div className="border-border bg-background/95 flex-shrink-0 rounded-sm backdrop-blur-sm">
					<div className="py-3">
						<div className="flex justify-start">
							<MultiFilter
								filters={scoreFilters}
								filterValues={filterValues}
								onFilterChange={handleFilterChange}
								onClearAll={handleClearAll}
							/>
						</div>
					</div>
				</div>
				<ResponsiveGrid
					items={filteredScores}
					loading={isLoading}
					levelColorBadge={maimaiDxBadgeColors}
					CardComponent={MaimaiDxScoreInfoCard}
				/>
			</div>
		</div>
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

const NoVersionState = () => (
	<div className="flex-1">
		<Header title="Scores" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<p className="text-primary">Please set your maimai DX version in settings first</p>
		</div>
	</div>
);

export default MaimaiDxScorePage;
