import { memo, useEffect, useMemo, useState } from "react"

import { Check, Lock } from "lucide-react"

import { Pagination } from "@/components/common/pagination"
import { PreviewSlot } from "@/components/common/preview-slot"
import { Skeleton } from "@/components/ui/skeleton"
import { usePaginationKeyboard } from "@/hooks/use-pagination-keyboard"
import { CDN } from "@/lib/constants"
import { cn } from "@/lib/utils"

// Types
export interface BaseItem {
	id?: number
	avatarAccessoryId?: number
	characterId?: number
	trophyId?: number
	nameplateId?: number
	mapiconId?: number
	stageId?: number
	systemVoiceId?: number
	imagePath: string
	label: string
	locked: boolean
}

export interface GridProps<T extends BaseItem> {
	items: T[]
	equippedItemIds?: Set<number>
	selectedItemId?: number | null
	loading?: boolean
	imageBasePath: string
	onItemClick?: (item: T) => void
	onEquip?: (item: T) => void
	onUnlock?: (item: T) => void
	hasChanges?: boolean
	customPreview?: (item: T | null) => React.ReactNode
	className?: string
	hideImage?: boolean
	useCompactImageSizing?: boolean
}

// Utility
export const getItemId = (item: BaseItem): number => {
	return (
		item.avatarAccessoryId ??
		item.characterId ??
		item.trophyId ??
		item.nameplateId ??
		item.mapiconId ??
		item.stageId ??
		item.systemVoiceId ??
		item.id ??
		0
	)
}

// Grid Item
const GridItem = <T extends BaseItem>({
	item,
	isEquipped,
	isSelected,
	onClick,
	imageBasePath,
	hideImage,
	useCompactImageSizing
}: {
	item: T
	isEquipped: boolean
	isSelected: boolean
	onClick?: (item: T) => void
	imageBasePath: string
	hideImage: boolean
	useCompactImageSizing: boolean
}) => {
	const imageUrl = `${CDN}/${imageBasePath}/${item.imagePath}`
	const [loaded, setLoaded] = useState(false)

	// Detect item types for appropriate sizing
	const isNameplate = item.nameplateId !== undefined
	const isTrophy = item.trophyId !== undefined
	const isSystemVoice = item.systemVoiceId !== undefined
	const isMapIcon = item.mapiconId !== undefined
	const isCharacter = item.characterId !== undefined
	const isStage = item.stageId !== undefined

	// Wide items (nameplates and trophies)
	const isWide = isNameplate || isTrophy
	// Compact items (system voice, map icon, stage)
	const isCompact = isSystemVoice || isMapIcon || isStage

	const borderClass = isSelected
		? "border-primary bg-primary/15 dark:bg-primary/20 shadow-md shadow-primary/20"
		: isEquipped
			? "border-primary/80 bg-primary/10 dark:bg-primary/10 shadow-sm shadow-primary/10"
			: "border-border bg-surface hover:border-primary/60 hover:bg-accent"

	return (
		<div
			className={cn(
				"group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-sm border-2 shadow-sm transition-all hover:shadow-md",
				isWide
					? "max-w-[200px] md:max-w-[240px] lg:max-w-[280px]"
					: isCompact
						? "max-w-[120px] md:max-w-[140px] lg:max-w-[160px]"
						: "max-w-[100px] md:max-w-[120px] lg:max-w-[140px]",
				borderClass,
				item.locked && "opacity-60"
			)}
			onClick={() => onClick?.(item)}
		>
			{!hideImage && (
				<div
					className={cn(
						"border-border from-surface to-background dark:from-background/20 dark:to-background/40 relative flex w-full items-center justify-center border-b bg-gradient-to-b",
						isWide
							? "h-[40px] p-1 md:h-[45px] lg:h-[50px]"
							: isCharacter
								? "h-[120px] p-2 md:h-[140px] lg:h-[160px]"
								: isCompact
									? "h-[60px] p-1.5 md:h-[70px] lg:h-[80px]"
									: useCompactImageSizing
										? "h-[80px] p-2 md:h-[90px]"
										: "h-[80px] p-2 md:h-[100px] lg:h-[110px]"
					)}
				>
					{!loaded && <div className="bg-muted/30 dark:bg-muted/50 absolute inset-0 animate-pulse" />}

					<img
						src={imageUrl}
						alt={item.label}
						className={cn(
							"object-contain transition-opacity duration-300",
							isWide || isCompact || isCharacter
								? "h-full w-full"
								: useCompactImageSizing
									? "max-h-full w-full"
									: "max-h-full max-w-full",
							loaded ? "opacity-100" : "opacity-0",
							item.locked && !isSelected ? "grayscale group-hover:grayscale-[50%]" : ""
						)}
						loading="lazy"
						onLoad={() => setLoaded(true)}
						draggable={false}
					/>

					{item.locked ? (
						<div className="bg-foreground/70 text-background absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full md:h-5 md:w-5">
							<Lock className="h-2.5 w-2.5 md:h-3 md:w-3" />
						</div>
					) : isEquipped ? (
						<div className="bg-primary text-primary-foreground absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full md:h-5 md:w-5">
							<Check className="h-2.5 w-2.5 md:h-3 md:w-3" />
						</div>
					) : null}
				</div>
			)}

			<div className="bg-muted/40 dark:bg-muted/10 border-border flex h-6 items-center justify-center border-t px-1 md:h-7 md:px-2">
				<div
					className="text-foreground w-full overflow-hidden text-center text-xs whitespace-nowrap md:text-sm"
					title={item.label}
				>
					{item.label}
				</div>
			</div>
		</div>
	)
}

const MemoizedGridItem = memo(GridItem) as typeof GridItem

// Main Grid
export const Grid = <T extends BaseItem>({
	items,
	equippedItemIds,
	selectedItemId,
	loading = false,
	imageBasePath,
	onItemClick,
	onEquip,
	onUnlock,
	hasChanges = false,
	customPreview,
	className,
	hideImage = false,
	useCompactImageSizing = false
}: GridProps<T>) => {
	const [page, setPage] = useState(1)
	const pageSize = 36
	const totalPages = Math.ceil(items.length / pageSize)

	useEffect(() => setPage(1), [items.length])

	const paginatedItems = useMemo(() => {
		const start = (page - 1) * pageSize
		return items.slice(start, start + pageSize)
	}, [items, page])

	// Keyboard shortcuts for pagination
	usePaginationKeyboard(totalPages, setPage, items.length > pageSize)

	const selectedItem = useMemo(
		() => items.find(item => getItemId(item) === selectedItemId) || null,
		[items, selectedItemId]
	)

	const preview = customPreview ? (
		customPreview(selectedItem)
	) : selectedItem ? (
		<PreviewSlot
			item={selectedItem}
			imageBasePath={imageBasePath}
			onEquip={onEquip}
			onUnlock={onUnlock}
			hasChanges={hasChanges}
		/>
	) : null

	if (loading) {
		return (
			<div className={cn("flex h-full w-full flex-col", className)}>
				<div className="flex flex-1 items-center justify-center">
					<div className="bg-surface border-border dark:bg-card grid w-full grid-cols-4 gap-3 rounded-md border p-2 shadow-sm md:grid-cols-4 lg:grid-cols-9">
						{Array.from({ length: 12 }).map((_, i) => (
							<Skeleton key={i} className="aspect-square rounded-sm" />
						))}
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className={cn("flex h-full w-full flex-col", className)}>
			{preview}

			<div className="flex flex-1 items-center justify-center">
				<div className="bg-surface border-border dark:bg-card w-full rounded-md border p-2 shadow-sm">
					{paginatedItems.length > 0 ? (
						<div className="grid grid-cols-4 justify-items-center gap-2 md:grid-cols-4 md:gap-3 lg:grid-cols-9">
							{paginatedItems.map(item => {
								const itemId = getItemId(item)
								const isEquipped = equippedItemIds?.has(itemId) ?? false
								const isSelected = selectedItemId !== undefined ? selectedItemId === itemId : isEquipped

								return (
									<MemoizedGridItem
										key={itemId}
										item={item}
										isEquipped={isEquipped}
										isSelected={isSelected}
										onClick={onItemClick}
										imageBasePath={imageBasePath}
										hideImage={hideImage}
										useCompactImageSizing={useCompactImageSizing}
									/>
								)
							})}
						</div>
					) : (
						<div className="text-muted-foreground flex items-center justify-center p-8">No items to display</div>
					)}
				</div>
			</div>

			{items.length > pageSize && (
				<Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} showKeyboardHints />
			)}
		</div>
	)
}
