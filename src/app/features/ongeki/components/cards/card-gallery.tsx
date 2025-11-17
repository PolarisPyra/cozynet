import { useEffect, useMemo, useState } from "react"

import { Pagination } from "@/app/shared/components/common/pagination"
import { CardItem } from "@/app/features/ongeki/components/cards/card-item"
import { Skeleton } from "@/app/shared/components/ui/skeleton"
import type { DB } from "@/app/shared/types"

interface CardGalleryProps {
	cards: (DB.OngekiUserCard & DB.OngekiStaticCards)[]
	loading?: boolean
	itemsPerPage?: number
}

export function CardGallery({ cards, loading = false, itemsPerPage = 48 }: CardGalleryProps) {
	const [page, setPage] = useState(1)

	const safeItemsPerPage = Math.max(1, Math.floor(itemsPerPage || 70))
	const totalPages = Math.max(1, Math.ceil((cards?.length || 0) / safeItemsPerPage))

	useEffect(() => {
		setPage(1)
	}, [cards.length])

	const pagedCards = useMemo(() => {
		const start = (page - 1) * safeItemsPerPage
		return (cards || []).slice(start, start + safeItemsPerPage)
	}, [cards, page, safeItemsPerPage])

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
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
			<div className="">
				<div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
					{Array.from({ length: safeItemsPerPage }).map((_, idx) => (
						<div key={idx} className="aspect-[3/4]">
							<Skeleton className="h-full w-full rounded-sm" />
						</div>
					))}
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
				{pagedCards.map(card => (
					<CardItem key={card.id} item={card} />
				))}
			</div>

			{cards && cards.length > safeItemsPerPage && (
				<Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} showKeyboardHints={true} />
			)}
		</div>
	)
}
