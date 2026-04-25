export interface SearchResponse<T> {
	items: T[]
	total: number
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null

export const isSearchResponse = <T>(value: unknown): value is SearchResponse<T> =>
	isRecord(value) && Array.isArray(value.items) && typeof value.total === "number"

export const findCachedSearchItem = <T>(
	searchQueries: Array<readonly [unknown, unknown]>,
	predicate: (item: T) => boolean
): T | undefined => {
	for (const [, searchData] of searchQueries) {
		if (!isSearchResponse<T>(searchData)) continue

		const item = searchData.items.find(predicate)
		if (item) return item
	}

	return undefined
}

export const updateCachedSearchResponse = <T>(old: unknown, updater: (items: T[]) => T[]): SearchResponse<T> | unknown => {
	if (!isSearchResponse<T>(old)) return old

	return {
		...old,
		items: updater(old.items)
	}
}
