import { useCallback, useMemo, useState } from "react";

import { toast } from "sonner";

import { Grid } from "@/components/chunithm/userbox/grid/grid";
import { UserboxSearchCommand } from "@/components/chunithm/userbox/userbox-search-command";
import { Filter } from "@/components/common/filter";
import { Button } from "@/components/ui/button";
import { useAvatar } from "@/hooks/chunithm/userbox/avatar";
import { AvatarSlot, useSearchAvatarItems, useUnlockAvatarItem } from "@/hooks/chunithm/userbox/avatar-search";
import { CDN } from "@/lib/constants";

const slotLabels: Record<AvatarSlot, string> = {
	[AvatarSlot.ALL]: "All",
	[AvatarSlot.BACK]: "Back",
	[AvatarSlot.FACE]: "Face",
	[AvatarSlot.HEAD]: "Head",
	[AvatarSlot.ITEM]: "Item",
	[AvatarSlot.SKIN]: "Skin",
	[AvatarSlot.WEAR]: "Wear",
};

// Available slots including ALL
const availableSlots = Object.values(AvatarSlot);

const Avatar = () => {
	const { items: equippedItems, render, equip } = useAvatar();
	const unlockMutation = useUnlockAvatarItem();

	// Current filter states
	const [selectedSlot, setSelectedSlot] = useState<AvatarSlot>(AvatarSlot.ALL);
	const [searchTerm, setSearchTerm] = useState<string>("");

	// Pending changes - track what items are "equipped" but not saved yet
	const [pendingItems, setPendingItems] = useState<Record<string, number | null>>({});
	const [hasChanges, setHasChanges] = useState(false);

	// Search query based on current filters
	const searchQuery = useSearchAvatarItems({
		slot: selectedSlot === AvatarSlot.ALL ? availableSlots.filter((s) => s !== AvatarSlot.ALL) : [selectedSlot],
		locked: null,
	});

	// Search query for all items (used for avatar rendering and equipped item management)
	const allItemsQuery = useSearchAvatarItems({
		slot: availableSlots.filter((s) => s !== AvatarSlot.ALL),
		locked: null,
	});

	// Filter options for slots
	const slotFilters = useMemo(() => {
		return availableSlots.map((slot) => ({
			value: slot,
			label: slotLabels[slot],
		}));
	}, []);

	// Filtered items based on selected slot and search term
	const filteredItems = useMemo(() => {
		if (!searchQuery.data?.items) return [];

		let items = searchQuery.data.items;

		// Apply search term filter
		if (searchTerm) {
			items = items.filter((item) => item.label.toLowerCase().includes(searchTerm.toLowerCase()));
		}

		return items;
	}, [searchQuery.data?.items, searchTerm]); // Get current item for each slot (pending changes take priority)
	const getCurrentItem = useCallback(
		(slot: string) => {
			if (pendingItems[slot] !== undefined) {
				if (pendingItems[slot] === null) return null;
				return allItemsQuery.data?.items?.find((item) => item.avatarAccessoryId === pendingItems[slot]) || null;
			}
			return equippedItems.find((item) => item.slot === slot) || null;
		},
		[pendingItems, equippedItems, allItemsQuery.data?.items]
	);

	// Create preview avatar items by merging equipped items with pending changes
	const previewAvatarItems = useMemo(() => {
		const baseItems = [...equippedItems];
		const slotsWithPending = Object.keys(pendingItems);

		// Remove items from slots that have pending changes
		const filteredItems = baseItems.filter((item) => !slotsWithPending.includes(item.slot));

		// Add pending items
		Object.entries(pendingItems).forEach(([, itemId]) => {
			if (itemId !== null && itemId !== undefined) {
				const item = allItemsQuery.data?.items?.find((i) => i.avatarAccessoryId === itemId);
				if (item) {
					filteredItems.push(item);
				}
			}
		});

		return filteredItems;
	}, [equippedItems, pendingItems, allItemsQuery.data?.items]);

	// Get equipped item IDs for highlighting (including pending changes)
	const equippedItemIds = useMemo(() => {
		return new Set(previewAvatarItems.map((item) => item.avatarAccessoryId));
	}, [previewAvatarItems]);

	// Create a preview render using the preview items
	const previewRender = useMemo(() => {
		if (!hasChanges) return render;

		// Use the same logic as the useAvatar hook but with preview items
		const initialImages = {
			back: "",
			wear: "",
			skin: `${CDN}/chunithm/avatarStatic/CHU_UI_Avatar_Tex_01400001.webp`,
			handL: `${CDN}/chunithm/avatarStatic/CHU_UI_Avatar_Tex_LeftHand.webp`,
			handR: `${CDN}/chunithm/avatarStatic/CHU_UI_Avatar_Tex_RightHand.webp`,
			head: "",
			item: "",
			face: "",
			faceStatic: `${CDN}/chunithm/avatarStatic/CHU_UI_Avatar_Tex_Face.webp`,
			skinfootL: `${CDN}/chunithm/avatarStatic/CHU_UI_Avatar_Tex_01400001.webp`,
			skinfootR: `${CDN}/chunithm/avatarStatic/CHU_UI_Avatar_Tex_01400001.webp`,
		};

		const avatarImages = {
			...initialImages,
			back: previewAvatarItems.find((item) => item.slot === "back")?.imagePath
				? `${CDN}/chunithm/avatar/${previewAvatarItems.find((item) => item.slot === "back")?.imagePath}`
				: initialImages.back,
			wear: previewAvatarItems.find((item) => item.slot === "wear")?.imagePath
				? `${CDN}/chunithm/avatar/${previewAvatarItems.find((item) => item.slot === "wear")?.imagePath}`
				: initialImages.wear,
			head: previewAvatarItems.find((item) => item.slot === "head")?.imagePath
				? `${CDN}/chunithm/avatar/${previewAvatarItems.find((item) => item.slot === "head")?.imagePath}`
				: initialImages.head,
			item: previewAvatarItems.find((item) => item.slot === "item")?.imagePath
				? `${CDN}/chunithm/avatar/${previewAvatarItems.find((item) => item.slot === "item")?.imagePath}`
				: initialImages.item,
			face: previewAvatarItems.find((item) => item.slot === "face")?.imagePath
				? `${CDN}/chunithm/avatar/${previewAvatarItems.find((item) => item.slot === "face")?.imagePath}`
				: initialImages.face,
		};

		const maybeImg = (path?: string) => (path && path.trim() && !path.endsWith("/") ? <img src={path} /> : null);

		return (
			<div className="relative flex items-center justify-center">
				<div className="avatar_base relative">
					<div className="avatar_back">{maybeImg(avatarImages.back)}</div>
					<div className="avatar_wear">{maybeImg(avatarImages.wear)}</div>
					<div className="avatar_skin">{maybeImg(avatarImages.skin)}</div>
					<div className="avatar_hand_l">{maybeImg(avatarImages.handL)}</div>
					<div className="avatar_hand_r">{maybeImg(avatarImages.handR)}</div>
					<div className="avatar_head">{maybeImg(avatarImages.head)}</div>
					<div className="avatar_face_static">{maybeImg(avatarImages.faceStatic)}</div>
					<div className="avatar_face">{maybeImg(avatarImages.face)}</div>
					<div className="avatar_item_l">{maybeImg(avatarImages.item)}</div>
					<div className="avatar_item_r">{maybeImg(avatarImages.item)}</div>
					<div className="avatar_skinfoot_l">{maybeImg(avatarImages.skinfootL)}</div>
					<div className="avatar_skinfoot_r">{maybeImg(avatarImages.skinfootR)}</div>
				</div>
			</div>
		);
	}, [hasChanges, render, previewAvatarItems]);

	// Check if there are any locked items in pending changes
	const hasLockedPendingItems = useMemo(() => {
		return Object.values(pendingItems).some((itemId) => {
			if (itemId === null || itemId === undefined) return false;
			const item = allItemsQuery.data?.items?.find((i) => i.avatarAccessoryId === itemId);
			return item?.locked;
		});
	}, [pendingItems, allItemsQuery.data?.items]);

	const handleEquipToSlot = useCallback(
		(slot: string, itemId: number | null) => {
			const originalItem = equippedItems.find((item) => item.slot === slot);
			const originalItemId = originalItem?.avatarAccessoryId || null;

			if (itemId === originalItemId) {
				// If we're setting it back to the original, remove from pending changes
				setPendingItems((prev) => {
					const newPending = { ...prev };
					delete newPending[slot];
					return newPending;
				});
			} else {
				// Otherwise, add to pending changes
				setPendingItems((prev) => ({
					...prev,
					[slot]: itemId,
				}));
			}

			// Update hasChanges based on whether there are any pending changes
			setPendingItems((prev) => {
				const newPending =
					itemId === originalItemId
						? (() => {
								const { [slot]: _, ...rest } = prev;
								return rest;
							})()
						: { ...prev, [slot]: itemId };
				setHasChanges(Object.keys(newPending).length > 0);
				return newPending;
			});
		},
		[equippedItems]
	);

	const handleItemClick = useCallback(
		(item: any) => {
			// Directly equip the item to its slot when clicked
			handleEquipToSlot(item.slot, item.avatarAccessoryId);
		},
		[handleEquipToSlot]
	);

	const handleSaveChanges = useCallback(async () => {
		try {
			// Only save non-locked items
			const validChanges = Object.entries(pendingItems).filter(([_, itemId]) => {
				if (itemId === null || itemId === undefined) return true; // Allow unequipping
				const item = allItemsQuery.data?.items?.find((i) => i.avatarAccessoryId === itemId);
				return !item?.locked;
			});

			for (const [slot, itemId] of validChanges) {
				if (itemId !== undefined) {
					await equip(itemId || 0, slot); // Use 0 for unequipping
				}
			}

			setPendingItems({});
			setHasChanges(false);
			toast.success("Avatar changes saved successfully!");
		} catch (error) {
			toast.error("Failed to save changes");
			console.error("Failed to save changes:", error);
		}
	}, [pendingItems, allItemsQuery.data?.items, equip]);

	const handleRevertChanges = useCallback(() => {
		setPendingItems({});
		setHasChanges(false);
	}, []);

	const handleUnlockItem = useCallback(
		async (itemId: number, itemLabel: string) => {
			try {
				await unlockMutation.mutateAsync(itemId);
			} catch (error) {
				toast.error(`Failed to unlock ${itemLabel}`);
				console.error("Failed to unlock item:", error);
			}
		},
		[unlockMutation]
	);

	const handleFilterChange = useCallback((filter: string) => {
		setSelectedSlot(filter as AvatarSlot);
	}, []);

	return (
		<div className="flex h-full w-full flex-col">
			{/* Search Bar and Filters */}
			<div className="border-border bg-background/95 flex-shrink-0 backdrop-blur-sm">
				<div className="px-4 py-3">
					<div className="flex items-center gap-2">
						<div className="flex-1">
							<UserboxSearchCommand
								items={searchQuery.data?.items || []}
								searchQuery={searchTerm}
								onSearchChange={setSearchTerm}
								onItemSelect={handleItemClick}
								itemType="avatar"
							/>
						</div>
						<Filter filters={slotFilters} selectedFilter={selectedSlot} onFilterChange={handleFilterChange} />
					</div>
				</div>
			</div>

			{/* Top Section: Avatar and Equipped Items - Responsive layout */}
			<div className="flex flex-col px-2 py-3 sm:p-4">
				{/* Avatar Preview */}
				<div className="mb-3 flex w-full items-center justify-center sm:mb-4">{hasChanges ? previewRender : render}</div>

				{/* Equipped Items */}
				<div className="flex w-full flex-col items-center">
					<div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:justify-center">
						<Button
							variant="custom"
							onClick={handleRevertChanges}
							disabled={!hasChanges}
							className="cursor-pointer rounded-sm text-xs disabled:cursor-not-allowed sm:text-sm"
						>
							Revert All
						</Button>

						<Button
							variant="custom"
							onClick={handleSaveChanges}
							disabled={!hasChanges || hasLockedPendingItems}
							className="cursor-pointer rounded-sm text-xs disabled:cursor-not-allowed sm:text-sm"
						>
							Save Changes
						</Button>
					</div>
					<div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-6">
						{availableSlots
							.filter((slot) => slot !== AvatarSlot.ALL)
							.map((slot) => {
								const currentItem = getCurrentItem(slot);
								const originalItem = equippedItems.find((item) => item.slot === slot);
								const isPending = pendingItems[slot] !== undefined && pendingItems[slot] !== originalItem?.avatarAccessoryId;
								const hasSlotChange = currentItem?.avatarAccessoryId !== originalItem?.avatarAccessoryId;
								return (
									<div
										key={slot}
										className={`flex min-h-[80px] w-full flex-col rounded-sm border shadow-sm transition-all duration-200 sm:min-h-[100px] ${
											isPending
												? "border-yellow-500 bg-yellow-50 shadow-yellow-500/30 dark:border-yellow-400 dark:bg-yellow-950/30"
												: "border-border bg-card/80 dark:bg-card/60 hover:bg-accent/30 dark:hover:bg-accent/20 hover:border-primary/30 dark:border-border/50 dark:hover:border-primary/40"
										}`}
									>
										{/* Header with slot title */}
										<div className="bg-muted/50 dark:bg-muted/30 border-border/50 dark:border-border/30 border-b p-2">
											<div className="text-foreground/90 dark:text-foreground/80 text-center text-sm font-medium">
												{slotLabels[slot]}
											</div>
										</div>

										{/* Content area */}
										<div className="flex min-h-0 min-w-0 flex-1 text-center">
											{currentItem ? (
												<div className="flex min-w-0 flex-1 flex-col">
													<div className="from-background/40 to-background/60 dark:from-background/10 dark:to-background/30 relative flex flex-1 items-center justify-center bg-gradient-to-b p-2">
														<img
															src={`${CDN}/chunithm/avatar/${currentItem.imagePath}`}
															alt={currentItem.label || "Equipped item"}
															className="h-12 w-12 object-cover object-center sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24"
														/>
														{currentItem.locked ? (
															<div className="absolute top-3 right-3 rounded-sm bg-black/70 px-1 text-xs text-white shadow-lg ring-2 ring-white/20 dark:bg-black/80">
																🔒
															</div>
														) : null}
													</div>
													<div className="bg-muted/30 dark:bg-muted/20 border-border/50 dark:border-border/30 border-t p-2 min-w-0">
														<div
															className="group flex items-center justify-center overflow-hidden text-center min-w-0"
															style={{ height: 20, padding: "2px" }}
														>
															<div
																className="text-foreground/90 dark:text-foreground/80 marquee-text w-full min-w-0 font-medium whitespace-nowrap"
																style={{
																	fontSize: "12px",
																	lineHeight: "16px",
																}}
																title={currentItem.label || "Unknown Item"}
															>
																{currentItem.label || "Unknown Item"}
															</div>
														</div>
														<div className="flex flex-wrap justify-center gap-1">
															{hasSlotChange ? (
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() => handleEquipToSlot(slot, originalItem?.avatarAccessoryId || null)}
																	className="cursor-pointer"
																>
																	Revert
																</Button>
															) : null}
														</div>
														{currentItem.locked ? (
															<Button
																variant="destructive"
																size="sm"
																onClick={() => handleUnlockItem(currentItem.avatarAccessoryId, currentItem.label)}
																className="cursor-pointer"
															>
																Unlock
															</Button>
														) : null}
													</div>
												</div>
											) : (
												<div className="flex flex-1 flex-col">
													<div className="text-muted-foreground/70 dark:text-muted-foreground/60 from-background/40 to-background/60 dark:from-background/10 dark:to-background/30 border-muted/50 dark:border-muted/30 flex flex-1 items-center justify-center border-2 border-dashed bg-gradient-to-b p-4 text-center text-xs">
														No item equipped
													</div>
													{originalItem ? (
														<div className="bg-muted/30 dark:bg-muted/20 border-border/50 dark:border-border/30 border-t p-2">
															<Button
																variant="outline"
																size="sm"
																onClick={() => handleEquipToSlot(slot, originalItem.avatarAccessoryId)}
																className="w-full cursor-pointer"
															>
																Revert
															</Button>
														</div>
													) : null}
												</div>
											)}
										</div>
									</div>
								);
							})}
					</div>
				</div>
			</div>

			{/* Items Grid - Takes remaining page */}
			<div className="flex-1 px-2 pb-2 sm:p-4">
				<Grid
					items={filteredItems}
					equippedItemIds={equippedItemIds}
					onItemClick={handleItemClick}
					imageBasePath="chunithm/avatar"
				/>
			</div>
		</div>
	);
};

export default Avatar;
