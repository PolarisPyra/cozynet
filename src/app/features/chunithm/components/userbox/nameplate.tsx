import { useState } from "react"

import { Image } from "lucide-react"
import { toast } from "sonner"

import {
	useCurrentNameplate,
	useEquipNameplate,
	useSearchNameplates,
	useUnlockNameplate
} from "@/app/features/chunithm/hooks/userbox/nameplate"
import { Button } from "@/app/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/shared/components/ui/select"
import { ItemSelectionDialog } from "@/app/shared/components/userbox/item-selection-dialog"
import { CDN } from "@/app/shared/utils/constants"

export function Nameplate() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [lockedFilter, setLockedFilter] = useState<boolean | null>(null)
	const { data: currentNameplate } = useCurrentNameplate()
	const { data: searchResults } = useSearchNameplates({ locked: lockedFilter })
	const { mutate: equipNameplate } = useEquipNameplate()
	const { mutate: unlockNameplate } = useUnlockNameplate()

	const items = searchResults?.items ?? []

	const handleEquip = (id: number) => {
		equipNameplate(id, {
			onSuccess: () => {
				toast.success("Nameplate equipped successfully!")
				setIsDialogOpen(false)
			},
			onError: () => toast.error("Failed to equip nameplate")
		})
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
					<p className="mb-1 min-h-[20px] truncate text-sm font-medium">{currentNameplate?.label || "None"}</p>
					<div className="flex items-center justify-center mb-1">
						{currentNameplate?.imagePath ? (
							<img
								src={`${CDN}/chunithm/nameplate/${currentNameplate.imagePath}`}
								alt="Nameplate"
								className="h-16 w-full max-w-[160px] rounded-sm object-cover"
							/>
						) : (
							<div className="bg-muted flex h-16 w-full max-w-[160px] items-center justify-center rounded-sm">
								<Image className="h-6 w-6 opacity-30" />
							</div>
						)}
					</div>
					<Button size="sm" variant="secondary" onClick={() => setIsDialogOpen(true)} className="mt-auto w-full">
						Change
					</Button>
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
				currentItemId={currentNameplate?.nameplateId}
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
