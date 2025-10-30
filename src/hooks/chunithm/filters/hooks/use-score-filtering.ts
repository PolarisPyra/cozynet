import { useMemo } from "react";

import { useChunithmScores, useChunithmVersion } from "@/hooks/chunithm";

import { scoreFilters } from "../definitions/score-filters";
import type { UseChunithmFilteringParams } from "../types/music-types";

export const useChunithmScoreFiltering = ({ searchQuery, filterValues }: UseChunithmFilteringParams) => {
	const { data: scores = [], isLoading } = useChunithmScores();
	const userVersion = useChunithmVersion();
	const version = userVersion ? Number(userVersion) : null;

	const filteredScores = useMemo(() => {
		if (!scores) return [];

		const normalizedQuery = searchQuery.trim().toLowerCase();

		return scores.filter((score) => {
			// Apply search query filter
			if (normalizedQuery && score.title && !score.title.toLowerCase().includes(normalizedQuery)) {
				return false;
			}

			// Apply version filter separately (needs access to user's current version)
			const versionFilterValue = filterValues?.["version"] || "current";
			if (versionFilterValue === "current" && version != null && score.songVersion != null) {
				if (score.songVersion !== version) return false;
			}

			// Apply all other filters
			return scoreFilters.every((filter) => {
				// Skip version filter as it's handled above
				if (filter.identifier === "version") {
					return true;
				}

				const value = filterValues?.[filter.identifier];

				// Handle required filters with default values
				if (filter.isRequired && value === undefined) {
					const firstOptionValue = filter.options?.[0]?.value;
					return filter.predicate(score, firstOptionValue);
				}

				// Skip filters that are not set (undefined values)
				if (value === undefined) {
					return true;
				}

				return filter.predicate(score, value);
			});
		});
	}, [scores, searchQuery, filterValues, version]);

	return {
		filteredScores,
		isLoading,
		version,
	};
};

export const useScoreFilters = () => {
	return scoreFilters;
};
