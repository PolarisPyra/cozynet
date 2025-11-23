// Import filter system
import {
	getDefaultScoreFilterValues,
	getDefaultSongFilterValues,
	useMaimaiDxScoreFiltering,
	useMaimaiDxSongFiltering,
	useScoreFilters,
	useSongFilters
} from "./filters"
import {
	getDefaultRatingFilterValues,
	useMaimaiDxRatingFiltering,
	useRatingFilters
} from "./filters/hooks/use-rating-filtering"
import { useMaimaiDxChartFilters } from "./use-filters"
import { useMaimaiDxScores } from "./use-scores"
import { useMaimaiDxSongs } from "./use-songs"
import { useMaimaiDxVersion, useMaimaiDxVersions, useUpdateMaimaiDxVersion } from "./use-version"

// Export new filter system
export {
	getDefaultScoreFilterValues,
	getDefaultSongFilterValues,
	getDefaultRatingFilterValues,
	useMaimaiDxScoreFiltering,
	useMaimaiDxSongFiltering,
	useMaimaiDxRatingFiltering,
	useScoreFilters,
	useSongFilters,
	useRatingFilters
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
