import type { BaseFilter, FilterValues, Mai2Playlog, Mai2StaticMusic, UseFilteringParams } from "@/app/shared/types"

// ============================================================================
// DATA TYPE PREDICATES
// ============================================================================

export const isMaimaiDxSong = (item: Mai2StaticMusic | Mai2Playlog): item is Mai2StaticMusic => {
	return "songId" in item && "charts" in item
}

export const isMaimaiDxScore = (item: Mai2StaticMusic | Mai2Playlog): item is Mai2Playlog => {
	return "musicId" in item && "achievement" in item
}

// ============================================================================
// SPECIFIC FILTER TYPES (using shared types)
// ============================================================================

export interface SongFilter extends BaseFilter {
	predicate: (song: Mai2StaticMusic, value: string) => boolean
}

export interface ScoreFilter extends BaseFilter {
	predicate: (score: Mai2Playlog, value: string) => boolean
}

// Generic filter type that can be used in components
export type AnyFilter = SongFilter | ScoreFilter

// ============================================================================
// HOOK PARAMETER TYPES (using shared types)
// ============================================================================

export interface UseSongFilteringParams extends UseFilteringParams {}

export interface UseScoreFilteringParams extends UseFilteringParams {
	versionNum?: number | null
	showAllScores?: boolean
}
