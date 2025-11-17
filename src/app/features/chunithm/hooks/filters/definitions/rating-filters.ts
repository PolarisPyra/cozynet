import { LEVEL_CONFIGS } from "@/app/shared/utils/level-filter"

import type { ChunithmFilterValues, RatingFilter } from "../types/music-types"

// ============================================================================
// LEVEL FILTER
// ============================================================================

/**
 * Filter ratings by difficulty level ranges
 */
export const ratingLevelFilter: RatingFilter = {
	identifier: "level",
	label: "Level",
	options: [
		{ label: "All", value: "all" },
		{ label: "1", value: "1" },
		{ label: "2", value: "2" },
		{ label: "3", value: "3" },
		{ label: "4", value: "4" },
		{ label: "5", value: "5" },
		{ label: "6", value: "6" },
		{ label: "7", value: "7" },
		{ label: "7+", value: "7+" },
		{ label: "8", value: "8" },
		{ label: "8+", value: "8+" },
		{ label: "9", value: "9" },
		{ label: "9+", value: "9+" },
		{ label: "10", value: "10" },
		{ label: "10+", value: "10+" },
		{ label: "11", value: "11" },
		{ label: "11+", value: "11+" },
		{ label: "12", value: "12" },
		{ label: "12+", value: "12+" },
		{ label: "13", value: "13" },
		{ label: "13+", value: "13+" },
		{ label: "14", value: "14" },
		{ label: "14+", value: "14+" },
		{ label: "15", value: "15" },
		{ label: "15+", value: "15+" }
	],
	predicate: (rating, value) => {
		if (!rating.level || rating.chartId === 5) return false
		return LEVEL_CONFIGS.CHUNITHM(rating.level, value)
	}
}

// ============================================================================
// ACHIEVEMENT FILTER
// ============================================================================

/**
 * Filter ratings by achievement status (Full Combo, All Justice, Full Chain)
 */
export const ratingAchievementFilter: RatingFilter = {
	identifier: "achievement",
	label: "Achievement",
	options: [
		{ label: "All", value: "all" },
		{ label: "Full Combo", value: "fullcombo" },
		{ label: "All Justice", value: "alljustice" },
		{ label: "Full Chain", value: "fullchain" }
	],
	predicate: (rating, value) => {
		if (value === "all") return true

		switch (value) {
			case "fullcombo":
				return rating.isFullCombo === 1
			case "alljustice":
				return rating.isAllJustice === 1
			case "fullchain":
				return rating.fullChain === 1
			default:
				return true
		}
	}
}

// ============================================================================
// TAB FILTER
// ============================================================================

/**
 * Filter ratings by tab (Best 30, Recent 10/New 20, Potential)
 * Options change based on version: Version >= 17 gets "New 20", below 17 gets "Recent 10"
 */
export const createRatingTabFilter = (version: number): RatingFilter => {
	const isVerseOrAbove = version >= 17

	return {
		identifier: "tab",
		label: "Tab",
		options: isVerseOrAbove
			? [
					{ label: "New 20", value: "new" },
					{ label: "Best 30", value: "base" },
					{ label: "Potential", value: "potential" }
				]
			: [
					{ label: "Best 30", value: "base" },
					{ label: "Recent 10", value: "recent" },
					{ label: "Potential", value: "potential" }
				],
		predicate: (_rating, _value) => {
			// This filter is handled by the activeTab state in the component
			// The predicate always returns true as the actual filtering is done by the rating data hook
			return true
		}
	}
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all rating filters for a specific version
 */
export const getRatingFilters = (version: number): RatingFilter[] => {
	const tabFilter = createRatingTabFilter(version)
	return [tabFilter, ratingLevelFilter, ratingAchievementFilter]
}

/**
 * Get default filter values for ratings
 * @param version - The game version to get appropriate defaults for
 */
export const getDefaultRatingFilterValues = (version: number = 0): ChunithmFilterValues => {
	const defaultValues: ChunithmFilterValues = {}
	const filters = getRatingFilters(version)
	filters.forEach(filter => {
		// Use the first option as the default for each filter
		const firstOptionValue = filter.options?.[0]?.value
		defaultValues[filter.identifier] = firstOptionValue || "all"
	})
	return defaultValues
}

/**
 * Hook to get rating filters for current version
 */
export const useRatingFilters = (version: number) => {
	return getRatingFilters(version)
}
