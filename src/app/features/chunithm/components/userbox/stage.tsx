import { useMemo, useState } from "react"

import { Image } from "lucide-react"
import { toast } from "sonner"

import {
	useCurrentStage,
	useEquipStage,
	useSearchStages,
	useUnlockStage
} from "@/app/features/chunithm/hooks/userbox/stage"
import { useUserboxPending } from "@/app/features/chunithm/components/userbox/userbox-pending-context"
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

	const items = searchResults?.items ?? []
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
		<>
			<div className="bg-card border-border flex flex-col overflow-hidden rounded-sm border">
				<div className="bg-muted/50 border-border flex items-center justify-center border-b px-3 py-2">
					<span className="text-primary text-sm font-semibold">Stage</span>
				</div>
				<div className="flex flex-1 flex-col p-2 text-center">
					<div className="bg-muted/50 mb-1 overflow-hidden rounded-sm px-2 py-1">
						<div className="marquee-container">
							<span className="marquee-text text-primary text-xs whitespace-nowrap">
								{displayItem?.label || "None"}
							</span>
						</div>
					</div>
					<div className="mb-1 flex flex-1 items-center justify-center">
						{displayItem?.imagePath ? (
							<img
								src={`${CDN}/chunithm/stage/${displayItem.imagePath}`}
								alt="Stage"
								className="h-24 w-full max-w-[200px] rounded-sm object-cover"
							/>
						) : (
							<div className="bg-muted flex h-24 w-full max-w-[200px] items-center justify-center rounded-sm">
								<Image className="h-8 w-8 opacity-30" />
							</div>
						)}
					</div>
					<div className="mt-auto flex gap-2">
						<Button size="sm" variant="outline" onClick={() => setIsDialogOpen(true)} className="flex-1">
							Change
						</Button>
						<Button
							size="sm"
							variant="default"
							onClick={handleSave}
							disabled={!hasPendingSelection}
							className="flex-1"
						>
							Save
						</Button>
					</div>
				</div>
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
				imageClassName="h-16 w-full"
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
		</>
	)
}
