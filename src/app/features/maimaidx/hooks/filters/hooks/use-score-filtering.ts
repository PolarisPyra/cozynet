import { useMemo } from "react"

import { useMaimaiDxScores, useMaimaiDxVersion } from "@/app/features/maimaidx/hooks"
import type { Mai2Playlog } from "@/app/shared/types"

import { scoreFilters } from "../definitions/score-filters"
import type { UseScoreFilteringParams } from "../types/music-types"

export const useMaimaiDxScoreFiltering = ({ searchQuery, filterValues }: UseScoreFilteringParams) => {
	const { data: scores = [], isLoading } = useMaimaiDxScores()
	const version = useMaimaiDxVersion()

	const filteredScores = useMemo(() => {
		if (!scores) return []

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

		return bestScores.filter((score: Mai2Playlog) => {
			// Apply search query filter
			if (normalizedQuery && score.title && !score.title.toLowerCase().includes(normalizedQuery)) {
				return false
			}

			// Apply all active filters
			return scoreFilters.every(filter => {
				const value = filterValues?.[filter.identifier]

				// Handle required filters with default values
				if (filter.isRequired && value === undefined) {
					const firstOptionValue = filter.options?.[0]?.value
					return filter.predicate(score, firstOptionValue)
				}

				// Skip filters that are not set (undefined values)
				if (value === undefined) {
					return true
				}

				return filter.predicate(score, value)
			})
		})
	}, [scores, searchQuery, filterValues])

	return {
		filteredScores,
		isLoading,
		version
	}
}
