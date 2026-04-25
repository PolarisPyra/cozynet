import { memo } from "react"

import { Button } from "@/app/shared/components/ui/button"

interface PaginationProps {
	page: number
	totalPages: number
	onPageChange: (page: number) => void
}

export const Pagination = memo(function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
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