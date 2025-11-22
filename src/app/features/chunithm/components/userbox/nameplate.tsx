import { useMemo, useState } from "react"

import { Image } from "lucide-react"
import { toast } from "sonner"

import {
	useCurrentNameplate,
	useEquipNameplate,
	useSearchNameplates,
	useUnlockNameplate
} from "@/app/features/chunithm/hooks/userbox/nameplate"
import { useUserboxPending } from "@/app/features/chunithm/components/userbox/userbox-pending-context"
import { Button } from "@/app/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/shared/components/ui/select"
import { ItemSelectionDialog } from "@/app/shared/components/userbox/item-selection-dialog"
import { CDN } from "@/app/shared/utils/constants"

export function Nameplate() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [lockedFilter, setLockedFilter] = useState<boolean | null>(null)
	const { nameplate: pendingNameplate, setNameplate } = useUserboxPending()
	const { data: currentNameplate } = useCurrentNameplate()
	const { data: searchResults } = useSearchNameplates({ locked: lockedFilter })
	const { mutate: equipNameplate } = useEquipNameplate()
	const { mutate: unlockNameplate } = useUnlockNameplate()

	const items = searchResults?.items ?? []
	const hasPendingSelection = pendingNameplate !== null

	// Get display item - prefer pending selection, then current
	const displayItem = useMemo(() => {
		if (pendingNameplate) {
			return items.find(item => item.nameplateId === pendingNameplate) || currentNameplate
		}
		return currentNameplate
	}, [pendingNameplate, items, currentNameplate])

	const handleSelect = (id: number) => {
		setNameplate(id)
		setIsDialogOpen(false)
	}

	const handleSave = () => {
		if (!pendingNameplate) {
			toast.error("No changes to save")
			return
		}

		equipNameplate(pendingNameplate, {
			onSuccess: () => {
				toast.success("Nameplate equipped successfully!")
				setNameplate(null)
			},
			onError: () => toast.error("Failed to equip nameplate")
		})
	}

	const handleEquip = (id: number) => {
		handleSelect(id)
	}

	const handleUnlock = (id: number) => {
		unlockNameplate(id, {
			onSuccess: () => {
				toast.success("Nameplate unlocked successfully!")
			},
			onError: () => toast.error("Failed to unlock nameplate")
		})
	}

	return (
		<>
			<div className="bg-card border-border flex flex-col overflow-hidden rounded-sm border">
				<div className="bg-muted/50 border-border flex items-center justify-center border-b px-3 py-2">
					<span className="text-primary text-sm font-semibold">Nameplate</span>
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
								src={`${CDN}/chunithm/nameplate/${displayItem.imagePath}`}
								alt="Nameplate"
								className="h-16 w-full max-w-[160px] rounded-sm object-cover"
							/>
						) : (
							<div className="bg-muted flex h-16 w-full max-w-[160px] items-center justify-center rounded-sm">
								<Image className="h-6 w-6 opacity-30" />
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
				title="Select Nameplate"
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				items={items.map(item => ({
					id: item.nameplateId,
					name: item.label,
					imageUrl: `${CDN}/chunithm/nameplate/${item.imagePath}`,
					locked: item.locked
				}))}
				currentItemId={displayItem?.nameplateId}
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
