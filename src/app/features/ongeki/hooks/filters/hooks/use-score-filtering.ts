import { useMemo } from "react"

import { useOngekiScores, useOngekiVersion } from "@/app/features/ongeki/hooks"

import { scoreFilters } from "../definitions/score-filters"
import type { MusicFilter, OngekiScore, UseMusicFilteringParams } from "../types/music-types"

export const useOngekiScoreFiltering = ({ searchQuery, filterValues }: UseMusicFilteringParams) => {
	const { data: scores = [], isLoading } = useOngekiScores()
	const version = useOngekiVersion()
	const isRefreshOrAbove = version ? Number(version) >= 8 : false

	const filteredScores = useMemo(() => {
		if (!scores) return []

		const normalizedQuery = searchQuery.trim().toLowerCase()

		return scores.filter(score => {
			// Filter by version (Refresh and above use platinum score star)
			if (isRefreshOrAbove && score.platinumScoreStar === null) {
				return false
			}
			if (!isRefreshOrAbove && score.platinumScoreStar !== null) {
				return false
			}

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
	}, [scores, searchQuery, filterValues, isRefreshOrAbove])

	return {
		filteredScores,
		isLoading,
		isRefreshOrAbove,
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
