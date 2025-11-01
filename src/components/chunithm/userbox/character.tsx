import { useCallback, useEffect, useMemo, useState } from "react"

import { toast } from "sonner"

import {
	UserboxContent,
	UserboxEquipUnlockButton,
	UserboxPageWrapper,
	UserboxPreviewEmpty,
	UserboxPreviewImage,
	UserboxPreviewWrapper,
	UserboxSearchBar,
	UserboxSearchCommandWrapper
} from "@/components/chunithm/userbox/userbox-layout"
import { UserboxSearchCommand } from "@/components/chunithm/userbox/userbox-search-command"
import {
	CharacterItem,
	useCurrentCharacter,
	useEquipCharacter,
	useSearchCharacters,
	useUnlockCharacter
} from "@/hooks/chunithm/userbox/character"
import { CDN } from "@/lib/constants"

import { Grid } from "./grid/grid"

export function CharacterCustomization() {
	const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null)
	const [originalCharacterId, setOriginalCharacterId] = useState<number | null>(null)
	const [searchTerm, setSearchTerm] = useState<string>("")

	const { data: currentCharacter, isLoading: currentLoading } = useCurrentCharacter()
	const { data: searchData, isLoading: searchLoading } = useSearchCharacters({ locked: null })
	const { mutate: equipCharacter } = useEquipCharacter()
	const { mutate: unlockCharacter } = useUnlockCharacter()

	useEffect(() => {
		if (currentCharacter) {
			setOriginalCharacterId(currentCharacter.characterId)
			setSelectedCharacterId(currentCharacter.characterId)
			return
		}
		setOriginalCharacterId(null)
		setSelectedCharacterId(null)
	}, [currentCharacter])

	const handleSelect = useCallback((item: CharacterItem) => {
		setSelectedCharacterId(item.characterId)
	}, [])

	const handleEquip = useCallback(
		(item: CharacterItem) => {
			equipCharacter(item.characterId, {
				onSuccess: () => {
					toast.success("Character equipped successfully")
				},
				onError: error => {
					toast.error("Failed to equip character")
					console.error("Error equipping character:", error)
				}
			})
		},
		[equipCharacter]
	)

	const handleUnlock = useCallback(
		(item: CharacterItem) => {
			unlockCharacter(item.characterId, {
				onSuccess: () => {
					toast.success("Character unlocked successfully")
				},
				onError: error => {
					toast.error("Failed to unlock character")
					console.error("Error unlocking character:", error)
				}
			})
		},
		[unlockCharacter]
	)

	const hasChanges = useMemo(
		() => selectedCharacterId !== originalCharacterId,
		[selectedCharacterId, originalCharacterId]
	)

	const equippedItemIds = useMemo(() => {
		if (!currentCharacter) return new Set<number>()
		return new Set([currentCharacter.characterId])
	}, [currentCharacter])

	const isLoading = currentLoading || searchLoading

	const filteredItems = useMemo(() => {
		if (!searchData?.items) return []
		if (!searchTerm) return searchData.items
		return searchData.items.filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
	}, [searchData?.items, searchTerm])

	const customPreview = useCallback(
		(item: CharacterItem | null) => {
			if (!item)
				return <UserboxPreviewEmpty title="Select a Character" description="Choose a character to preview and equip" />

			return (
				<UserboxPreviewWrapper>
					<UserboxPreviewImage
						src={`${CDN}/chunithm/characters/${item.imagePath || ""}`}
						alt={item.label}
						width={280}
						height={360}
					/>
					<UserboxEquipUnlockButton
						item={item}
						hasChanges={hasChanges}
						onEquip={() => handleEquip(item)}
						onUnlock={() => handleUnlock(item)}
					/>
				</UserboxPreviewWrapper>
			)
		},
		[hasChanges, handleEquip, handleUnlock]
	)

	return (
		<UserboxPageWrapper>
			<UserboxSearchBar>
				<UserboxSearchCommandWrapper>
					<UserboxSearchCommand
						items={searchData?.items || []}
						searchQuery={searchTerm}
						onSearchChange={setSearchTerm}
						onItemSelect={handleSelect}
						itemType="character"
					/>
				</UserboxSearchCommandWrapper>
			</UserboxSearchBar>

			<UserboxContent>
				<Grid
					items={filteredItems}
					equippedItemIds={equippedItemIds}
					selectedItemId={selectedCharacterId}
					loading={isLoading}
					imageBasePath="chunithm/characters"
					onItemClick={handleSelect}
					onEquip={handleEquip}
					onUnlock={handleUnlock}
					hasChanges={hasChanges}
					customPreview={customPreview}
				/>
			</UserboxContent>
		</UserboxPageWrapper>
	)
}
