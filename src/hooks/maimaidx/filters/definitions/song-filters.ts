import type { FilterValues } from "@/shared/types"
import { LEVEL_CONFIGS } from "@/utils/level-filter"

import type { SongFilter } from "../types/music-types"

// ============================================================================
// LEVEL FILTER
// ============================================================================

/**
 * Filter songs by difficulty level
 */
export const songLevelFilter: SongFilter = {
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
	predicate: (song, value) => {
		if (!song.difficulty) return false
		return LEVEL_CONFIGS.MAIMAI(song.difficulty, value)
	}
}

// ============================================================================
// EXPORT ALL FILTERS
// ============================================================================

/**
 * Array of all available song filters
 */
export const songFilters: SongFilter[] = [songLevelFilter]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get default filter values for songs
 */
export const getDefaultSongFilterValues = (): FilterValues => {
	const defaultValues: FilterValues = {}
	songFilters.forEach(filter => {
		defaultValues[filter.identifier] = "all"
	})
	return defaultValues
}

/**
 * Hook to get song filters
 */
export const useSongFilters = () => songFilters
