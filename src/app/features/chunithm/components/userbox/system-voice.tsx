import { useMemo, useState } from "react"

import { Volume2 } from "lucide-react"
import { toast } from "sonner"

import {
	useCurrentSystemvoice,
	useEquipSystemvoice,
	useSearchSystemvoices,
	useUnlockSystemvoice
} from "@/app/features/chunithm/hooks/userbox/systemvoice"
import { useUserboxPending } from "@/app/features/chunithm/components/userbox/userbox-pending-context"
import { Button } from "@/app/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/shared/components/ui/select"
import { ItemSelectionDialog } from "@/app/shared/components/userbox/item-selection-dialog"
import { CDN } from "@/app/shared/utils/constants"

export function SystemVoice() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [lockedFilter, setLockedFilter] = useState<boolean | null>(null)
	const { systemVoice: pendingSystemVoice, setSystemVoice } = useUserboxPending()
	const { data: currentSystemvoice } = useCurrentSystemvoice()
	const { data: searchResults } = useSearchSystemvoices({ locked: lockedFilter })
	const { mutate: equipSystemvoice } = useEquipSystemvoice()
	const { mutate: unlockSystemvoice } = useUnlockSystemvoice()

	const items = searchResults?.items ?? []
	const hasPendingSelection = pendingSystemVoice !== null

	const displayItem = useMemo(() => {
		if (pendingSystemVoice) {
			return items.find(item => item.systemVoiceId === pendingSystemVoice) || currentSystemvoice
		}
		return currentSystemvoice
	}, [pendingSystemVoice, items, currentSystemvoice])

	const handleSelect = (id: number) => {
		setSystemVoice(id)
		setIsDialogOpen(false)
	}

	const handleSave = () => {
		if (!pendingSystemVoice) {
			toast.error("No changes to save")
			return
		}

		equipSystemvoice(pendingSystemVoice, {
			onSuccess: () => {
				toast.success("System voice equipped successfully!")
				setSystemVoice(null)
			},
			onError: () => toast.error("Failed to equip system voice")
		})
	}

	const handleEquip = (id: number) => {
		handleSelect(id)
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
					<div className="bg-muted/50 overflow-hidden rounded-sm px-2 py-1 mb-1">
						<div className="marquee-container">
							<span className="marquee-text text-primary text-xs whitespace-nowrap">
								{displayItem?.label || "None"}
							</span>
						</div>
					</div>
					<div className="mb-1 flex flex-1 items-center justify-center">
						{displayItem?.imagePath ? (
							<img
								src={`${CDN}/chunithm/system_voice_thumbnails/${displayItem.imagePath}`}
								alt="System Voice"
								className="h-32 w-32 rounded-sm object-cover"
							/>
						) : (
							<div className="bg-muted flex h-32 w-32 items-center justify-center rounded-sm">
								<Volume2 className="h-10 w-10 opacity-30" />
							</div>
						)}
					</div>
					<div className="mt-auto flex gap-2">
						<Button size="sm" variant="custom" onClick={() => setIsDialogOpen(true)} className="flex-1">
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
				title="Select System Voice"
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				items={items.map(item => ({
					id: item.systemVoiceId,
					name: item.label,
					imageUrl: `${CDN}/chunithm/system_voice_thumbnails/${item.imagePath}`,
					locked: item.locked
				}))}
				currentItemId={displayItem?.systemVoiceId}
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
