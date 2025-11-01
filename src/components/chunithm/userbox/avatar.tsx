import { useCallback, useMemo, useState } from "react"

import { Lock } from "lucide-react"
import { toast } from "sonner"

import { Grid } from "@/components/chunithm/userbox/grid/grid"
import {
	UserboxContent,
	UserboxPageWrapper,
	UserboxSearchBar,
	UserboxSearchCommandWrapper
} from "@/components/chunithm/userbox/userbox-layout"
import { UserboxSearchCommand } from "@/components/chunithm/userbox/userbox-search-command"
import { Filter } from "@/components/common/filter"
import { Button } from "@/components/ui/button"
import { useAvatar } from "@/hooks/chunithm/userbox/avatar"
import { AvatarSlot, useSearchAvatarItems, useUnlockAvatarItem } from "@/hooks/chunithm/userbox/avatar-search"
import { CDN } from "@/lib/constants"

const slotLabels: Record<AvatarSlot, string> = {
	[AvatarSlot.ALL]: "All",
	[AvatarSlot.BACK]: "Back",
	[AvatarSlot.FACE]: "Face",
	[AvatarSlot.HEAD]: "Head",
	[AvatarSlot.ITEM]: "Item",
	[AvatarSlot.SKIN]: "Skin",
	[AvatarSlot.WEAR]: "Wear"
}

function getImageUrl(imagePath?: string) {
	if (!imagePath) return ""
	return `${CDN}/chunithm/avatar/${imagePath}`
}

function getInitialImages() {
	return {
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
		skinfootR: `${CDN}/chunithm/avatarStatic/CHU_UI_Avatar_Tex_01400001.webp`
	}
}

function buildAvatarImages(previewAvatarItems: Array<{ slot: string; imagePath?: string }>) {
	const initialImages = getInitialImages()
	const findItemBySlot = (slot: string) => previewAvatarItems.find(item => item.slot === slot)

	return {
		...initialImages,
		back: getImageUrl(findItemBySlot("back")?.imagePath) || initialImages.back,
		wear: getImageUrl(findItemBySlot("wear")?.imagePath) || initialImages.wear,
		head: getImageUrl(findItemBySlot("head")?.imagePath) || initialImages.head,
		item: getImageUrl(findItemBySlot("item")?.imagePath) || initialImages.item,
		face: getImageUrl(findItemBySlot("face")?.imagePath) || initialImages.face
	}
}

export function Avatar() {
	const { items: equippedItems, render, equip } = useAvatar()
	const unlockMutation = useUnlockAvatarItem()

	const [selectedSlot, setSelectedSlot] = useState<AvatarSlot>(AvatarSlot.ALL)
	const [searchTerm, setSearchTerm] = useState("")
	const [pendingItems, setPendingItems] = useState<Record<string, number | null>>({})
	const [hasChanges, setHasChanges] = useState(false)

	const availableSlots = Object.values(AvatarSlot)
	const slotsWithoutAll = availableSlots.filter(s => s !== AvatarSlot.ALL)

	const searchQuery = useSearchAvatarItems({
		slot: selectedSlot === AvatarSlot.ALL ? slotsWithoutAll : [selectedSlot],
		locked: null
	})

	const allItemsQuery = useSearchAvatarItems({
		slot: slotsWithoutAll,
		locked: null
	})

	const slotFilters = useMemo(
		() =>
			availableSlots.map(slot => ({
				value: slot,
				label: slotLabels[slot]
			})),
		[]
	)

	const filteredItems = useMemo(() => {
		if (!searchQuery.data?.items) return []

		if (!searchTerm) return searchQuery.data.items

		const lowerSearchTerm = searchTerm.toLowerCase()
		return searchQuery.data.items.filter(item => item.label.toLowerCase().includes(lowerSearchTerm))
	}, [searchQuery.data?.items, searchTerm])

	const getCurrentItem = useCallback(
		(slot: string) => {
			if (pendingItems[slot] !== undefined) {
				if (pendingItems[slot] === null) return null
				return allItemsQuery.data?.items?.find(item => item.avatarAccessoryId === pendingItems[slot]) || null
			}
			return equippedItems.find(item => item.slot === slot) || null
		},
		[pendingItems, equippedItems, allItemsQuery.data?.items]
	)

	const previewAvatarItems = useMemo(() => {
		const baseItems = [...equippedItems]
		const slotsWithPending = Object.keys(pendingItems)

		const filteredItems = baseItems.filter(item => !slotsWithPending.includes(item.slot))

		Object.entries(pendingItems).forEach(([, itemId]) => {
			if (itemId === null || itemId === undefined) return
			const item = allItemsQuery.data?.items?.find(i => i.avatarAccessoryId === itemId)
			if (item) filteredItems.push(item)
		})

		return filteredItems
	}, [equippedItems, pendingItems, allItemsQuery.data?.items])

	const equippedItemIds = useMemo(
		() => new Set(previewAvatarItems.map(item => item.avatarAccessoryId)),
		[previewAvatarItems]
	)

	const previewRender = useMemo(() => {
		if (!hasChanges) return render

		const avatarImages = buildAvatarImages(previewAvatarItems)

		return (
			<div className="relative flex items-center justify-center">
				<div className="avatar_base relative">
					{avatarImages.back && (
						<div className="avatar_back">
							<img src={avatarImages.back} alt="" />
						</div>
					)}
					{avatarImages.wear && (
						<div className="avatar_wear">
							<img src={avatarImages.wear} alt="" />
						</div>
					)}
					{avatarImages.skin && (
						<div className="avatar_skin">
							<img src={avatarImages.skin} alt="" />
						</div>
					)}
					{avatarImages.handL && (
						<div className="avatar_hand_l">
							<img src={avatarImages.handL} alt="" />
						</div>
					)}
					{avatarImages.handR && (
						<div className="avatar_hand_r">
							<img src={avatarImages.handR} alt="" />
						</div>
					)}
					{avatarImages.head && (
						<div className="avatar_head">
							<img src={avatarImages.head} alt="" />
						</div>
					)}
					{avatarImages.faceStatic && (
						<div className="avatar_face_static">
							<img src={avatarImages.faceStatic} alt="" />
						</div>
					)}
					{avatarImages.face && (
						<div className="avatar_face">
							<img src={avatarImages.face} alt="" />
						</div>
					)}
					{avatarImages.item && (
						<>
							<div className="avatar_item_l">
								<img src={avatarImages.item} alt="" />
							</div>
							<div className="avatar_item_r">
								<img src={avatarImages.item} alt="" />
							</div>
						</>
					)}
					{avatarImages.skinfootL && (
						<div className="avatar_skinfoot_l">
							<img src={avatarImages.skinfootL} alt="" />
						</div>
					)}
					{avatarImages.skinfootR && (
						<div className="avatar_skinfoot_r">
							<img src={avatarImages.skinfootR} alt="" />
						</div>
					)}
				</div>
			</div>
		)
	}, [hasChanges, render, previewAvatarItems])

	const hasLockedPendingItems = useMemo(() => {
		return Object.values(pendingItems).some(itemId => {
			if (itemId === null || itemId === undefined) return false
			const item = allItemsQuery.data?.items?.find(i => i.avatarAccessoryId === itemId)
			return item?.locked
		})
	}, [pendingItems, allItemsQuery.data?.items])

	const handleEquipToSlot = useCallback(
		(slot: string, itemId: number | null) => {
			const originalItem = equippedItems.find(item => item.slot === slot)
			const originalItemId = originalItem?.avatarAccessoryId || null

			setPendingItems(prev => {
				const newPending =
					itemId === originalItemId
						? (() => {
								const { [slot]: _, ...rest } = prev
								return rest
							})()
						: { ...prev, [slot]: itemId }
				setHasChanges(Object.keys(newPending).length > 0)
				return newPending
			})
		},
		[equippedItems]
	)

	const handleItemClick = useCallback(
		(item: { slot: string; avatarAccessoryId: number }) => {
			handleEquipToSlot(item.slot, item.avatarAccessoryId)
		},
		[handleEquipToSlot]
	)

	const handleSaveChanges = useCallback(async () => {
		try {
			const validChanges = Object.entries(pendingItems).filter(([_, itemId]) => {
				if (itemId === null || itemId === undefined) return true
				const item = allItemsQuery.data?.items?.find(i => i.avatarAccessoryId === itemId)
				return !item?.locked
			})

			for (const [slot, itemId] of validChanges) {
				if (itemId !== undefined) await equip(itemId || 0, slot)
			}

			setPendingItems({})
			setHasChanges(false)
			toast.success("Avatar changes saved successfully!")
		} catch (error) {
			toast.error("Failed to save changes")
			console.error("Failed to save changes:", error)
		}
	}, [pendingItems, allItemsQuery.data?.items, equip])

	const handleRevertChanges = useCallback(() => {
		setPendingItems({})
		setHasChanges(false)
	}, [])

	const handleSaveSlot = useCallback(
		async (slot: string) => {
			const itemId = pendingItems[slot]
			if (itemId === undefined) return

			try {
				if (itemId !== null) {
					const item = allItemsQuery.data?.items?.find(i => i.avatarAccessoryId === itemId)
					if (item?.locked) {
						toast.error(`Cannot equip locked item: ${item.label}`)
						return
					}
				}

				await equip(itemId || 0, slot)

				setPendingItems(prev => {
					const newPending = { ...prev }
					delete newPending[slot]
					setHasChanges(Object.keys(newPending).length > 0)
					return newPending
				})

				toast.success(`${slotLabels[slot as AvatarSlot]} slot saved successfully!`)
			} catch (error) {
				toast.error(`Failed to save ${slotLabels[slot as AvatarSlot]} slot`)
				console.error("Failed to save slot:", error)
			}
		},
		[pendingItems, allItemsQuery.data?.items, equip]
	)

	const handleUnlockItem = useCallback(
		async (itemId: number, itemLabel: string) => {
			try {
				await unlockMutation.mutateAsync(itemId)
			} catch (error) {
				toast.error(`Failed to unlock ${itemLabel}`)
				console.error("Failed to unlock item:", error)
			}
		},
		[unlockMutation]
	)

	const handleFilterChange = useCallback((filter: string) => {
		setSelectedSlot(filter as AvatarSlot)
	}, [])

	return (
		<UserboxPageWrapper>
			<UserboxSearchBar>
				<UserboxSearchCommandWrapper>
					<UserboxSearchCommand
						items={searchQuery.data?.items || []}
						searchQuery={searchTerm}
						onSearchChange={setSearchTerm}
						onItemSelect={handleItemClick}
						itemType="avatar"
					/>
				</UserboxSearchCommandWrapper>
				<Filter filters={slotFilters} selectedFilter={selectedSlot} onFilterChange={handleFilterChange} />
			</UserboxSearchBar>

			<div className="flex flex-col px-2 py-3 sm:p-4">
				<div className="mb-3 flex w-full items-center justify-center sm:mb-4">
					{hasChanges ? previewRender : render}
				</div>

				<div className="flex w-full flex-col items-center">
					<div className="mb-3 flex w-full flex-row gap-2 sm:mb-4">
						<Button
							variant="custom"
							onClick={handleRevertChanges}
							disabled={!hasChanges}
							className="flex-1 cursor-pointer rounded-sm text-xs disabled:cursor-not-allowed sm:text-sm"
						>
							Revert All
						</Button>

						<Button
							variant="custom"
							onClick={handleSaveChanges}
							disabled={!hasChanges || hasLockedPendingItems}
							className="flex-1 cursor-pointer rounded-sm text-xs disabled:cursor-not-allowed sm:text-sm"
						>
							Save Changes
						</Button>
					</div>
					<div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-6">
						{availableSlots
							.filter(slot => slot !== AvatarSlot.ALL)
							.map(slot => {
								const currentItem = getCurrentItem(slot)
								const originalItem = equippedItems.find(item => item.slot === slot)
								const isPending =
									pendingItems[slot] !== undefined && pendingItems[slot] !== originalItem?.avatarAccessoryId
								const hasSlotChange = currentItem?.avatarAccessoryId !== originalItem?.avatarAccessoryId

								return (
									<div
										key={slot}
										className={`border-border flex min-h-[80px] w-full flex-col rounded-sm border sm:min-h-[100px] ${
											isPending ? "border-primary" : "border-border"
										}`}
									>
										<div className="bg-background/30 border-b p-2">
											<div className="text-foreground/90 dark:text-foreground/80 text-center text-sm font-medium">
												{slotLabels[slot]}
											</div>
										</div>

										<div className="flex min-h-0 min-w-0 flex-1 text-center">
											{currentItem ? (
												<div className="flex min-w-0 flex-1 flex-col">
													<div className="bg-background/30 relative flex flex-1 items-center justify-center bg-gradient-to-b p-2">
														<img
															src={`${CDN}/chunithm/avatar/${currentItem.imagePath}`}
															alt={currentItem.label || "Equipped item"}
															className="h-12 w-12 object-cover object-center sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24"
														/>
														{currentItem.locked ? (
															<div className="bg-muted/30 dark:bg-muted/20 border-border/50 dark:border-border/30 absolute top-3 right-3 flex h-4 w-4 items-center justify-center rounded-sm shadow-lg ring-2 md:h-5 md:w-5">
																<Lock className="h-2.5 w-2.5 md:h-3 md:w-3" />
															</div>
														) : null}
													</div>
													<div className="bg-background/30 min-w-0 border-t p-2">
														<div
															className="group flex min-w-0 items-center justify-center overflow-hidden text-center"
															style={{ height: 20, padding: "2px" }}
														>
															<div
																className="text-foreground/90 dark:text-foreground/80 marquee-text w-full min-w-0 font-medium whitespace-nowrap"
																style={{
																	fontSize: "12px",
																	lineHeight: "16px"
																}}
																title={currentItem.label || "Unknown Item"}
															>
																{currentItem.label || "Unknown Item"}
															</div>
														</div>
														<div className="flex flex-wrap justify-center gap-1">
															{hasSlotChange ? (
																<>
																	<Button
																		variant="custom"
																		size="sm"
																		onClick={() => handleEquipToSlot(slot, originalItem?.avatarAccessoryId || null)}
																		className="flex-1 cursor-pointer sm:flex-none"
																	>
																		Revert
																	</Button>
																	<Button
																		variant="custom"
																		size="sm"
																		onClick={() => handleSaveSlot(slot)}
																		disabled={currentItem?.locked}
																		className="flex-1 cursor-pointer sm:flex-none"
																	>
																		Save
																	</Button>
																</>
															) : null}
															{currentItem.locked ? (
																<Button
																	variant="destructive"
																	size="sm"
																	onClick={() => handleUnlockItem(currentItem.avatarAccessoryId, currentItem.label)}
																	className="w-full cursor-pointer sm:w-auto"
																>
																	Unlock
																</Button>
															) : null}
														</div>
													</div>
												</div>
											) : (
												<div className="flex flex-1 flex-col">
													<div className="bg-background/30 flex flex-1 items-center justify-center border-2 border-dashed p-4 text-center text-xs">
														No item equipped
													</div>
													{originalItem && (
														<div className="bg-background/30 border-t p-2">
															<Button
																variant="outline"
																size="sm"
																onClick={() => handleEquipToSlot(slot, originalItem.avatarAccessoryId)}
																className="w-full cursor-pointer"
															>
																Revert
															</Button>
														</div>
													)}
												</div>
											)}
										</div>
									</div>
								)
							})}
					</div>
				</div>
			</div>

			<UserboxContent>
				<Grid
					items={filteredItems}
					equippedItemIds={equippedItemIds}
					onItemClick={handleItemClick}
					imageBasePath="chunithm/avatar"
				/>
			</UserboxContent>
		</UserboxPageWrapper>
	)
}
