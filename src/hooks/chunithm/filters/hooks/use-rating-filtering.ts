import { useMemo } from "react"

import { useChunithmVersion } from "@/hooks/chunithm"
import useChunithmRatingData from "@/hooks/chunithm/use-rating-data"

import { getRatingFilters } from "../definitions/rating-filters"
import type { UseChunithmFilteringParams } from "../types/music-types"

export const useChunithmRatingFiltering = ({ searchQuery, filterValues }: UseChunithmFilteringParams) => {
	const version = useChunithmVersion()

	// Get active tab from filter values
	const activeTab = filterValues.tab || "base"

	// Pass activeTab to hook so it only fetches data for the active tab
	const { getActiveData, getActiveLoading, playerRatingValue, highestRatingValue } = useChunithmRatingData(activeTab)

	const activeData = getActiveData(activeTab)
	const isLoading = getActiveLoading(activeTab)

	const filteredRatings = useMemo(() => {
		if (!activeData) return []

		const normalizedQuery = searchQuery.trim().toLowerCase()
		const ratingFilters = getRatingFilters(version || 0)

		return activeData.filter(rating => {
			// Apply search query filter
			if (normalizedQuery && rating.title && !rating.title.toLowerCase().includes(normalizedQuery)) {
				return false
			}

			// Apply all active filters
			return ratingFilters.every(filter => {
				const value = filterValues?.[filter.identifier]

				// Handle required filters with default values
				if (filter.isRequired && value === undefined) {
					const firstOptionValue = filter.options?.[0]?.value
					return filter.predicate(rating, firstOptionValue)
				}

				// Skip filters that are not set (undefined values)
				if (value === undefined) {
					return true
				}

				return filter.predicate(rating, value)
			})
		})
	}, [activeData, searchQuery, filterValues, version])

	return {
		filteredRatings,
		isLoading,
		version,
		playerRatingValue,
		highestRatingValue
	}
}

export const useRatingFilters = (version: number) => {
	return getRatingFilters(version)
}
