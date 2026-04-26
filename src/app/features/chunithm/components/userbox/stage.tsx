import { useMemo, useState } from "react"

import { toast } from "sonner"

import { useUserboxPending } from "@/app/features/chunithm/components/userbox/userbox-pending-context"
import { useCurrentStage, useEquipStage, useSearchStages, useUnlockStage } from "@/app/features/chunithm/hooks/userbox/stage"
import { Button } from "@/app/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/shared/components/ui/select"
import { ItemSelectionDialog } from "@/app/shared/components/userbox/item-selection-dialog"
import { CDN } from "@/app/shared/utils/constants"

export function Stage() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [lockedFilter, setLockedFilter] = useState<boolean | null>(null)
	const { stage: pendingStage, setStage } = useUserboxPending()
	const { data: currentStage } = useCurrentStage()
	const { data: searchResults } = useSearchStages({ locked: lockedFilter })
	const { mutate: equipStage } = useEquipStage()
	const { mutate: unlockStage } = useUnlockStage()

	const items = useMemo(() => searchResults?.items ?? [], [searchResults])
	const hasPendingSelection = pendingStage !== null

	const displayItem = useMemo(() => {
		if (pendingStage) {
			return items.find(item => item.stageId === pendingStage) || currentStage
		}
		return currentStage
	}, [pendingStage, items, currentStage])

	const handleSelect = (id: number) => {
		setStage(id)
		setIsDialogOpen(false)
	}

	const handleSave = () => {
		if (!pendingStage) {
			toast.error("No changes to save")
			return
		}

		equipStage(pendingStage, {
			onSuccess: () => {
				toast.success("Stage equipped successfully!")
				setStage(null)
			},
			onError: () => toast.error("Failed to equip stage")
		})
	}

	const handleEquip = (id: number) => {
		handleSelect(id)
	}

	const handleUnlock = (id: number) => {
		unlockStage(id, {
			onSuccess: () => {
				toast.success("Stage unlocked successfully!")
			},
			onError: () => toast.error("Failed to unlock stage")
		})
	}

	return (
		<div className="flex flex-col gap-8">
			<div className="flex justify-center">
				<div
					className="group border-border relative flex w-full max-w-lg cursor-pointer flex-col items-center gap-3 overflow-hidden rounded-xl border p-4 transition-all hover:border-primary/50"
					onClick={() => setIsDialogOpen(true)}
				>
					<div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
						+
					</div>
					<div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
						Current Stage
					</div>
					<div className="relative flex aspect-[16/9] w-full items-center justify-center">
						{displayItem?.imagePath ? (
							<img
								src={`${CDN}/chunithm/stage/${displayItem.imagePath}`}
								alt="Stage"
								className="h-full w-full object-contain"
							/>
						) : (
							<div className="aspect-[16/9] w-32 rounded bg-muted-foreground/20 opacity-20" />
						)}
					</div>
					<div className="mt-8 w-full truncate pb-2 text-center text-xs font-semibold">
						{displayItem?.label || "None"}
					</div>
				</div>
			</div>

			<div className="flex justify-end gap-3 border-t pt-6">
				<Button
					size="lg"
					variant="default"
					onClick={handleSave}
					disabled={!hasPendingSelection}
					className="px-8"
				>
					Save Changes
				</Button>
			</div>

			<ItemSelectionDialog
				title="Select Stage"
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				items={items.map(item => ({
					id: item.stageId,
					name: item.label,
					imageUrl: `${CDN}/chunithm/stage/${item.imagePath}`,
					locked: item.locked
				}))}
				currentItemId={displayItem?.stageId}
				onSelect={handleEquip}
				onUnlock={handleUnlock}
				imageClassName="w-full aspect-[16/9] h-auto object-contain"
				headerControls={
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
				}
			/>
		</div>
	)
}
