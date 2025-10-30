import type { BaseFilter, ChunithmPlaylog, ChunithmRating, FilterValues, UseFilteringParams } from "@/shared/types";
import { DB } from "@/shared/types";

// ============================================================================
// FILTER SYSTEM TYPES (using shared types)
// ============================================================================

/**
 * Specific filter type for ratings
 */
export interface RatingFilter<T = string> extends BaseFilter<T> {
	predicate: (item: ChunithmRating, value: T) => boolean;
}

/**
 * Specific filter type for scores
 */
export interface ScoreFilter<T = string> extends BaseFilter<T> {
	predicate: (item: ChunithmPlaylog, value: T) => boolean;
}

/**
 * Specific filter type for songs
 */
export interface SongFilter<T = string> extends BaseFilter<T> {
	predicate: (item: DB.ChuniStaticMusic, value: T) => boolean;
}

/**
 * Alias for Chunithm filter values using shared type
 */
export type ChunithmFilterValues = FilterValues;

/**
 * Alias for Chunithm filtering parameters using shared type
 */
export type UseChunithmFilteringParams = UseFilteringParams;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Utility type guard to check if data is ChunithmRating
 */
export const isChunithmRating = (
	data: ChunithmRating | DB.ChuniStaticMusic | ChunithmPlaylog
): data is ChunithmRating => {
	return "score" in data && "rating" in data;
};
