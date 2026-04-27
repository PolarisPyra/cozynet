import { useMemo, useState } from "react"

import { User } from "lucide-react"
import { toast } from "sonner"

import { useUserboxPending } from "@/app/features/chunithm/components/userbox/userbox-pending-context"
import {
	useCurrentCharacter,
	useEquipCharacter,
	useSearchCharacters,
	useUnlockCharacter
} from "@/app/features/chunithm/hooks/userbox/character"
import { Button } from "@/app/shared/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/app/shared/components/ui/tabs"
import { ItemSelectionDialog } from "@/app/shared/components/userbox/item-selection-dialog"
import { CDN } from "@/app/shared/utils/constants"

export function Character() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [lockedFilter, setLockedFilter] = useState<boolean | null>(null)
	const { character: pendingCharacter, setCharacter } = useUserboxPending()
	const { data: currentCharacter } = useCurrentCharacter()
	const { data: searchResults } = useSearchCharacters({ locked: lockedFilter })
	const { mutate: equipCharacter } = useEquipCharacter()
	const { mutate: unlockCharacter } = useUnlockCharacter()

	const items = useMemo(() => searchResults?.items ?? [], [searchResults])
	const hasPendingSelection = pendingCharacter !== null

	const displayItem = useMemo(() => {
		if (pendingCharacter) {
			return items.find(item => item.characterId === pendingCharacter) || currentCharacter
		}
		return currentCharacter
	}, [pendingCharacter, items, currentCharacter])

	const handleSelect = (id: number) => {
		setCharacter(id)
		setIsDialogOpen(false)
	}

	const handleSave = () => {
		if (!pendingCharacter) {
			toast.error("No changes to save")
			return
		}

		equipCharacter(pendingCharacter, {
			onSuccess: () => {
				toast.success("Character equipped successfully!")
				setCharacter(null)
			},
			onError: () => toast.error("Failed to equip character")
		})
	}

	const handleEquip = (id: number) => {
		handleSelect(id)
	}

	const handleUnlock = (id: number) => {
		unlockCharacter(id, {
			onSuccess: () => {
				toast.success("Character unlocked successfully!")
			},
			onError: () => toast.error("Failed to unlock character")
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
						Current Character
					</div>
					<div className="relative flex aspect-square w-full max-w-[256px] items-center justify-center overflow-hidden rounded-xl">
						{displayItem?.imagePath ? (
							<img
								src={`${CDN}/chunithm/characters/${displayItem.imagePath}`}
								alt="Character"
								className="h-full w-full object-contain p-2"
							/>
						) : (
							<User className="h-12 w-12 opacity-20" />
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
				title="Select Character"
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				items={items.map(item => ({
					id: item.characterId,
					name: item.label,
					imageUrl: `${CDN}/chunithm/characters/${item.imagePath}`,
					locked: item.locked
				}))}
				currentItemId={displayItem?.characterId}
				onSelect={handleEquip}
				onUnlock={handleUnlock}
				imageClassName="h-32 w-32"
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
