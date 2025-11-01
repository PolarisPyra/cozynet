import { useMemo } from "react"

import { useMaimaiDxScores } from "@/hooks/maimaidx"
import type { Mai2Playlog } from "@/shared/types"

import { scoreFilters } from "../definitions/score-filters"
import type { UseScoreFilteringParams } from "../types/music-types"

/**
 * Hook for filtering MaimaiDX scores with search and multiple filters
 */
export const useMaimaiDxScoreFiltering = ({
	searchQuery,
	filterValues,
	versionNum,
	showAllScores = false
}: UseScoreFilteringParams) => {
	const { data: scores = [], isLoading } = useMaimaiDxScores()

	const filteredScores = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase()

		// Group scores by musicId + level and get best achievement for each
		const bestScoresMap = new Map<string, Mai2Playlog>()

		scores.forEach((score: Mai2Playlog) => {
			if (!score.musicId || !score.level) return

			const key = `${score.musicId}-${score.level}`
			const existing = bestScoresMap.get(key)

			// Use integer comparison - achievement is stored as integer (e.g., 100_5000 for 100.5000%)
			if (!existing || (score.achievement && existing.achievement && score.achievement > existing.achievement)) {
				bestScoresMap.set(key, score)
			}
		})

		const bestScores = Array.from(bestScoresMap.values())

		return bestScores
			.filter((score: Mai2Playlog) => {
				// Apply search filter
				if (normalizedQuery) {
					const matchesSearch = score.title?.toLowerCase().includes(normalizedQuery)
					if (!matchesSearch) return false
				}

				// Apply version filter
				if (versionNum && score.songVersion) {
					const versionMatch = showAllScores ? score.songVersion <= versionNum : score.songVersion === versionNum
					if (!versionMatch) return false
				}

				// Apply all active filters
				return scoreFilters.every(filter => {
					const filterValue = filterValues[filter.identifier]
					if (!filterValue || filterValue === "all") return true
					return filter.predicate(score, filterValue)
				})
			})
			.sort((a, b) => (b.songVersion || 0) - (a.songVersion || 0))
	}, [scores, searchQuery, filterValues, versionNum, showAllScores])

	return {
		filteredScores,
		isLoading
	}
}
