import React, { memo, useRef } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { CDN } from "@/lib/constants"
import type { DB } from "@/shared/types"

export interface CardItemProps {
	item: DB.OngekiUserCard & DB.OngekiStaticCards
}

const CardItemBase = ({ item }: CardItemProps) => {
	const imageUrl = item.imagePath ? `${CDN}/ongeki/card/${item.imagePath}` : null
	const cardRef = useRef<HTMLDivElement>(null)
	const boundsRef = useRef<DOMRect | null>(null)
	const rafIdRef = useRef<number | null>(null)

	const handleMouseEnter = () => {
		const el = cardRef.current
		if (!el) return
		boundsRef.current = el.getBoundingClientRect()
	}

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const el = cardRef.current
		if (!el) return
		if (rafIdRef.current !== null) return
		rafIdRef.current = window.requestAnimationFrame(() => {
			rafIdRef.current = null
			const rect = boundsRef.current ?? el.getBoundingClientRect()
			boundsRef.current = rect
			const x = e.clientX - rect.left
			const y = e.clientY - rect.top
			const cx = rect.width / 2
			const cy = rect.height / 2
			const rotateX = ((cy - y) / cy) * 18
			const rotateY = ((x - cx) / cx) * 18
			el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
		})
	}

	const handleMouseLeave = () => {
		const el = cardRef.current
		if (!el) return
		if (rafIdRef.current !== null) {
			cancelAnimationFrame(rafIdRef.current)
			rafIdRef.current = null
		}
		el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)"
		boundsRef.current = null
	}

	return (
		<div className="w-full">
			<div
				ref={cardRef}
				onMouseEnter={handleMouseEnter}
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
				className="relative aspect-[3/4] origin-center overflow-hidden rounded-md bg-black shadow-md transition-transform duration-150 ease-out will-change-transform [perspective:1200px] [transform-style:preserve-3d] hover:shadow-xl"
			>
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={item.name || "Card"}
						loading="lazy"
						decoding="async"
						className="h-full w-full object-cover"
					/>
				) : (
					<Skeleton className="h-full w-full" />
				)}

				<div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-2">
					<div className="text-center text-xs text-white">
						<div className="truncate leading-tight font-semibold">{item.name || "Unknown"}</div>
						{item.level && <div className="mt-0.5 text-[10px] text-white/80">Lv. {item.level}</div>}
					</div>
				</div>
			</div>
		</div>
	)
}

const areItemsEqual = (prev: CardItemProps, next: CardItemProps) => {
	const a = prev.item
	const b = next.item
	return a.id === b.id && a.imagePath === b.imagePath && a.name === b.name && a.level === b.level
}

export const CardItem = memo(CardItemBase, areItemsEqual)
CardItem.displayName = "CardItem"
