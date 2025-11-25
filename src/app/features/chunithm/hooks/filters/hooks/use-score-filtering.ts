import { useMemo } from "react"

import { useChunithmScores, useChunithmVersion } from "@/app/features/chunithm/hooks"

import { scoreFilters } from "../definitions/score-filters"
import type { UseChunithmFilteringParams } from "../types/music-types"

export const useChunithmScoreFiltering = ({ searchQuery, filterValues }: UseChunithmFilteringParams) => {
	const { data: scores = [], isLoading } = useChunithmScores()
	const version = useChunithmVersion()

	const filteredScores = useMemo(() => {
		if (!scores) return []

		const normalizedQuery = searchQuery.trim().toLowerCase()

		return scores.filter(score => {
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

export const useScoreFilters = () => {
	return scoreFilters
}
