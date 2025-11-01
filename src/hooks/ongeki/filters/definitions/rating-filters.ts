import type { FilterValues } from "@/shared/types"
import { LEVEL_CONFIGS } from "@/utils/level-filter"

import type { RatingFilter } from "../types/music-types"

// ============================================================================
// CATEGORY FILTER
// ============================================================================

/**
 * Filter ratings by category (Top 50/30, Current 10/Recent 10, PScore/Recent 15, Recommended)
 * Options change based on version: Version >= 8 gets "Top 50", "Current 10", "PScore"; below 8 gets "Top 30", "Recent 10", "Recent 15"
 */
export const createRatingCategoryFilter = (version: number): RatingFilter => {
	const isRefreshOrAbove = version >= 8

	return {
		identifier: "category",
		label: "Category",
		options: isRefreshOrAbove
			? [
					{ label: "Top 50", value: "base" },
					{ label: "Current 10", value: "current" },
					{ label: "PScore", value: "pscore" },
					{ label: "Recommended", value: "next" }
				]
			: [
					{ label: "Top 30", value: "base" },
					{ label: "Recent 10", value: "current" },
					{ label: "Recent 15", value: "recent" },
					{ label: "Recommended", value: "next" }
				],
		predicate: (_rating, _value) => {
			return true
		}
	}
}

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
		if (!rating.level) return false
		return LEVEL_CONFIGS.ONGEKI(rating.level, value)
	}
}

// ============================================================================
// ACHIEVEMENT FILTER
// ============================================================================

/**
 * Filter ratings by achievement status (Full Bell, Full Combo, All Breake)
 */
export const ratingAchievementFilter: RatingFilter = {
	identifier: "achievement",
	label: "Achievement",
	options: [
		{ label: "All", value: "all" },
		{ label: "Full Bell", value: "fullbell" },
		{ label: "Full Combo", value: "fullcombo" },
		{ label: "All Break", value: "allbreake" }
	],
	predicate: (rating, value) => {
		if (value === "all") return true

		switch (value) {
			case "fullbell":
				return rating.isFullBell === 1
			case "fullcombo":
				return rating.isFullCombo === 1
			case "allbreake":
				return rating.isAllBreake === 1
			default:
				return true
		}
	}
}

// ============================================================================
// EXPORT ALL FILTERS
// ============================================================================

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all rating filters for a specific version
 */
export const getRatingFilters = (version: number): RatingFilter[] => {
	const categoryFilter = createRatingCategoryFilter(version)
	return [categoryFilter, ratingLevelFilter, ratingAchievementFilter]
}

/**
 * Get default filter values for ratings
 */
export const getDefaultRatingFilterValues = (): FilterValues => {
	const defaultValues: FilterValues = {}
	// Use a default version to get the base filters for default values
	const baseFilters = getRatingFilters(0)
	baseFilters.forEach(filter => {
		defaultValues[filter.identifier] = filter.identifier === "category" ? "base" : "all"
	})
	return defaultValues
}

/**
 * Hook to get rating filters for current version
 */
export const useRatingFilters = (version: number) => {
	return getRatingFilters(version)
}
