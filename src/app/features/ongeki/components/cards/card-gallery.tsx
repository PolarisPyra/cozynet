import { useMemo } from "react"

import { CardItem } from "@/app/features/ongeki/components/cards/card-item"
import { Pagination } from "@/app/shared/components/common/pagination"
import { Skeleton } from "@/app/shared/components/ui/skeleton"
import { STANDARD_PAGE_SIZE } from "@/app/shared/constants/pagination"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import type { DB } from "@/app/shared/types"

interface CardGalleryProps {
	cards: (DB.OngekiUserCard & DB.OngekiStaticCards)[]
	loading?: boolean
	itemsPerPage?: number
	onCardClick?: (item: DB.OngekiUserCard & DB.OngekiStaticCards) => void
}

export function CardGallery({
	cards,
	loading = false,
	itemsPerPage = STANDARD_PAGE_SIZE,
	onCardClick
}: CardGalleryProps) {
	const safeItemsPerPage = Math.max(1, Math.floor(itemsPerPage || STANDARD_PAGE_SIZE))

	const list = useMemo(() => cards || [], [cards])
	const { page, setPage, totalPages, paged: pagedCards, hasMore } = usePagination(list, safeItemsPerPage, [list.length])

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
					<CardItem key={card.id} item={card} onClick={onCardClick} />
				))}
			</div>
			{hasMore && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
		</div>
	)
}
