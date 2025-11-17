// Import filter system
import {
	getDefaultScoreFilterValues,
	getDefaultSongFilterValues,
	useMaimaiDxScoreFiltering,
	useMaimaiDxSongFiltering,
	useScoreFilters,
	useSongFilters
} from "./filters"
import { useMaimaiDxChartFilters } from "./use-filters"
import { useMaimaiDxScores } from "./use-scores"
import { useMaimaiDxSongs } from "./use-songs"
import { useMaimaiDxVersion, useMaimaiDxVersions, useUpdateMaimaiDxVersion } from "./use-version"

// Export new filter system
export {
	getDefaultScoreFilterValues,
	getDefaultSongFilterValues,
	useMaimaiDxScoreFiltering,
	useMaimaiDxSongFiltering,
	useScoreFilters,
	useSongFilters
}

// Export legacy hooks
export {
	useMaimaiDxVersion,
	useMaimaiDxVersions,
	useUpdateMaimaiDxVersion,
	useMaimaiDxScores,
	useMaimaiDxSongs,
	useMaimaiDxChartFilters
}
