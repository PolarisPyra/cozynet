import { LEVEL_CONFIGS } from "@/app/shared/utils/level-filter"

import type { SongFilter } from "../types/music-types"

// ============================================================================
// LEVEL FILTER
// ============================================================================

/**
 * Filter songs by difficulty level ranges
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
		{ label: "5+", value: "5+" },
		{ label: "6", value: "6" },
		{ label: "6+", value: "6+" },
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
		if (!song.level) return false
		return LEVEL_CONFIGS.ONGEKI(song.level, value)
	}
}
// ============================================================================
// GENRE FILTER
// ============================================================================

/**
 * Filter songs by music genre
 */
export const songGenreFilter: SongFilter = {
	identifier: "genre",
	label: "Genre",
	options: [
		{ label: "All", value: "all" },
		{ label: "オンゲキ", value: "オンゲキ" },
		{ label: "東方Project", value: "東方Project" },
		{ label: "POPS＆ANIME", value: "POPS＆ANIME" },
		{ label: "チュウマイ", value: "チュウマイ" },
		{ label: "niconico", value: "niconico" },
		{ label: "VARIETY", value: "VARIETY" }
	],
	predicate: (song, value) => {
		if (value === "all") return true
		return song.genre === value
	}
}

// ============================================================================
// CHART TYPE FILTER
// ============================================================================

/**
 * Filter songs by chart type (Normal vs Lunatic)
 */
export const songChartTypeFilter: SongFilter = {
	identifier: "chartType",
	label: "Chart Type",
	options: [
		{ label: "All", value: "all" },
		{ label: "Normal", value: "normal" },
		{ label: "Lunatic", value: "lunatic" }
	],
	predicate: (song, value) => {
		if (value === "all") return true
		if (value === "normal") return song.chartId !== 10
		if (value === "lunatic") return song.chartId === 10
		return true
	}
}

// ============================================================================
// EXPORT ALL FILTERS
// ============================================================================

/**
 * Array of all available song filters
 */
export const songFilters: SongFilter[] = [songLevelFilter, songGenreFilter, songChartTypeFilter]
