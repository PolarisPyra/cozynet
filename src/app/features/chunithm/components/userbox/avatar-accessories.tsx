import { useMemo, useState } from "react"

import { Shirt } from "lucide-react"
import { toast } from "sonner"

import { useAvatarPending } from "@/app/features/chunithm/components/userbox/avatar-pending-context"
import {
	AvatarSlot,
	useCurrentAvatar,
	useEquipAvatarItem,
	useSearchAvatarItems,
	useUnlockAvatarItem
} from "@/app/features/chunithm/hooks/userbox/avatar"
import { Button } from "@/app/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/shared/components/ui/select"
import { ItemSelectionDialog } from "@/app/shared/components/userbox/item-selection-dialog"
import { CDN } from "@/app/shared/utils/constants"

const SLOT_LABELS: Record<AvatarSlot, string> = {
	[AvatarSlot.BACK]: "Back",
	[AvatarSlot.WEAR]: "Wear",
	[AvatarSlot.HEAD]: "Head",
	[AvatarSlot.FACE]: "Face",
	[AvatarSlot.ITEM]: "Item",
	[AvatarSlot.SKIN]: "Skin",
	[AvatarSlot.FRONT]: "Front"
}

const SLOT_ORDER: AvatarSlot[] = [
	AvatarSlot.BACK,
	AvatarSlot.WEAR,
	AvatarSlot.HEAD,
	AvatarSlot.FACE,
	AvatarSlot.ITEM,
	AvatarSlot.SKIN,
	AvatarSlot.FRONT
]

export function AvatarAccessories() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [selectedSlot, setSelectedSlot] = useState<AvatarSlot | "all">("all") // Default to "all"
	const [lockedFilter, setLockedFilter] = useState<boolean | null>(null) // null = all, false = unlocked, true = locked

	const { pendingSelections, setPendingSelections } = useAvatarPending()
	const { data: currentAvatar } = useCurrentAvatar()
	const { data: searchResults } = useSearchAvatarItems({
		category: selectedSlot === "all" ? null : getCategoryForSlot(selectedSlot),
		locked: lockedFilter
	})
	// Fetch all items to resolve pending IDs for display
	const { data: allItemsData } = useSearchAvatarItems({ category: null, locked: null })
	const { mutate: equipAvatarItem } = useEquipAvatarItem()
	const { mutate: unlockAvatarItem } = useUnlockAvatarItem()

	const items = searchResults?.items ?? []
	const allItems = allItemsData?.items ?? []
	const hasPendingSelections = Object.keys(pendingSelections).length > 0

	// Get current item, preferring pending selection over current avatar
	const currentItem = useMemo(() => {
		if (selectedSlot === "all") return undefined
		const pendingId = pendingSelections[selectedSlot]
		if (pendingId) {
			return (
				allItems.find(item => item.avatarAccessoryId === pendingId) ||
				items.find(item => item.avatarAccessoryId === pendingId)
			)
		}
		return currentAvatar?.[selectedSlot]
	}, [selectedSlot, pendingSelections, allItems, items, currentAvatar])

	const handleSelect = (id: number) => {
		// Find the item to get its slot information - check both items and allItems
		const selectedItem =
			items.find(item => item.avatarAccessoryId === id) || allItems.find(item => item.avatarAccessoryId === id)

		if (!selectedItem) {
			toast.error("Item not found")
			return
		}

		const itemSlot = selectedItem.slot as AvatarSlot

		// If a specific slot was selected, use that; otherwise use the item's slot
		const targetSlot = selectedSlot !== "all" ? selectedSlot : itemSlot

		// Store the selection temporarily (this will update the preview immediately)
		setPendingSelections(prev => ({
			...prev,
			[targetSlot]: id
		}))

		setIsDialogOpen(false)
	}

	const handleSave = () => {
		if (!hasPendingSelections) {
			toast.error("No changes to save")
			return
		}

		// Submit all pending selections
		const savePromises = Object.entries(pendingSelections).map(([slot, id]) => {
			return new Promise<void>((resolve, reject) => {
				equipAvatarItem(
					{ avatarAccessoryId: id, slot: slot as AvatarSlot },
					{
						onSuccess: () => {
							toast.success(`${SLOT_LABELS[slot as AvatarSlot]} equipped successfully!`)
							resolve()
						},
						onError: () => {
							toast.error(`Failed to equip ${SLOT_LABELS[slot as AvatarSlot].toLowerCase()}`)
							reject()
						}
					}
				)
			})
		})

		Promise.all(savePromises)
			.then(() => {
				setPendingSelections({})
			})
			.catch(() => {
				// Errors are already handled in individual callbacks
			})
	}

	const handleEquip = (id: number) => {
		// This now just stores the selection, doesn't submit
		handleSelect(id)
	}

	const handleUnlock = (id: number) => {
		unlockAvatarItem(id, {
			onSuccess: () => {
				toast.success("Avatar item unlocked successfully!")
			},
			onError: () => toast.error("Failed to unlock avatar item")
		})
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
				{SLOT_ORDER.map(slot => {
					// Get the item to display - prefer pending selection, then current avatar
					const pendingId = pendingSelections[slot]
					const displayItem = pendingId
						? allItems.find(item => item.avatarAccessoryId === pendingId)
						: currentAvatar?.[slot]
					const avatarPart = displayItem || currentAvatar?.[slot]

					return (
						<div
							key={slot}
							className="group border-border relative flex cursor-pointer flex-col items-center gap-3 overflow-hidden rounded-xl border p-4 transition-all hover:border-primary/50"
							onClick={() => {
								setSelectedSlot(slot)
								setIsDialogOpen(true)
							}}
						>
							<div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
								+
							</div>
							<div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
								{SLOT_LABELS[slot]}
							</div>
							<div className="relative flex h-24 w-24 items-center justify-center">
								{avatarPart?.imagePath && (slot === AvatarSlot.SKIN || avatarPart?.label !== "ノーマル") ? (
									<img
										src={
											avatarPart.imagePath.startsWith("http")
												? avatarPart.imagePath
												: `${CDN}/chunithm/avatar/${avatarPart.imagePath}`
										}
										alt={SLOT_LABELS[slot]}
										className="h-full w-full object-contain p-2"
									/>
								) : (
									<Shirt className="h-10 w-10 opacity-20 transition-opacity group-hover:opacity-40" />
								)}
							</div>
							<div className="mt-6 w-full truncate text-center text-xs font-semibold">
								{avatarPart?.label || "Empty"}
							</div>
						</div>
					)
				})}
			</div>

			<div className="flex justify-end gap-3 border-t pt-6">
				<Button
					size="lg"
					variant="default"
					onClick={handleSave}
					disabled={!hasPendingSelections}
					className="px-8"
				>
					Save Changes
				</Button>
			</div>

			<ItemSelectionDialog
				title="Select Avatar Part"
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				items={items.map(item => {
					const imageSrc = item.imagePath.startsWith("http")
						? item.imagePath
						: `${CDN}/chunithm/avatar/${item.imagePath}`
					return {
						id: item.avatarAccessoryId,
						name: item.label,
						imageUrl: imageSrc,
						locked: item.locked
					}
				})}
				currentItemId={currentItem?.avatarAccessoryId}
				onSelect={handleEquip}
				onUnlock={handleUnlock}
				imageClassName="h-16 w-16"
				headerControls={
					<div className="flex flex-col gap-3">
						<div className="flex gap-2">
							<div className="flex-1">
								<Select value={selectedSlot} onValueChange={v => setSelectedSlot(v as AvatarSlot | "all")}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Categories</SelectItem>
										{Object.entries(SLOT_LABELS).map(([value, label]) => (
											<SelectItem key={value} value={value}>
												{label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="flex-1">
								<Select
									value={lockedFilter === null ? "all" : lockedFilter ? "locked" : "unlocked"}
									onValueChange={v => setLockedFilter(v === "all" ? null : v === "locked" ? true : false)}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All</SelectItem>
										<SelectItem value="unlocked">Unlocked</SelectItem>
										<SelectItem value="locked">Locked</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
				}
			/>
		</div>
	)
}

function getCategoryForSlot(slot: AvatarSlot): number {
	const categoryMap: Record<AvatarSlot, number> = {
		[AvatarSlot.BACK]: 7,
		[AvatarSlot.WEAR]: 1,
		[AvatarSlot.HEAD]: 2,
		[AvatarSlot.FACE]: 3,
		[AvatarSlot.ITEM]: 5,
		[AvatarSlot.SKIN]: 4,
		[AvatarSlot.FRONT]: 6
	}
	return categoryMap[slot]
}
