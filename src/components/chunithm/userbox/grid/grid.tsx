import { memo, useEffect, useMemo, useRef, useState } from "react";

import { Check, Lock } from "lucide-react";

import { Filter } from "@/components/common/filter";
import { PreviewSlot } from "@/components/common/preview-slot";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CDN } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Types
export interface BaseItem {
	id?: number;
	avatarAccessoryId?: number;
	characterId?: number;
	trophyId?: number;
	nameplateId?: number;
	mapiconId?: number;
	stageId?: number;
	systemVoiceId?: number;
	imagePath: string;
	label: string;
	locked: boolean;
}

export interface GridProps<T extends BaseItem> {
	items: T[];
	equippedItemIds?: Set<number>;
	selectedItemId?: number | null;
	loading?: boolean;
	imageBasePath: string;
	onItemClick?: (item: T) => void;
	onEquip?: (item: T) => void;
	onUnlock?: (item: T) => void;
	hasChanges?: boolean;
	customPreview?: (item: T | null) => React.ReactNode;
	layout?: "split" | "stacked";
	hidePreview?: boolean;
	itemWidth?: number;
	itemHeight?: number;
	maxColumns?: number;
	minColumns?: number;
	gap?: number;
	itemsPerPage?: number;
	hidePagination?: boolean;
	className?: string;
	containerClassName?: string;
	gridClassName?: string;
	hideImage?: boolean;
}

// Utility Functions
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
	);
};

export const calculateScaling = (itemWidth: number) => {
	const baseFactor = itemWidth / 120;
	const scaleFactor = Math.min(1.3, Math.max(0.8, baseFactor));
	const fontSize = Math.max(10, Math.min(14, 12 * scaleFactor));
	const lineHeight = fontSize + 2;
	const padding = Math.max(4, Math.min(8, 6 * scaleFactor));
	const labelHeight = Math.max(24, lineHeight + padding * 2);

	return { fontSize, lineHeight, padding, labelHeight };
};

// Hooks
export const useResponsiveColumns = (
	containerRef: React.RefObject<HTMLDivElement | null>,
	baseWidth: number,
	baseHeight: number,
	gap: number,
	maxCols: number,
	minCols: number
) => {
	const [columns, setColumns] = useState(minCols);
	const [scaledWidth, setScaledWidth] = useState(baseWidth);
	const [scaledHeight, setScaledHeight] = useState(baseHeight);

	useEffect(() => {
		if (!containerRef.current) return;

		const observer = new ResizeObserver((entries) => {
			const containerWidth = entries[0]?.contentRect.width ?? 0;
			const calculatedCols = Math.floor((containerWidth + gap) / (baseWidth + gap));
			const cols = Math.max(minCols, Math.min(maxCols, calculatedCols));

			const availableWidth = containerWidth - (cols - 1) * gap;
			// Better scaling for mobile devices - more aggressive scaling for mobile
			const minScale = cols <= 2 ? 0.4 : cols <= 3 ? 0.5 : cols <= 4 ? 0.6 : cols <= 6 ? 0.7 : cols <= 8 ? 0.8 : 0.9;
			const maxScale = cols <= 2 ? 0.6 : cols <= 3 ? 0.7 : cols <= 4 ? 0.8 : cols <= 6 ? 1.0 : cols <= 8 ? 1.2 : 1.4;
			const width = Math.max(baseWidth * minScale, Math.min(baseWidth * maxScale, availableWidth / cols));
			const height = baseHeight * (width / baseWidth);

			setColumns(cols);
			setScaledWidth(width);
			setScaledHeight(height);
		});

		observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, [containerRef, baseWidth, baseHeight, gap, maxCols, minCols]);

	return { columns, scaledWidth, scaledHeight };
};

// Grid Item Component
interface GridItemProps<T extends BaseItem> {
	item: T;
	isEquipped?: boolean;
	isSelected?: boolean;
	onClick?: (item: T) => void;
	imageBasePath: string;
	itemWidth?: number;
	itemHeight?: number;
	hideImage?: boolean;
}

const GridItem = memo<GridItemProps<any>>(
	({
		item,
		isEquipped = false,
		isSelected = false,
		onClick,
		imageBasePath,
		itemWidth = 120,
		itemHeight = 120,
		hideImage = false,
	}) => {
		const [imageLoaded, setImageLoaded] = useState(false);
		const [imageError, setImageError] = useState(false);

		const imageUrl = useMemo(() => {
			return item.imagePath ? `${CDN}/${imageBasePath}/${item.imagePath}` : null;
		}, [item.imagePath, imageBasePath]);

		const handleClick = () => {
			onClick?.(item);
		};

		const baseFactor = itemWidth / 120;
		const scaleFactor = Math.min(1.3, Math.max(0.8, baseFactor));
		const scaledFontSize = Math.max(10, Math.min(14, 12 * scaleFactor));
		const scaledLineHeight = scaledFontSize + 2;
		const scaledPadding = Math.max(4, Math.min(8, 6 * scaleFactor));
		const scaledLabelHeight = Math.max(24, scaledLineHeight + scaledPadding * 2);

		return (
			<div
				className={cn(
					"group bg-card relative flex-shrink-0 cursor-pointer overflow-hidden rounded-sm border-2 shadow-sm",
					"hover:border-primary/50 hover:bg-accent/50 transition-[border-color,background-color,box-shadow] duration-200 hover:shadow-md",
					isSelected && "border-yellow-500 bg-yellow-50 shadow-yellow-500/30 dark:bg-yellow-950/20",
					!isSelected &&
						isEquipped &&
						"border-yellow-400 bg-yellow-50/50 shadow-lg shadow-yellow-400/20 dark:bg-yellow-950/10",
					!isSelected && !isEquipped && "border-border bg-card",
					item.locked && "opacity-60"
				)}
				style={{ width: itemWidth, height: hideImage ? scaledLabelHeight : itemHeight + scaledLabelHeight }}
				onClick={handleClick}
			>
				{!hideImage && (
					<div
						className="from-background/50 to-background/80 dark:from-background/20 dark:to-background/40 border-border relative overflow-hidden border-b bg-gradient-to-b"
						style={{ width: itemWidth, height: itemHeight }}
					>
						<div
							className={cn("bg-muted/30 dark:bg-muted/50 absolute inset-0", !imageLoaded && "animate-pulse")}
							style={{ width: itemWidth, height: itemHeight }}
						/>

						{imageUrl && !imageError && (
							<img
								src={imageUrl}
								alt={item.label}
								className={cn(
									"absolute inset-0 object-contain p-2 transition-opacity duration-300",
									imageLoaded ? "opacity-100" : "opacity-0",
									item.locked && "grayscale group-hover:grayscale-[50%]"
								)}
								style={{ width: itemWidth, height: itemHeight }}
								loading="lazy"
								onLoad={() => setImageLoaded(true)}
								onError={() => setImageError(true)}
							/>
						)}

						{item.locked ? (
							<div
								className="absolute flex items-center justify-center rounded-full bg-black/60 text-white"
								style={{
									top: Math.max(4, itemHeight * 0.05),
									right: Math.max(4, itemWidth * 0.05),
									width: Math.max(16, Math.min(24, itemWidth * 0.15)),
									height: Math.max(16, Math.min(24, itemWidth * 0.15)),
								}}
							>
								<Lock size={Math.max(10, Math.min(14, itemWidth * 0.08))} />
							</div>
						) : null}
						{isEquipped && (
							<div
								className="absolute flex items-center justify-center rounded-full bg-yellow-500 font-medium text-white"
								style={{
									top: Math.max(4, itemHeight * 0.05),
									right: Math.max(4, itemWidth * 0.05),
									width: Math.max(16, Math.min(24, itemWidth * 0.15)),
									height: Math.max(16, Math.min(24, itemWidth * 0.15)),
								}}
							>
								<Check size={Math.max(10, Math.min(14, itemWidth * 0.08))} />
							</div>
						)}
					</div>
				)}

				<div
					className={cn(
						"bg-muted/20 dark:bg-muted/10 border-border flex items-center justify-center text-center",
						!hideImage && "border-t"
					)}
					style={{
						height: scaledLabelHeight,
						padding: `${scaledPadding}px`,
					}}
				>
					<div className="group w-full overflow-hidden">
						<div
							className="text-foreground marquee-text w-full whitespace-nowrap"
							style={{
								fontSize: `${scaledFontSize}px`,
								lineHeight: `${scaledLineHeight}px`,
							}}
							title={item.label}
						>
							{item.label}
						</div>
					</div>
				</div>
			</div>
		);
	}
);

GridItem.displayName = "GridItem";

// Main Grid Component
export const Grid = <T extends BaseItem>({
	items,
	equippedItemIds,
	selectedItemId,
	loading = false,
	layout = "stacked",
	hidePreview = false,
	itemWidth = 120,
	itemHeight = 120,
	maxColumns = 12,
	minColumns = 1,
	gap = 12,
	imageBasePath,
	onItemClick,
	onEquip,
	onUnlock,
	hasChanges = false,
	customPreview,
	itemsPerPage = 36,
	hidePagination = false,
	className,
	containerClassName,
	gridClassName,
	hideImage = false,
}: GridProps<T>) => {
	const gridContainerRef = useRef<HTMLDivElement>(null);
	const [page, setPage] = useState(1);

	const { columns, scaledWidth, scaledHeight } = useResponsiveColumns(
		gridContainerRef,
		itemWidth,
		itemHeight,
		gap,
		maxColumns,
		minColumns
	);

	// Pagination logic
	const safeItemsPerPage = Math.max(1, Math.floor(itemsPerPage || 50));
	const totalPages = Math.max(1, Math.ceil((items?.length || 0) / safeItemsPerPage));

	// Reset to page 1 when items array changes substantially (like filtering)
	useEffect(() => {
		setPage(1);
	}, [items.length]);

	const pagedItems = useMemo(() => {
		if (hidePagination) return items;
		const start = (page - 1) * safeItemsPerPage;
		return (items || []).slice(start, start + safeItemsPerPage);
	}, [items, page, safeItemsPerPage, hidePagination]);

	// Keyboard navigation
	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			// Only handle arrow keys when not in an input/textarea/select
			if (
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement ||
				event.target instanceof HTMLSelectElement ||
				(event.target as HTMLElement).isContentEditable
			) {
				return;
			}

			if (event.key === "ArrowLeft") {
				event.preventDefault();
				setPage((p) => Math.max(1, p - 1));
			} else if (event.key === "ArrowRight") {
				event.preventDefault();
				setPage((p) => Math.min(totalPages, p + 1));
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [totalPages]);

	const selectedItem = useMemo(() => items.find((item) => getItemId(item) === selectedItemId), [items, selectedItemId]);

	const preview = useMemo(() => {
		if (hidePreview) return null;

		if (customPreview) {
			return customPreview(selectedItem || null);
		}

		if (!selectedItem) return null;

		return (
			<PreviewSlot
				item={selectedItem}
				imageBasePath={imageBasePath}
				onEquip={onEquip}
				onUnlock={onUnlock}
				hasChanges={hasChanges}
				scaledWidth={scaledWidth}
				scaledHeight={scaledHeight}
			/>
		);
	}, [
		hidePreview,
		selectedItem,
		imageBasePath,
		onEquip,
		onUnlock,
		hasChanges,
		scaledWidth,
		scaledHeight,
		customPreview,
	]);

	const gridContent = (
		<div className={cn("flex flex-1 flex-col gap-3 sm:gap-4", containerClassName)} style={{ minHeight: 0 }}>
			{/* Grid */}
			<div
				ref={gridContainerRef}
				className="flex w-full flex-1 items-center justify-center px-2 sm:px-4"
				style={{ minHeight: 0 }}
			>
				{loading ? (
					<div
						className="bg-card rounded-sm p-3 sm:p-4"
						style={{
							display: "grid",
							gridTemplateColumns: `repeat(${columns}, ${scaledWidth}px)`,
							gap: "12px",
							width: "fit-content",
						}}
					>
						{Array.from({ length: columns * 3 }).map((_, i) => (
							<div
								key={i}
								className="overflow-hidden rounded-sm border"
								style={{ width: scaledWidth, height: scaledHeight + 24 }}
							>
								<Skeleton style={{ width: scaledWidth, height: scaledHeight }} />
								<Skeleton className="mx-2 my-2" style={{ height: 8 }} />
							</div>
						))}
					</div>
				) : (
					<div
						className={cn("bg-card rounded-sm p-2", gridClassName)}
						style={{
							display: "grid",
							gridTemplateColumns: `repeat(${columns}, ${scaledWidth}px)`,
							gap: `${gap}px`,
							width: "fit-content",
						}}
					>
						{pagedItems.map((item) => {
							const itemId = getItemId(item);
							const isEquipped = equippedItemIds?.has(itemId) ?? false;
							const isSelected = selectedItemId !== undefined ? selectedItemId === itemId : isEquipped;

							return (
								<GridItem
									key={itemId}
									item={item}
									isEquipped={isEquipped}
									isSelected={isSelected}
									onClick={onItemClick}
									imageBasePath={imageBasePath}
									itemWidth={scaledWidth}
									itemHeight={scaledHeight}
									hideImage={hideImage}
								/>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);

	// Pagination component
	const pagination = !hidePagination && items && items.length > safeItemsPerPage && (
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
						className="bg-card border-border hover:bg-muted min-w-[80px] cursor-pointer rounded-sm border"
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page === 1}
					>
						Previous
					</Button>
					<Button
						variant="secondary"
						size="sm"
						className="bg-card border-border hover:bg-muted min-w-[80px] cursor-pointer rounded-sm border"
						onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
						disabled={page === totalPages}
					>
						Next
					</Button>
				</div>
				<div className="text-muted-foreground hidden items-center gap-3 text-xs lg:flex">
					<div className="flex items-center gap-1">
						<CommandMenuKbd>←</CommandMenuKbd>
						<span>Previous</span>
					</div>
					<div className="flex items-center gap-1">
						<CommandMenuKbd>→</CommandMenuKbd>
						<span>Next</span>
					</div>
				</div>
			</div>
		</div>
	);

	if (layout === "split" && preview) {
		return (
			<div className={cn("flex h-full w-full flex-row gap-4", className)}>
				{preview}
				<div className="flex flex-1 flex-col">
					{gridContent}
					{pagination}
				</div>
			</div>
		);
	}

	return (
		<div className={cn("flex h-full w-full flex-col", className)}>
			{preview}
			{gridContent}
			{pagination}
		</div>
	);
};

function CommandMenuKbd({ className, ...props }: React.ComponentProps<"kbd">) {
	return (
		<kbd
			className={cn(
				"bg-background text-muted-foreground pointer-events-none flex h-5 items-center justify-center gap-1 rounded border px-1 font-sans text-[0.7rem] font-medium select-none [&_svg:not([class*='size-'])]:size-3",
				className
			)}
			{...props}
		/>
	);
}

// Export for backward compatibility
export { GridItem };
export { Filter };
