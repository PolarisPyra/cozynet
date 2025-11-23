import { LEVEL_CONFIGS } from "@/app/shared/utils/level-filter"

import type { RatingFilter } from "../types/music-types"

// ============================================================================
// TAB FILTER
// ============================================================================

/**
 * Filter ratings by tab (base = B35, new = B15)
 */
export const ratingTabFilter: RatingFilter = {
	identifier: "tab",
	label: "Tab",
	isRequired: true,
	options: [
		{ label: "Best 35", value: "base" },
		{ label: "Best 15", value: "new" }
	],
	predicate: () => true // Tab filtering is handled by the data hook
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
		if (!rating.difficulty) return false
		return LEVEL_CONFIGS.MAIMAI(rating.difficulty, value)
	}
}

// ============================================================================
// ACHIEVEMENT FILTER
// ============================================================================

/**
 * Filter ratings by achievement status (Full Combo, All Perfect, Full Sync)
 */
export const ratingAchievementFilter: RatingFilter = {
	identifier: "achievement",
	label: "Achievement",
	options: [
		{ label: "All", value: "all" },
		{ label: "Full Combo", value: "fc" },
		{ label: "All Perfect", value: "ap" },
		{ label: "Full Sync", value: "fs" },
		{ label: "Full Deluxe", value: "fdx" }
	],
	predicate: (rating, value) => {
		if (value === "all") return true

		switch (value) {
			case "fc":
				return rating.comboStatus === 1 || rating.comboStatus === 2
			case "ap":
				return rating.comboStatus === 3 || rating.comboStatus === 4
			case "fs":
				return rating.syncStatus === 1 || rating.syncStatus === 2
			case "fdx":
				return rating.syncStatus === 3 || rating.syncStatus === 4
			default:
				return true
		}
	}
}

// ============================================================================
// FILTER COLLECTION
// ============================================================================

export const getRatingFilters = (): RatingFilter[] => {
	return [ratingTabFilter, ratingLevelFilter, ratingAchievementFilter]
}

export const getDefaultRatingFilterValues = () => ({
	tab: "base",
	level: "all",
	achievement: "all"
})
