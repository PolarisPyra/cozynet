import { type SetStateAction, useCallback, useEffect, useMemo, useState } from "react"

import { STANDARD_PAGE_SIZE } from "@/app/shared/constants/pagination"

const clampPage = (page: number, totalPages: number) => Math.min(Math.max(page, 1), totalPages)

const resetDependencyKey = (deps: unknown[]) =>
	deps
		.map(dep => {
			if (dep == null) return String(dep)
			if (typeof dep === "object") {
				try {
					return JSON.stringify(dep)
				} catch {
					return String(dep)
				}
			}
			return String(dep)
		})
		.join("\u001f")

export function usePagination<T>(items: T[], itemsPerPage = STANDARD_PAGE_SIZE, resetDeps: unknown[] = []) {
	const [page, setPage] = useState(1)
	const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage))
	const safePage = clampPage(page, totalPages)
	const resetKey = resetDependencyKey(resetDeps)

	const paged = useMemo(() => {
		const start = (safePage - 1) * itemsPerPage
		return items.slice(start, start + itemsPerPage)
	}, [items, safePage, itemsPerPage])

	const setSafePage = useCallback(
		(nextPage: SetStateAction<number>) => {
			setPage(previous => {
				const resolved = typeof nextPage === "function" ? nextPage(previous) : nextPage
				return clampPage(resolved, totalPages)
			})
		},
		[totalPages]
	)

	useEffect(() => {
		setPage(1)
	}, [resetKey])

	useEffect(() => {
		if (page !== safePage) setPage(safePage)
	}, [page, safePage])

	return {
		page: safePage,
		setPage: setSafePage,
		totalPages,
		paged,
		total: items.length,
		hasMore: totalPages > 1
	}
}
