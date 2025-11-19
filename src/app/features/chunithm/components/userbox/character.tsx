import { useMemo, useState } from "react"

import { User } from "lucide-react"
import { toast } from "sonner"

import {
	useCurrentCharacter,
	useEquipCharacter,
	useSearchCharacters,
	useUnlockCharacter
} from "@/app/features/chunithm/hooks/userbox/character"
import { useUserboxPending } from "@/app/features/chunithm/components/userbox/userbox-pending-context"
import { Button } from "@/app/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/shared/components/ui/select"
import { ItemSelectionDialog } from "@/app/shared/components/userbox/item-selection-dialog"
import { CDN } from "@/app/shared/utils/constants"

export function Character() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [imageError, setImageError] = useState(false)
	const [lockedFilter, setLockedFilter] = useState<boolean | null>(null)
	const { character: pendingCharacter, setCharacter } = useUserboxPending()
	const { data: currentCharacter } = useCurrentCharacter()
	const { data: searchResults } = useSearchCharacters({ locked: lockedFilter })
	const { mutate: equipCharacter } = useEquipCharacter()
	const { mutate: unlockCharacter } = useUnlockCharacter()

	const items = searchResults?.items ?? []
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
		setImageError(false)
	}

	const handleSave = () => {
		if (!pendingCharacter) {
			toast.error("No changes to save")
			return
		}

		equipCharacter(pendingCharacter, {
			onSuccess: () => {
				toast.success("Character equipped successfully!")
				setImageError(false)
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
		<>
			<div className="bg-card border-border flex flex-col overflow-hidden rounded-sm border">
				<div className="bg-muted/50 border-border flex items-center justify-center border-b px-3 py-2">
					<span className="text-primary text-sm font-semibold">Character</span>
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
						{displayItem?.imagePath && !imageError ? (
							<img
								src={`${CDN}/chunithm/characters/${displayItem.imagePath}`}
								alt="Character"
								className="h-32 w-32 rounded-sm object-cover"
								onError={() => setImageError(true)}
							/>
						) : (
							<div className="bg-muted flex h-32 w-32 items-center justify-center rounded-sm">
								<User className="h-10 w-10 opacity-30" />
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
