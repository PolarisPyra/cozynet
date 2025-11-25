import type { FilterValues } from "@/app/shared/types"
import { LEVEL_CONFIGS } from "@/app/shared/utils/level-filter"

import type { ScoreFilter } from "../types/music-types"

// ============================================================================
// LEVEL FILTER
// ============================================================================

/**
 * Filter scores by difficulty level
 */
export const scoreLevelFilter: ScoreFilter = {
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
	predicate: (score, value) => {
		if (!score.difficulty) return false
		return LEVEL_CONFIGS.MAIMAI(score.difficulty, value)
	}
}

// ============================================================================
// EXPORT ALL FILTERS
// ============================================================================

/**
 * Array of all available score filters
 */
export const scoreFilters: ScoreFilter[] = [scoreLevelFilter]

/**
 * Get default filter values for scores
 */
export const getDefaultScoreFilterValues = (): FilterValues => {
	const defaultValues: FilterValues = {}
	scoreFilters.forEach(filter => {
		defaultValues[filter.identifier] = "all"
	})
	return defaultValues
}

/**
 * Hook to get score filters
 */
export const useScoreFilters = () => scoreFilters
