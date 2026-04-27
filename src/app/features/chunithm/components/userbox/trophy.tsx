import { useMemo, useState } from "react"

import { toast } from "sonner"

import { useUserboxPending } from "@/app/features/chunithm/components/userbox/userbox-pending-context"
import { useCurrentTrophies, useEquipTrophy, useSearchTrophies, useUnlockTrophy, type TrophyItem } from "@/app/features/chunithm/hooks/userbox/trophy"
import { Button } from "@/app/shared/components/ui/button"

import { Tabs, TabsList, TabsTrigger } from "@/app/shared/components/ui/tabs"
import { ItemSelectionDialog } from "@/app/shared/components/userbox/item-selection-dialog"
import { CDN } from "@/app/shared/utils/constants"

type TrophySlot = "main" | "sub1" | "sub2"

const SLOT_MAP: Record<number, TrophySlot> = {
	1: "main",
	2: "sub1",
	3: "sub2"
}

const REVERSE_SLOT_MAP: Record<TrophySlot, number> = {
	"main": 1,
	"sub1": 2,
	"sub2": 3
}

const SLOT_LABELS: Record<number, string> = {
	1: "Main Trophy",
	2: "Sub Trophy 1",
	3: "Sub Trophy 2"
}

export function Trophy() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [selectedSlotNum, setSelectedSlotNum] = useState<number | null>(null)
	const [lockedFilter, setLockedFilter] = useState<boolean | null>(null)

	const { trophy: pendingTrophy, setTrophy } = useUserboxPending()
	const { data: currentTrophies = [] } = useCurrentTrophies()
	const { data: searchResults } = useSearchTrophies({ locked: lockedFilter })
	const { data: allItemsData } = useSearchTrophies({ locked: null })
	const { mutate: equipTrophy } = useEquipTrophy()
	const { mutate: unlockTrophy } = useUnlockTrophy()

	const items = useMemo(() => searchResults?.items ?? [], [searchResults])
	const allItems = useMemo(() => allItemsData?.items ?? [], [allItemsData])
	const hasPendingChanges = Object.keys(pendingTrophy).length > 0

	const displayTrophies = useMemo(() => {
		const result: Record<string, TrophyItem | undefined> = {
			trophyId1: currentTrophies.find(t => t.slot === "main"),
			trophyId2: currentTrophies.find(t => t.slot === "sub1"),
			trophyId3: currentTrophies.find(t => t.slot === "sub2")
		}

		Object.entries(pendingTrophy).forEach(([slot, id]) => {
			const item = items.find(item => item.trophyId === id) || allItems.find(item => item.trophyId === id)
			if (item) {
				result[`trophyId${REVERSE_SLOT_MAP[slot as TrophySlot]}`] = item
			}
		})
		return result
	}, [currentTrophies, pendingTrophy, items, allItems])

	const handleOpenDialog = (slotNum: number) => {
		setSelectedSlotNum(slotNum)
		setIsDialogOpen(true)
	}

	const handleSelect = (id: number) => {
		if (selectedSlotNum !== null) {
			const slotKey = SLOT_MAP[selectedSlotNum]
			setTrophy(prev => ({
				...prev,
				[slotKey]: id
			}))
			setIsDialogOpen(false)
		}
	}

	const handleSave = () => {
		if (!hasPendingChanges) {
			toast.error("No changes to save")
			return
		}

		const savePromises = Object.entries(pendingTrophy).map(([slot, id]) => {
			return new Promise<void>((resolve, reject) => {
				equipTrophy(
					{ trophyId: id as number, slot: slot as TrophySlot },
					{
						onSuccess: () => resolve(),
						onError: () => reject()
					}
				)
			})
		})

		Promise.all(savePromises)
			.then(() => {
				toast.success("Trophies equipped successfully!")
				setTrophy({})
			})
			.catch(() => toast.error("Failed to equip some trophies"))
	}

	const handleUnlock = (id: number) => {
		unlockTrophy(id, {
			onSuccess: () => toast.success("Trophy unlocked successfully!"),
			onError: () => toast.error("Failed to unlock trophy")
		})
	}

	return (
		<div className="flex flex-col gap-8">
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
				{[1, 2, 3].map(slotNum => {
					const trophy = displayTrophies[`trophyId${slotNum}`]
					const label = SLOT_LABELS[slotNum]
					const imageUrl = trophy?.imagePath ? `${CDN}/chunithm/honorBackgrounds/${trophy.imagePath}` : null

					return (
						<div
							key={slotNum}
							className="group border-border relative flex cursor-pointer flex-col items-center gap-3 overflow-hidden rounded-xl border p-4 transition-all hover:border-primary/50"
							onClick={() => handleOpenDialog(slotNum)}
						>
							<div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
								+
							</div>
							<div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
								{label}
							</div>
							<div className="relative aspect-[4/1] w-full overflow-hidden rounded-lg">
								{imageUrl ? (
									<img
										src={imageUrl}
										alt={label}
										className="h-full w-full object-contain"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center border-2 border-dashed border-muted bg-muted/5 opacity-50">
										<span className="text-xs">Empty</span>
									</div>
								)}
							</div>
							<div className="mt-8 w-full truncate pb-2 text-center text-xs font-semibold">
								{trophy?.label || "None"}
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
					disabled={!hasPendingChanges}
					className="px-8"
				>
					Save Trophy Layout
				</Button>
			</div>

			<ItemSelectionDialog
				title={`Select Trophy for Slot ${selectedSlotNum}`}
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				items={items.map(item => ({
					id: item.trophyId,
					name: item.label,
					imageUrl: `${CDN}/chunithm/honorBackgrounds/${item.imagePath}`,
					locked: item.locked
				}))}
				currentItemId={selectedSlotNum ? displayTrophies[`trophyId${selectedSlotNum}`]?.trophyId : undefined}
				onSelect={handleSelect}
				onUnlock={handleUnlock}
				imageClassName="w-full h-12 object-contain"
				headerControls={
					<Tabs
						value={lockedFilter === null ? "all" : lockedFilter ? "locked" : "unlocked"}
						onValueChange={v => setLockedFilter(v === "all" ? null : v === "locked" ? true : false)}
					>
						<TabsList>
							<TabsTrigger value="all">All</TabsTrigger>
							<TabsTrigger value="unlocked">Unlocked</TabsTrigger>
							<TabsTrigger value="locked">Locked</TabsTrigger>
						</TabsList>
					</Tabs>
				}
			/>
		</div>
	)
}
