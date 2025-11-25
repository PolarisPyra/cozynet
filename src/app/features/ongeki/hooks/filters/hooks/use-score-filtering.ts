import { useMemo } from "react"

import { useOngekiScores, useOngekiVersion } from "@/app/features/ongeki/hooks"

import { scoreFilters } from "../definitions/score-filters"
import type { UseMusicFilteringParams } from "../types/music-types"

export const useOngekiScoreFiltering = ({ searchQuery, filterValues }: UseMusicFilteringParams) => {
	const { data: scores = [], isLoading } = useOngekiScores()
	const version = useOngekiVersion()

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

export const getDefaultScoreFilterValues = () => {
	const defaultValues: Record<string, string> = {}

	scoreFilters.forEach(filter => {
		if (filter.isRequired && filter.options.length > 0) {
			defaultValues[filter.identifier] = filter.options[0].value
		}
	})

	return defaultValues
}
