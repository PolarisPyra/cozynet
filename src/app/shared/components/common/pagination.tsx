import { memo, useEffect } from "react"

import { Button } from "@/app/shared/components/ui/button"

interface PaginationProps {
	page: number
	totalPages: number
	onPageChange: (page: number) => void
}

export const Pagination = memo(function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
	useEffect(() => {
		let lastTime = 0
		const throttleMs = 150

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

			if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
				const now = Date.now()
				if (now - lastTime < throttleMs) return
				lastTime = now

				if (e.key === "ArrowLeft" && page > 1) {
					onPageChange(page - 1)
				} else if (e.key === "ArrowRight" && page < totalPages) {
					onPageChange(page + 1)
				}
			}
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [page, totalPages, onPageChange])

	if (totalPages <= 1) return null

	return (
		<div className="flex min-h-8 items-center justify-between gap-3">
			<span className="text-muted-foreground shrink-0 text-sm">
				Page {page} of {totalPages}
			</span>

			<div className="flex items-center gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="h-8 transition-none"
					disabled={page === 1}
					onClick={() => onPageChange(page - 1)}
				>
					Previous
				</Button>

				<Button
					type="button"
					variant="outline"
					size="sm"
					className="h-8 transition-none"
					disabled={page === totalPages}
					onClick={() => onPageChange(page + 1)}
				>
					Next
				</Button>
			</div>
		</div>
	)
})