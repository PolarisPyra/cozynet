import { useState } from "react"

import { Shirt } from "lucide-react"
import { toast } from "sonner"

import {
	useCurrentAvatar,
	useEquipAvatarItem,
	useSearchAvatarItems,
	useUnlockAvatarItem
} from "@/app/features/chunithm/hooks/userbox/avatar"
import { Button } from "@/app/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/shared/components/ui/select"
import { ItemSelectionDialog } from "@/app/shared/components/userbox/item-selection-dialog"
import { CDN } from "@/app/shared/utils/constants"

type AvatarSlot = "back" | "wear" | "head" | "face" | "item" | "skin" | "front"

const SLOT_LABELS: Record<AvatarSlot, string> = {
	back: "Back",
	wear: "Wear",
	head: "Head",
	face: "Face",
	item: "Item",
	skin: "Skin",
	front: "Front"
}

const SLOT_ORDER: AvatarSlot[] = ["back", "wear", "head", "face", "item", "skin"]

export function AvatarAccessories() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [selectedSlot, setSelectedSlot] = useState<AvatarSlot | "all">("all") // Default to "all"
	const [lockedFilter, setLockedFilter] = useState<boolean | null>(null) // null = all, false = unlocked, true = locked

	const { data: currentAvatar } = useCurrentAvatar()
	const { data: searchResults } = useSearchAvatarItems({
		category: selectedSlot === "all" ? null : getCategoryForSlot(selectedSlot),
		locked: lockedFilter
	})
	const { mutate: equipAvatarItem } = useEquipAvatarItem()
	const { mutate: unlockAvatarItem } = useUnlockAvatarItem()

	const items = searchResults?.items ?? []
	const currentItem = selectedSlot !== "all" ? currentAvatar?.[selectedSlot] : undefined

	const handleEquip = (id: number) => {
		// Find the item to get its slot information
		const selectedItem = items.find(item => item.avatarAccessoryId === id)

		if (!selectedItem) {
			toast.error("Item not found")
			return
		}

		const itemSlot = selectedItem.slot as AvatarSlot

		equipAvatarItem(
			{ avatarAccessoryId: id, slot: itemSlot },
			{
				onSuccess: () => {
					toast.success(`${SLOT_LABELS[itemSlot]} equipped successfully!`)
					setIsDialogOpen(false)
				},
				onError: () => toast.error(`Failed to equip ${SLOT_LABELS[itemSlot].toLowerCase()}`)
			}
		)
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
		<>
			<div className="bg-card border-border flex flex-col overflow-hidden rounded-sm border">
				<div className="bg-muted/50 border-border flex items-center justify-center border-b px-4 py-3">
					<span className="text-primary text-sm font-semibold">Avatar</span>
				</div>
				<div className="flex flex-1 flex-col p-4">
					{/* All Avatar Slots */}
					<div className="mb-auto grid grid-cols-3 gap-2">
						{SLOT_ORDER.map(slot => {
							const avatarPart = currentAvatar?.[slot]
							return (
								<div
									key={slot}
									className="flex cursor-pointer flex-col items-center gap-1 transition-opacity hover:opacity-80"
									onClick={() => {
										setSelectedSlot(slot)
										setIsDialogOpen(true)
									}}
								>
									<div className="text-muted-foreground text-xs">{SLOT_LABELS[slot]}</div>
									{avatarPart?.imagePath ? (
										<img
											src={
												avatarPart.imagePath.startsWith("http")
													? avatarPart.imagePath
													: `${CDN}/chunithm/avatar/${avatarPart.imagePath}`
											}
											alt={SLOT_LABELS[slot]}
											className="h-14 w-14 rounded-sm object-cover"
										/>
									) : (
										<div className="bg-muted flex h-14 w-14 items-center justify-center rounded-sm">
											<Shirt className="h-5 w-5 opacity-30" />
										</div>
									)}
								</div>
							)
						})}
					</div>

					<Button size="sm" variant="custom" onClick={() => setIsDialogOpen(true)} className="mt-4 w-full">
						Change
					</Button>
				</div>
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
		</>
	)
}

function getCategoryForSlot(slot: AvatarSlot): number {
	const categoryMap: Record<AvatarSlot, number> = {
		back: 7,
		wear: 1,
		head: 2,
		face: 3,
		item: 5,
		skin: 4,
		front: 6
	}
	return categoryMap[slot]
}
