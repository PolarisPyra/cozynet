import { useMemo, useState } from "react"

import { Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

import { useUserboxPending } from "@/app/features/chunithm/components/userbox/userbox-pending-context"
import {
	useCurrentNameplate,
	useEquipNameplate,
	useSearchNameplates,
	useUnlockNameplate
} from "@/app/features/chunithm/hooks/userbox/nameplate"
import { Button } from "@/app/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/shared/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/app/shared/components/ui/tabs"
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

	const items = useMemo(() => searchResults?.items ?? [], [searchResults])
	const hasPendingSelection = pendingNameplate !== null

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
		<div className="flex flex-col gap-8">
			<div className="flex justify-center">
				<div
					className="group border-border relative flex w-full max-w-md cursor-pointer flex-col items-center gap-3 overflow-hidden rounded-xl border p-4 transition-all hover:border-primary/50"
					onClick={() => setIsDialogOpen(true)}
				>
					<div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
						+
					</div>
					<div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
						Current Nameplate
					</div>
					<div className="relative flex aspect-[4/1] w-full items-center justify-center overflow-hidden rounded-lg">
						{displayItem?.imagePath ? (
							<img
								src={`${CDN}/chunithm/nameplate/${displayItem.imagePath}`}
								alt="Nameplate"
								className="h-full w-full object-contain"
							/>
						) : (
							<ImageIcon className="h-10 w-10 opacity-20" />
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
				imageClassName="w-full h-16 object-contain"
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
