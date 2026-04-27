import { useMemo, useState } from "react"

import { MapPin } from "lucide-react"
import { toast } from "sonner"

import { useUserboxPending } from "@/app/features/chunithm/components/userbox/userbox-pending-context"
import {
	useCurrentMapicon,
	useEquipMapicon,
	useSearchMapicons,
	useUnlockMapicon
} from "@/app/features/chunithm/hooks/userbox/mapicon"
import { Button } from "@/app/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/shared/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/app/shared/components/ui/tabs"
import { ItemSelectionDialog } from "@/app/shared/components/userbox/item-selection-dialog"
import { CDN } from "@/app/shared/utils/constants"

export function MapIcon() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [lockedFilter, setLockedFilter] = useState<boolean | null>(null)
	const { mapIcon: pendingMapIcon, setMapIcon } = useUserboxPending()
	const { data: currentMapIcon } = useCurrentMapicon()
	const { data: searchResults } = useSearchMapicons({ locked: lockedFilter })
	const { mutate: equipMapIcon } = useEquipMapicon()
	const { mutate: unlockMapIcon } = useUnlockMapicon()

	const items = useMemo(() => searchResults?.items ?? [], [searchResults])
	const hasPendingSelection = pendingMapIcon !== null

	const displayItem = useMemo(() => {
		if (pendingMapIcon) {
			return items.find(item => item.mapiconId === pendingMapIcon) || currentMapIcon
		}
		return currentMapIcon
	}, [pendingMapIcon, items, currentMapIcon])

	const handleSelect = (id: number) => {
		setMapIcon(id)
		setIsDialogOpen(false)
	}

	const handleSave = () => {
		if (!pendingMapIcon) {
			toast.error("No changes to save")
			return
		}

		equipMapIcon(pendingMapIcon, {
			onSuccess: () => {
				toast.success("Map Icon equipped successfully!")
				setMapIcon(null)
			},
			onError: () => toast.error("Failed to equip map icon")
		})
	}

	const handleEquip = (id: number) => {
		handleSelect(id)
	}

	const handleUnlock = (id: number) => {
		unlockMapIcon(id, {
			onSuccess: () => {
				toast.success("Map Icon unlocked successfully!")
			},
			onError: () => toast.error("Failed to unlock map icon")
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
						Current Map Icon
					</div>
					<div className="relative flex h-48 w-48 items-center justify-center">
						{displayItem?.imagePath ? (
							<img
								src={`${CDN}/chunithm/map_icon/${displayItem.imagePath}`}
								alt="Map Icon"
								className="h-full w-full object-contain"
							/>
						) : (
							<MapPin className="h-10 w-10 opacity-20" />
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
				title="Select Map Icon"
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				items={items.map(item => ({
					id: item.mapiconId,
					name: item.label,
					imageUrl: `${CDN}/chunithm/map_icon/${item.imagePath}`,
					locked: item.locked
				}))}
				currentItemId={displayItem?.mapiconId}
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
