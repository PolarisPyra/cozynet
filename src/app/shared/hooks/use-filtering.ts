import { useMemo } from "react"

import type { FilterValues } from "@/app/shared/types"

export interface Filter<T = unknown> {
	identifier: string
	label: string
	options: { label: string; value: string }[]
	isRequired?: boolean
	predicate: (item: T, value: string, values?: FilterValues) => boolean
}

export function useFiltering<T extends Record<string, unknown>>(
	data: T[] | undefined,
	filters: Filter<T>[],
	searchQuery: string,
	filterValues: FilterValues,
	searchField: keyof T = "title" as keyof T
): T[] {
	return useMemo(() => {
		if (!data) return []
		const q = searchQuery.trim().toLowerCase()

		return data.filter(item => {
			if (q && !String(item[searchField] ?? "").toLowerCase().includes(q)) return false
			return filters.every(f => {
				const v = filterValues?.[f.identifier]
				return v === undefined || v === "all" || f.predicate(item, v, filterValues)
			})
		})
	}, [data, filters, searchQuery, filterValues, searchField])
}

export function getDefaults<T = unknown>(filters: Filter<T>[]): FilterValues {
	const values: FilterValues = {}
	filters.forEach(f => (values[f.identifier] = f.options[0]?.value ?? "all"))
	return values
}
