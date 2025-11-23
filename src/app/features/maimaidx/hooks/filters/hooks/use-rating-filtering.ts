import { useMemo } from "react"

import { useMaimaiDxVersion } from "@/app/features/maimaidx/hooks"
import useMaimaiDxRatingData from "@/app/features/maimaidx/hooks/use-rating-data"
import type { MaimaiRating } from "@/app/shared/types"

import { getDefaultRatingFilterValues, getRatingFilters } from "../definitions/rating-filters"
import type { UseMaimaiDxRatingFilteringParams } from "../types/music-types"

export const useMaimaiDxRatingFiltering = ({ searchQuery, filterValues }: UseMaimaiDxRatingFilteringParams) => {
	const version = useMaimaiDxVersion()

	// Get active tab from filter values
	const activeTab = filterValues.tab || "base"

	// Pass activeTab to hook so it only fetches data for the active tab
	const { activeData, isLoading, playerRatingValue, highestRatingValue } = useMaimaiDxRatingData(activeTab)

	const filteredRatings = useMemo(() => {
		if (!activeData) return []

		const normalizedQuery = searchQuery.trim().toLowerCase()
		const ratingFilters = getRatingFilters()

		return activeData.filter((rating: MaimaiRating) => {
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
	}, [activeData, searchQuery, filterValues])

	return {
		filteredRatings,
		isLoading,
		version,
		playerRatingValue,
		highestRatingValue
	}
}

export const useRatingFilters = () => {
	return getRatingFilters()
}

export { getDefaultRatingFilterValues }
