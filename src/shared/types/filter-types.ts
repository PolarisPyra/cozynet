// ============================================================================
// SHARED FILTER SYSTEM TYPES
// ============================================================================

/**
 * Represents a single filter option with label and value
 */
export interface FilterOption<T = string> {
	label: string
	value: T
}

/**
 * Base filter interface that all specific filters extend
 */
export interface BaseFilter<T = string> {
	identifier: string
	label: string
	options: FilterOption<T>[]
	isRequired?: boolean
}

/**
 * Generic filter values interface
 */
export interface FilterValues {
	[identifier: string]: string | undefined
}

/**
 * Generic filtering parameters interface
 */
export interface UseFilteringParams {
	searchQuery: string
	filterValues: FilterValues
}
