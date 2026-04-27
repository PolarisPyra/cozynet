import { useMemo, useState } from "react"

import { Mic } from "lucide-react"
import { toast } from "sonner"

import { useUserboxPending } from "@/app/features/chunithm/components/userbox/userbox-pending-context"
import {
	useCurrentSystemvoice,
	useEquipSystemvoice,
	useSearchSystemvoices,
	useUnlockSystemvoice
} from "@/app/features/chunithm/hooks/userbox/systemvoice"
import { Button } from "@/app/shared/components/ui/button"

import { Tabs, TabsList, TabsTrigger } from "@/app/shared/components/ui/tabs"
import { ItemSelectionDialog } from "@/app/shared/components/userbox/item-selection-dialog"
import { CDN } from "@/app/shared/utils/constants"

export function SystemVoice() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [lockedFilter, setLockedFilter] = useState<boolean | null>(null)
	const { systemVoice: pendingVoice, setSystemVoice } = useUserboxPending()
	const { data: currentVoice } = useCurrentSystemvoice()
	const { data: searchResults } = useSearchSystemvoices({ locked: lockedFilter })
	const { mutate: equipSystemVoice } = useEquipSystemvoice()
	const { mutate: unlockSystemVoice } = useUnlockSystemvoice()

	const items = useMemo(() => searchResults?.items ?? [], [searchResults])
	const hasPendingSelection = pendingVoice !== null

	const displayItem = useMemo(() => {
		if (pendingVoice) {
			return items.find(item => item.systemVoiceId === pendingVoice) || currentVoice
		}
		return currentVoice
	}, [pendingVoice, items, currentVoice])

	const handleSelect = (id: number) => {
		setSystemVoice(id)
		setIsDialogOpen(false)
	}

	const handleSave = () => {
		if (!pendingVoice) {
			toast.error("No changes to save")
			return
		}

		equipSystemVoice(pendingVoice, {
			onSuccess: () => {
				toast.success("System Voice equipped successfully!")
				setSystemVoice(null)
			},
			onError: () => toast.error("Failed to equip system voice")
		})
	}

	const handleEquip = (id: number) => {
		handleSelect(id)
	}

	const handleUnlock = (id: number) => {
		unlockSystemVoice(id, {
			onSuccess: () => {
				toast.success("System Voice unlocked successfully!")
			},
			onError: () => toast.error("Failed to unlock system voice")
		})
	}

	return (
		<div className="flex flex-col gap-8">
			<div className="flex justify-center">
				<div
					className="group border-border relative flex w-full max-w-sm cursor-pointer flex-col items-center gap-3 overflow-hidden rounded-xl border p-4 transition-all hover:border-primary/50"
					onClick={() => setIsDialogOpen(true)}
				>
					<div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
						+
					</div>
					<div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
						Current System Voice
					</div>
					<div className="relative flex h-56 w-56 items-center justify-center">
						{displayItem?.imagePath ? (
							<img
								src={`${CDN}/chunithm/system_voice_thumbnails/${displayItem.imagePath}`}
								alt="System Voice"
								className="h-full w-full object-contain"
							/>
						) : (
							<Mic className="h-10 w-10 opacity-20" />
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
				imageClassName="h-28 w-28"
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
