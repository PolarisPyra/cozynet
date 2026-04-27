import { useEffect, useState } from "react"

import { STANDARD_PAGE_SIZE } from "@/app/shared/constants/pagination"
import { getDefaults, useFiltering } from "@/app/shared/hooks/use-filtering"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import type { FilterValues } from "@/app/shared/types"

export type Density = "list" | "grid"

interface UseScorePageStateOptions<T> {
	data: T[] | undefined
	filters: any // The filter definitions
	storageKey: string
	searchKey?: string
}

/**
 * Shared hook to manage common state and logic for score pages.
 * Handles: density, search, filtering, and pagination.
 */
export function useScorePageState<T extends Record<string, unknown>>({ data, filters, storageKey }: UseScorePageStateOptions<T>) {
	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaults(filters))
	const [density, setDensity] = useState<Density>(() => {
		try {
			const saved = localStorage.getItem(storageKey)
			if (saved === "grid" || saved === "comfortable") return "grid"
			return "list"
		} catch {
			return "list"
		}
	})

	useEffect(() => {
		try {
			localStorage.setItem(storageKey, density)
		} catch {
			// Ignore storage failures
		}
	}, [density, storageKey])

	const defaults = getDefaults(filters)
	const filtered = useFiltering(data || [], filters, searchQuery, filterValues)
	const { page, setPage, totalPages, paged } = usePagination(filtered, STANDARD_PAGE_SIZE, [searchQuery, filterValues])

	const hasActiveFilters = Boolean(searchQuery) || Object.values(filterValues).some((value, index) => value !== defaults[index])
	const showEmptyState = (data || []).length > 0 && filtered.length === 0

	const resetFilters = () => {
		setFilterValues(defaults)
		setPage(1)
	}

	const handleFilterChange = (id: string, val: any) => {
		setFilterValues(prev => ({ ...prev, [id]: val }))
		setPage(1)
	}

	return {
		searchQuery,
		setSearchQuery,
		filterValues,
		setFilterValues,
		density,
		setDensity,
		page,
		setPage,
		totalPages,
		paged,
		filtered,
		defaults,
		hasActiveFilters,
		showEmptyState,
		resetFilters,
		handleFilterChange
	}
}
