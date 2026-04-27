import { memo, useMemo, useRef } from "react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/shared/components/ui/tooltip"
import { Skeleton } from "@/app/shared/components/ui/skeleton"
import { useIsMobile } from "@/app/shared/hooks/use-mobile"
import { CDN } from "@/app/shared/utils/constants"
import type { DB } from "@/app/shared/types"
import { cn } from "@/app/shared/utils"

import { getCanvasStyles, getCardStyles, useCardEffects } from "./card-effects"
import { getSkillInfo } from "../../utils/skill-utils"

const SSR_RARITY = 3

export interface CardItemProps {
	item: DB.OngekiUserCard & DB.OngekiStaticCards
	onClick?: (item: DB.OngekiUserCard & DB.OngekiStaticCards) => void
}

interface CardImageProps {
	imageUrl: string | null
	alt: string
}

const CardImage = ({ imageUrl, alt }: CardImageProps) => {
	const imageStyles = useMemo(
		() => ({
			imageRendering: "auto" as const,
			WebkitBackfaceVisibility: "hidden" as const,
			backfaceVisibility: "hidden" as const,
			transform: "translateZ(0)",
			willChange: "transform" as const
		}),
		[]
	)

	if (!imageUrl) {
		return <Skeleton className="h-full w-full" />
	}

	return (
		<img
			src={imageUrl}
			alt={alt}
			loading="lazy"
			decoding="async"
			className="h-full w-full object-cover"
			style={imageStyles}
		/>
	)
}

interface CardOverlayProps {
	name: string | null
	level: number | null
	skillId: number | null
}

const CardOverlay = ({ name, level, skillId }: CardOverlayProps) => {
	const skill = getSkillInfo(skillId)

	return (
		<>
			{level && (
				<div className="absolute top-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
					Lv. {level}
				</div>
			)}
			{skill && (
				<div className="absolute top-2 left-2">
					<Tooltip>
						<TooltipTrigger asChild>
							<div className={cn(
								"rounded px-1.5 py-0.5 text-[8px] font-bold text-white uppercase shadow-sm",
								skill.category === "Attack" ? "bg-red-500" :
								skill.category === "Boost" ? "bg-blue-500" :
								skill.category === "Guard" ? "bg-green-500" :
								skill.category === "Support" ? "bg-purple-500" : "bg-slate-500"
							)}>
								{skill.category}
							</div>
						</TooltipTrigger>
						<TooltipContent side="right" className="max-w-[200px] p-2">
							<div className="font-bold">{skill.name}</div>
							<div className="mt-1 text-[10px] opacity-90 whitespace-pre-wrap">{skill.info}</div>
						</TooltipContent>
					</Tooltip>
				</div>
			)}
			<div className="absolute right-0 bottom-0 left-0 bg-black/80 px-2 py-1">
				<div className="text-center text-xs text-white">
					<div className="truncate leading-tight font-semibold">{name || "Unknown"}</div>
				</div>
			</div>
		</>
	)
}

interface HolographicCanvasProps {
	enabled: boolean
	canvasRef: React.RefObject<HTMLCanvasElement | null>
}

const HolographicCanvas = ({ enabled, canvasRef }: HolographicCanvasProps) => {
	const canvasStyles = useMemo(() => getCanvasStyles(), [])

	if (!enabled) return null

	return (
		<canvas
			ref={canvasRef}
			className="pointer-events-none absolute inset-0 h-full w-full rounded-md transition-opacity duration-300"
			style={canvasStyles}
		/>
	)
}

const CardItemBase = ({ item, onClick }: CardItemProps) => {
	const cardRef = useRef<HTMLDivElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const isMobile = useIsMobile()

	const isSSR = item.rarity === SSR_RARITY

	const imageUrl = useMemo(() => (item.imagePath ? `${CDN}/ongeki/card/${item.imagePath}` : null), [item.imagePath])

	const { handleMouseEnter, handleMouseMove, handleMouseLeave } = useCardEffects({
		enabled: isSSR,
		cardRef,
		canvasRef
	})

	const cardStyles = useMemo(() => getCardStyles(), [])

	return (
		<div className="w-full">
			<div
				ref={cardRef}
				onMouseEnter={isMobile ? undefined : handleMouseEnter}
				onMouseMove={isMobile ? undefined : handleMouseMove}
				onMouseLeave={isMobile ? undefined : handleMouseLeave}
				onClick={() => onClick?.(item)}
				draggable
				onDragStart={e => {
					e.dataTransfer.setData("application/json", JSON.stringify(item))
					e.dataTransfer.effectAllowed = "move"

					// Create a smaller drag ghost image
					if (imageUrl) {
						const ghost = document.createElement("img")
						ghost.src = imageUrl
						ghost.style.width = "64px"
						ghost.style.height = "auto"
						// We need to briefly add it to the DOM for it to be used
						ghost.style.position = "absolute"
						ghost.style.top = "-1000px"
						document.body.appendChild(ghost)
						e.dataTransfer.setDragImage(ghost, 32, 42)
						// Clean up after the drag starts
						setTimeout(() => document.body.removeChild(ghost), 0)
					}
				}}
				className={cn(
					"bg-background/30 relative aspect-[3/4] origin-center overflow-hidden rounded-md transition-all duration-150 ease-out will-change-transform",
					onClick && "cursor-pointer hover:ring-2 hover:ring-primary/50"
				)}
				style={cardStyles}
			>
				<CardImage imageUrl={imageUrl} alt={item.name || "Card"} />
				<HolographicCanvas enabled={isSSR && !isMobile} canvasRef={canvasRef} />
				<CardOverlay name={item.name} level={item.level} skillId={item.skillId} />
			</div>
		</div>
	)
}

const areItemsEqual = (prev: CardItemProps, next: CardItemProps) => {
	const prevItem = prev.item
	const nextItem = next.item

	return (
		prev.onClick === next.onClick &&
		prevItem.id === nextItem.id &&
		prevItem.imagePath === nextItem.imagePath &&
		prevItem.name === nextItem.name &&
		prevItem.level === nextItem.level &&
		prevItem.rarity === nextItem.rarity
	)
}

export const CardItem = memo(CardItemBase, areItemsEqual)
CardItem.displayName = "CardItem"
