import type { FilterValues } from "@/shared/types";
import { LEVEL_CONFIGS } from "@/utils/level-filter";

import type { ScoreFilter } from "../types/music-types";

// ============================================================================
// LEVEL FILTER
// ============================================================================

/**
 * Filter scores by difficulty level ranges
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
		{ label: "15+", value: "15+" },
	],
	predicate: (score, value) => {
		if (!score.level || score.chartId === 5) return false;
		return LEVEL_CONFIGS.CHUNITHM(score.level, value);
	},
};
// ============================================================================
// ACHIEVEMENT FILTER
// ============================================================================

/**
 * Filter scores by achievement status (Full Combo, All Justice, Full Chain)
 */
export const scoreAchievementFilter: ScoreFilter = {
	identifier: "achievement",
	label: "Achievement",
	options: [
		{ label: "All", value: "all" },
		{ label: "Full Combo", value: "fullcombo" },
		{ label: "All Justice", value: "alljustice" },
		{ label: "Full Chain", value: "fullchain" },
	],
	predicate: (score, value) => {
		if (value === "all") return true;

		switch (value) {
			case "fullcombo":
				return score.isFullCombo === 1;
			case "alljustice":
				return score.isAllJustice === 1;
			case "fullchain":
				return score.fullChainKind === 1;
			default:
				return true;
		}
	},
};

// ============================================================================
// VERSION FILTER
// ============================================================================

/**
 * Filter scores by version (Current version only or All versions)
 */
export const scoreVersionFilter: ScoreFilter = {
	identifier: "version",
	label: "Version",
	options: [
		{ label: "Current", value: "current" },
		{ label: "All", value: "all" },
	],
	predicate: (_score, _value) => {
		// This will be handled in the hook with access to user's current version
		return true;
	},
};

// ============================================================================
// EXPORT ALL FILTERS
// ============================================================================

/**
 * Array of all available score filters
 */
export const scoreFilters: ScoreFilter[] = [scoreLevelFilter, scoreAchievementFilter, scoreVersionFilter];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get default filter values for scores
 */
export const getDefaultScoreFilterValues = (): FilterValues => {
	const defaultValues: FilterValues = {};
	scoreFilters.forEach((filter) => {
		if (filter.identifier === "version") {
			defaultValues[filter.identifier] = "current";
		} else {
			defaultValues[filter.identifier] = "all";
		}
	});
	return defaultValues;
};

/**
 * Hook to get score filters
 */
export const useScoreFilters = () => {
	return scoreFilters;
};
