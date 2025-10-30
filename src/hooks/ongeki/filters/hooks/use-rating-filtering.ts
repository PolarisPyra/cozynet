import { useMemo } from "react";

import { useOngekiVersion } from "@/hooks/ongeki";
import useOngekiRatingData from "@/hooks/ongeki/use-rating-data";

import { getRatingFilters } from "../definitions/rating-filters";
import type { UseMusicFilteringParams } from "../types/music-types";

export const useOngekiRatingFiltering = ({ searchQuery, filterValues }: UseMusicFilteringParams) => {
	const version = useOngekiVersion();

	// Get active category from filter values
	const activeTab = filterValues.category || "base";

	// Pass activeTab to hook so it only fetches data for the active tab
	const { getActiveData, getActiveLoading } = useOngekiRatingData(version || 0, activeTab);

	const activeData = getActiveData(activeTab);
	const isLoading = getActiveLoading(activeTab);

	const filteredRatings = useMemo(() => {
		if (!activeData) return [];

		const normalizedQuery = searchQuery.trim().toLowerCase();
		const ratingFilters = getRatingFilters(version || 0);

		return activeData.filter((rating) => {
			// Apply search query filter
			if (normalizedQuery && rating.title && !rating.title.toLowerCase().includes(normalizedQuery)) {
				return false;
			}

			// Apply all active filters
			return ratingFilters.every((filter) => {
				const value = filterValues?.[filter.identifier];

				// Handle required filters with default values
				if (filter.isRequired && value === undefined) {
					const firstOptionValue = filter.options?.[0]?.value;
					return filter.predicate(rating, firstOptionValue);
				}

				// Skip filters that are not set (undefined values)
				if (value === undefined) {
					return true;
				}

				return filter.predicate(rating, value);
			});
		});
	}, [activeData, searchQuery, filterValues, version]);

	return {
		filteredRatings,
		isLoading,
		version,
	};
};

export const useRatingFilters = (version: number) => {
	return getRatingFilters(version);
};

export const getDefaultRatingFilterValues = () => {
	const defaultValues: Record<string, string> = {};
	// Use a default version to get the base filters for default values
	const baseFilters = getRatingFilters(0);
	baseFilters.forEach((filter) => {
		defaultValues[filter.identifier] = filter.identifier === "category" ? "base" : "all";
	});
	return defaultValues;
};
