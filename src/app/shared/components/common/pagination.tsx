import { Button } from "@/app/shared/components/ui/button"

interface PaginationProps {
	page: number
	totalPages: number
	total: number
	onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
	if (totalPages <= 1) return null

	return (
		<div className="flex items-center justify-between pt-4">
			<span className="text-muted-foreground text-sm">
				Page {page} of {totalPages} ({total} total)
			</span>
			<div className="flex gap-2">
				<Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
					Previous
				</Button>
				<Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>
					Next
				</Button>
			</div>
		</div>
	)
}
