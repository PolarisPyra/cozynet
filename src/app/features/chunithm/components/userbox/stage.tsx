import { useState } from "react"

import { Image } from "lucide-react"
import { toast } from "sonner"

import {
	useCurrentStage,
	useEquipStage,
	useSearchStages,
	useUnlockStage
} from "@/app/features/chunithm/hooks/userbox/stage"
import { Button } from "@/app/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/shared/components/ui/select"
import { ItemSelectionDialog } from "@/app/shared/components/userbox/item-selection-dialog"
import { CDN } from "@/app/shared/utils/constants"

export function Stage() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [lockedFilter, setLockedFilter] = useState<boolean | null>(null)
	const { data: currentStage } = useCurrentStage()
	const { data: searchResults } = useSearchStages({ locked: lockedFilter })
	const { mutate: equipStage } = useEquipStage()
	const { mutate: unlockStage } = useUnlockStage()

	const items = searchResults?.items ?? []

	const handleEquip = (id: number) => {
		equipStage(id, {
			onSuccess: () => {
				toast.success("Stage equipped successfully!")
				setIsDialogOpen(false)
			},
			onError: () => toast.error("Failed to equip stage")
		})
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
				<div className="bg-muted/50 border-border flex items-center justify-center border-b px-4 py-3">
					<span className="text-primary text-sm font-semibold">Stage</span>
				</div>
				<div className="flex flex-1 flex-col p-4 text-center">
					<p className="mb-3 min-h-[20px] truncate text-sm font-medium">{currentStage?.label || "None"}</p>
					<div className="mb-auto flex flex-1 items-center justify-center">
						{currentStage?.imagePath ? (
							<img
								src={`${CDN}/chunithm/stage/${currentStage.imagePath}`}
								alt="Stage"
								className="h-24 w-full max-w-[200px] rounded-sm object-cover"
							/>
						) : (
							<div className="bg-muted flex h-24 w-full max-w-[200px] items-center justify-center rounded-sm">
								<Image className="h-8 w-8 opacity-30" />
							</div>
						)}
					</div>
					<Button size="sm" variant="secondary" onClick={() => setIsDialogOpen(true)} className="mt-4 w-full">
						Change
					</Button>
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
				currentItemId={currentStage?.stageId}
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
