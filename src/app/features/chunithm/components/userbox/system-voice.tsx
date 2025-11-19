import { useState } from "react"

import { Volume2 } from "lucide-react"
import { toast } from "sonner"

import {
	useCurrentSystemvoice,
	useEquipSystemvoice,
	useSearchSystemvoices,
	useUnlockSystemvoice
} from "@/app/features/chunithm/hooks/userbox/systemvoice"
import { Button } from "@/app/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/shared/components/ui/select"
import { ItemSelectionDialog } from "@/app/shared/components/userbox/item-selection-dialog"
import { CDN } from "@/app/shared/utils/constants"

export function SystemVoice() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [lockedFilter, setLockedFilter] = useState<boolean | null>(null)
	const { data: currentSystemvoice } = useCurrentSystemvoice()
	const { data: searchResults } = useSearchSystemvoices({ locked: lockedFilter })
	const { mutate: equipSystemvoice } = useEquipSystemvoice()
	const { mutate: unlockSystemvoice } = useUnlockSystemvoice()

	const items = searchResults?.items ?? []

	const handleEquip = (id: number) => {
		equipSystemvoice(id, {
			onSuccess: () => {
				toast.success("System voice equipped successfully!")
				setIsDialogOpen(false)
			},
			onError: () => toast.error("Failed to equip system voice")
		})
	}

	const handleUnlock = (id: number) => {
		unlockSystemvoice(id, {
			onSuccess: () => {
				toast.success("System voice unlocked successfully!")
			},
			onError: () => toast.error("Failed to unlock system voice")
		})
	}

	return (
		<>
			<div className="bg-card border-border flex flex-col overflow-hidden rounded-sm border">
				<div className="bg-muted/50 border-border flex items-center justify-center border-b px-3 py-2">
					<span className="text-primary text-sm font-semibold">System Voice</span>
				</div>
				<div className="flex flex-1 flex-col p-2 text-center">
					<p className="mb-1 min-h-[20px] truncate text-sm font-medium">{currentSystemvoice?.label || "None"}</p>
					<div className="flex items-center justify-center mb-1">
						{currentSystemvoice?.imagePath ? (
							<img
								src={`${CDN}/chunithm/system_voice_thumbnails/${currentSystemvoice.imagePath}`}
								alt="System Voice"
								className="h-32 w-32 rounded-sm object-cover"
							/>
						) : (
							<div className="bg-muted flex h-32 w-32 items-center justify-center rounded-sm">
								<Volume2 className="h-10 w-10 opacity-30" />
							</div>
						)}
					</div>
					<Button size="sm" variant="secondary" onClick={() => setIsDialogOpen(true)} className="mt-auto w-full">
						Change
					</Button>
				</div>
			</div>

			<ItemSelectionDialog
				title="Select System Voice"
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				items={items.map(item => ({
					id: item.systemVoiceId,
					name: item.label,
					imageUrl: `${CDN}/chunithm/system_voice_thumbnails/${item.imagePath}`,
					locked: item.locked
				}))}
				currentItemId={currentSystemvoice?.systemVoiceId}
				onSelect={handleEquip}
				onUnlock={handleUnlock}
				imageClassName="h-20 w-20"
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
