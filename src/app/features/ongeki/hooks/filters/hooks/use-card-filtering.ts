import { useMemo } from "react"

import { useOngekiCards } from "@/app/features/ongeki/hooks"

import { cardFilters } from "../definitions/card-filters"
import type { UseCardFilteringParams } from "../types/card-types"

export const useOngekiCardFiltering = ({ searchQuery, filterValues }: UseCardFilteringParams) => {
	const { data, isLoading, error } = useOngekiCards()

	const filteredCards = useMemo(() => {
		if (!data?.cards) return []

		const normalizedQuery = searchQuery.trim().toLowerCase()

		return data.cards.filter(card => {
			// Apply search query filter
			if (normalizedQuery && card.name && !card.name.toLowerCase().includes(normalizedQuery)) {
				return false
			}

			// Apply all active filters
			return cardFilters.every(filter => {
				const value = filterValues?.[filter.identifier]

				// Handle required filters with default values
				if (filter.isRequired && value === undefined) {
					const firstOptionValue = filter.options?.[0]?.value
					return filter.predicate(card, firstOptionValue)
				}

				// Skip filters that are not set (undefined values)
				if (value === undefined) {
					return true
				}

				return filter.predicate(card, value)
			})
		})
	}, [data?.cards, searchQuery, filterValues])

	return {
		filteredCards,
		isLoading,
		error
	}
}

export const useCardFilters = () => {
	return cardFilters
}

export const getDefaultFilterValues = () => {
	const defaultValues: Record<string, string> = {}

	cardFilters.forEach(filter => {
		if (filter.isRequired && filter.options.length > 0) {
			defaultValues[filter.identifier] = filter.options[0].value
		}
	})

	return defaultValues
}
