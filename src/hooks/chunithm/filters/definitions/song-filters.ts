import { LEVEL_CONFIGS } from "@/utils/level-filter";

import type { SongFilter } from "../types/music-types";

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
	predicate: (song, value) => {
		if (!song.level || song.chartId === 5) return false;
		return LEVEL_CONFIGS.CHUNITHM(song.level, value);
	},
};
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
		{ label: "ORIGINAL", value: "ORIGINAL" },
		{ label: "東方Project", value: "東方Project" },
		{ label: "POPS & ANIME", value: "POPS & ANIME" },
		{ label: "ゲキマイ", value: "ゲキマイ" },
		{ label: "イロドリミドリ", value: "イロドリミドリ" },
		{ label: "niconico", value: "niconico" },
		{ label: "VARIETY", value: "VARIETY" },
	],
	predicate: (song, value) => {
		if (value === "all") return true;
		return song.genre === value;
	},
};
// ============================================================================
// CHART TYPE FILTER
// ============================================================================

/**
 * Filter songs by chart type (BASIC, ADVANCED, EXPERT, MASTER, ULTIMA)
 */
export const songChartTypeFilter: SongFilter = {
	identifier: "chartType",
	label: "Chart Type",
	options: [
		{ label: "All", value: "all" },
		{ label: "BASIC", value: "0" },
		{ label: "ADVANCED", value: "1" },
		{ label: "EXPERT", value: "2" },
		{ label: "MASTER", value: "3" },
		{ label: "ULTIMA", value: "4" },
		{ label: "WORLDS END", value: "5" },
	],
	predicate: (song, value) => {
		if (value === "all") return true;
		return song.chartId === parseInt(value);
	},
};

// ============================================================================
// EXPORT ALL FILTERS
// ============================================================================

/**
 * Array of all available song filters
 */
export const songFilters: SongFilter[] = [songLevelFilter, songGenreFilter, songChartTypeFilter];
