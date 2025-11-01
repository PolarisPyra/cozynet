import React, { useMemo, useState } from "react"

import Spinner from "@/components/common/spinner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ResponsiveGridProps<T> = {
	items: T[]
	loading?: boolean
	levelColorBadge?: (chartId?: number | undefined) => string
	itemsPerPage?: number
	className?: string
	mobileColumns?: number
	tabletColumns?: number
	desktopColumns?: number
	largeDesktopColumns?: number
	gap?: number
	jacketArt?: string
	isVerseOrAbove?: boolean
	isRefreshOrAbove?: boolean
	isPotential?: boolean
	isRecommend?: boolean
	CardComponent: React.FC<{
		score: T
		imageBasePath?: string
		levelColorBadge?: (chartId?: number | undefined) => string
		jacketArt?: string
		isVerseOrAbove?: boolean
		isRefreshOrAbove?: boolean
		isPotential?: boolean
		isRecommend?: boolean
	}>
}

function ResponsiveGrid<T>({
	CardComponent,
	items,
	loading = false,
	levelColorBadge,
	itemsPerPage = 20,
	className,
	gap = 16,
	jacketArt,
	isVerseOrAbove,
	isRefreshOrAbove,
	isPotential,
	isRecommend
}: ResponsiveGridProps<T>) {
	const [page, setPage] = useState(1)

	const safeItemsPerPage = Math.max(1, Math.floor(itemsPerPage || 20))
	const totalPages = Math.max(1, Math.ceil((items?.length || 0) / safeItemsPerPage))

	// Reset to page 1 when items array changes substantially (like filtering)
	React.useEffect(() => {
		setPage(1)
	}, [items.length])

	const paged = useMemo(() => {
		const start = (page - 1) * safeItemsPerPage
		return (items || []).slice(start, start + safeItemsPerPage)
	}, [items, page, safeItemsPerPage])

	React.useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			// Only handle arrow keys when not in an input/textarea/select
			if (
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement ||
				event.target instanceof HTMLSelectElement ||
				(event.target as HTMLElement).isContentEditable
			) {
				return
			}

			if (event.key === "ArrowLeft") {
				event.preventDefault()
				setPage(p => Math.max(1, p - 1))
			} else if (event.key === "ArrowRight") {
				event.preventDefault()
				setPage(p => Math.min(totalPages, p + 1))
			}
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [totalPages])

	if (loading) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<Spinner />
			</div>
		)
	}

	const gridColsClass = `grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4`

	// Generate responsive gap classes
	const gapClass = `gap-${Math.max(2, gap / 4)} sm:gap-${Math.max(3, gap / 4)} md:gap-${Math.max(4, gap / 4)}`

	return (
		<div className={className}>
			<div className={cn("grid", gridColsClass, gapClass)}>
				{paged.map((s, idx) => (
					<div key={idx}>
						<CardComponent
							score={s}
							levelColorBadge={levelColorBadge}
							jacketArt={jacketArt}
							isVerseOrAbove={isVerseOrAbove}
							isRefreshOrAbove={isRefreshOrAbove}
							isPotential={isPotential}
							isRecommend={isRecommend}
						/>
					</div>
				))}
			</div>

			{items && items.length > safeItemsPerPage && (
				<div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
					<div className="text-muted-foreground flex flex-col items-center space-y-1 text-sm sm:items-start">
						<div className="text-center sm:text-left">
							Page {page} of {totalPages}
						</div>
					</div>
					<div className="flex flex-col items-center space-y-3">
						<div className="flex items-center space-x-2">
							<Button
								variant="secondary"
								size="sm"
								className="bg-card border-border hover:bg-muted min-w-[80px] cursor-pointer border transition-none"
								onClick={() => setPage(p => Math.max(1, p - 1))}
								disabled={page === 1}
							>
								Previous
							</Button>
							<Button
								variant="secondary"
								size="sm"
								className="bg-card border-border hover:bg-muted min-w-[80px] cursor-pointer border transition-none"
								onClick={() => setPage(p => Math.min(totalPages, p + 1))}
								disabled={page === totalPages}
							>
								Next
							</Button>
						</div>
						<div className="text-muted-foreground flex items-center gap-3 text-xs">
							<div className="flex items-center gap-1">
								<CommandMenuKbd>←</CommandMenuKbd>
								<span className="hidden sm:inline">Previous</span>
							</div>
							<div className="flex items-center gap-1">
								<CommandMenuKbd>→</CommandMenuKbd>
								<span className="hidden sm:inline">Next</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default ResponsiveGrid

function CommandMenuKbd({ className, ...props }: React.ComponentProps<"kbd">) {
	return (
		<kbd
			className={cn(
				"bg-background text-muted-foreground pointer-events-none flex h-5 items-center justify-center gap-1 rounded border px-1 font-sans text-[0.7rem] font-medium select-none [&_svg:not([class*='size-'])]:size-3",
				className
			)}
			{...props}
		/>
	)
}
