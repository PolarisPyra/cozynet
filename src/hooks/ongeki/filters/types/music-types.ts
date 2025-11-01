import type {
	BaseFilter,
	FilterValues,
	OngekiPlaylog,
	OngekiRating,
	OngekiStaticMusic,
	UseFilteringParams
} from "@/shared/types"

// ============================================================================
// DATA TYPES (using shared types)
// ============================================================================

/**
 * Alias for OngekiSong using shared type
 */
export type OngekiSong = OngekiStaticMusic

/**
 * Alias for OngekiScore using shared type
 */
export type OngekiScore = OngekiPlaylog

/**
 * Union type for all Ongeki music-related data
 */
export type OngekiMusicData = OngekiSong | OngekiRating | OngekiScore

// ============================================================================
// FILTER SYSTEM TYPES (using shared types)
// ============================================================================

/**
 * Specific filter type for songs
 */
export interface SongFilter<T = string> extends BaseFilter<T> {
	predicate: (item: OngekiSong, value: T) => boolean
}

/**
 * Specific filter type for ratings
 */
export interface RatingFilter<T = string> extends BaseFilter<T> {
	predicate: (item: OngekiRating, value: T) => boolean
}

/**
 * Specific filter type for scores
 */
export interface ScoreFilter<T = string> extends BaseFilter<T> {
	predicate: (item: OngekiScore, value: T) => boolean
}

/**
 * Generic music filter type
 */
export interface MusicFilter<T = string> extends BaseFilter<T> {
	predicate: (item: OngekiMusicData, value: T) => boolean
}

/**
 * Alias for Ongeki filter values using shared type
 */
export type MusicFilterValues = FilterValues

/**
 * Alias for Ongeki filtering parameters using shared type
 */
export type UseMusicFilteringParams = UseFilteringParams

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type guard to check if data is OngekiSong
 */
export const isOngekiSong = (data: OngekiMusicData): data is OngekiSong => {
	return "songId" in data && "chartId" in data
}

/**
 * Type guard to check if data is OngekiRating
 */
export const isOngekiRating = (data: OngekiMusicData): data is OngekiRating => {
	return "score" in data && "rating" in data
}

/**
 * Type guard to check if data is OngekiScore
 */
export const isOngekiScore = (data: OngekiMusicData): data is OngekiScore => {
	return "playlogId" in data && "score" in data
}
