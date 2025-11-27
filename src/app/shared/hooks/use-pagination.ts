import { useEffect, useMemo, useState } from "react"

export function usePagination<T>(items: T[], itemsPerPage = 20, resetDeps: unknown[] = []) {
	const [page, setPage] = useState(1)

	const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage))

	const paged = useMemo(() => {
		const start = (page - 1) * itemsPerPage
		return items.slice(start, start + itemsPerPage)
	}, [items, page, itemsPerPage])

	// Reset page when filters/search change
	useEffect(() => {
		setPage(1)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, resetDeps)

	return {
		page,
		setPage,
		totalPages,
		paged,
		total: items.length,
		hasMore: items.length > itemsPerPage
	}
}
