import { useState } from "react"

import { MapPin } from "lucide-react"
import { toast } from "sonner"

import {
	useCurrentMapicon,
	useEquipMapicon,
	useSearchMapicons,
	useUnlockMapicon
} from "@/app/features/chunithm/hooks/userbox/mapicon"
import { Button } from "@/app/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/shared/components/ui/select"
import { ItemSelectionDialog } from "@/app/shared/components/userbox/item-selection-dialog"
import { CDN } from "@/app/shared/utils/constants"

export function MapIcon() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [lockedFilter, setLockedFilter] = useState<boolean | null>(null)
	const { data: currentMapicon } = useCurrentMapicon()
	const { data: searchResults } = useSearchMapicons({ locked: lockedFilter })
	const { mutate: equipMapicon } = useEquipMapicon()
	const { mutate: unlockMapicon } = useUnlockMapicon()

	const items = searchResults?.items ?? []

	const handleEquip = (id: number) => {
		equipMapicon(id, {
			onSuccess: () => {
				toast.success("Map icon equipped successfully!")
				setIsDialogOpen(false)
			},
			onError: () => toast.error("Failed to equip map icon")
		})
	}

	const handleUnlock = (id: number) => {
		unlockMapicon(id, {
			onSuccess: () => {
				toast.success("Map icon unlocked successfully!")
			},
			onError: () => toast.error("Failed to unlock map icon")
		})
	}

	return (
		<>
			<div className="bg-card border-border flex flex-col overflow-hidden rounded-sm border">
				<div className="bg-muted/50 border-border flex items-center justify-center border-b px-4 py-3">
					<span className="text-primary text-sm font-semibold">Map Icon</span>
				</div>
				<div className="flex flex-1 flex-col p-4 text-center">
					<p className="mb-3 min-h-[20px] truncate text-sm font-medium">{currentMapicon?.label || "None"}</p>
					<div className="mb-auto flex flex-1 items-center justify-center">
						{currentMapicon?.imagePath ? (
							<img
								src={`${CDN}/chunithm/map_icon/${currentMapicon.imagePath}`}
								alt="Map Icon"
								className="h-32 w-32 rounded-sm object-cover"
							/>
						) : (
							<div className="bg-muted flex h-32 w-32 items-center justify-center rounded-sm">
								<MapPin className="h-10 w-10 opacity-30" />
							</div>
						)}
					</div>
					<Button size="sm" variant="secondary" onClick={() => setIsDialogOpen(true)} className="mt-4 w-full">
						Change
					</Button>
				</div>
			</div>

			<ItemSelectionDialog
				title="Select Map Icon"
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				items={items.map(item => ({
					id: item.mapiconId,
					name: item.label,
					imageUrl: `${CDN}/chunithm/map_icon/${item.imagePath}`,
					locked: item.locked
				}))}
				currentItemId={currentMapicon?.mapiconId}
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
