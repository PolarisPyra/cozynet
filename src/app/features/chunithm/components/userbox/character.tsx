import { useState } from "react"

import { User } from "lucide-react"
import { toast } from "sonner"

import {
	useCurrentCharacter,
	useEquipCharacter,
	useSearchCharacters,
	useUnlockCharacter
} from "@/app/features/chunithm/hooks/userbox/character"
import { Button } from "@/app/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/shared/components/ui/select"
import { ItemSelectionDialog } from "@/app/shared/components/userbox/item-selection-dialog"
import { CDN } from "@/app/shared/utils/constants"

export function Character() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [imageError, setImageError] = useState(false)
	const [lockedFilter, setLockedFilter] = useState<boolean | null>(null)
	const { data: currentCharacter } = useCurrentCharacter()
	const { data: searchResults } = useSearchCharacters({ locked: lockedFilter })
	const { mutate: equipCharacter } = useEquipCharacter()
	const { mutate: unlockCharacter } = useUnlockCharacter()

	const items = searchResults?.items ?? []

	const handleEquip = (id: number) => {
		equipCharacter(id, {
			onSuccess: () => {
				toast.success("Character equipped successfully!")
				setImageError(false)
				setIsDialogOpen(false)
			},
			onError: () => toast.error("Failed to equip character")
		})
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
				<div className="bg-muted/50 border-border flex items-center justify-center border-b px-4 py-3">
					<span className="text-primary text-sm font-semibold">Character</span>
				</div>
				<div className="flex flex-1 flex-col p-4 text-center">
					<p className="mb-3 min-h-[20px] truncate text-sm font-medium">{currentCharacter?.label || "None"}</p>
					<div className="mb-auto flex flex-1 items-center justify-center">
						{currentCharacter?.imagePath && !imageError ? (
							<img
								src={`${CDN}/chunithm/characters/${currentCharacter.imagePath}`}
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
					<Button size="sm" variant="secondary" onClick={() => setIsDialogOpen(true)} className="mt-4 w-full">
						Change
					</Button>
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
				currentItemId={currentCharacter?.characterId}
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
