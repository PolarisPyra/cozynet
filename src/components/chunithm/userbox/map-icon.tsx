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
	MapiconItem,
	useCurrentMapicon,
	useEquipMapicon,
	useSearchMapicons,
	useUnlockMapicon
} from "@/hooks/chunithm/userbox/mapicon"
import { CDN } from "@/lib/constants"

import { Grid } from "./grid/grid"

export function MapiconCustomization() {
	const [selectedMapiconId, setSelectedMapiconId] = useState<number | null>(null)
	const [originalMapiconId, setOriginalMapiconId] = useState<number | null>(null)
	const [searchTerm, setSearchTerm] = useState<string>("")

	const { data: currentMapicon } = useCurrentMapicon()
	const { data: searchData, isLoading } = useSearchMapicons({ locked: null })
	const { mutate: equipMapicon } = useEquipMapicon()
	const { mutate: unlockMapicon } = useUnlockMapicon()

	useEffect(() => {
		if (currentMapicon) {
			setOriginalMapiconId(currentMapicon.mapiconId)
			setSelectedMapiconId(currentMapicon.mapiconId)
			return
		}
		setOriginalMapiconId(null)
		setSelectedMapiconId(null)
	}, [currentMapicon])

	const handleSelect = useCallback((item: MapiconItem) => {
		setSelectedMapiconId(item.mapiconId)
	}, [])

	const handleEquip = useCallback(
		(item: MapiconItem) => {
			equipMapicon(item.mapiconId, {
				onSuccess: () => {
					setOriginalMapiconId(item.mapiconId)
				},
				onError: error => {
					toast.error("Failed to equip mapicon")
					console.error("Error equipping mapicon:", error)
				}
			})
		},
		[equipMapicon]
	)

	const handleUnlock = useCallback(
		(item: MapiconItem) => {
			unlockMapicon(item.mapiconId, {
				onError: error => {
					toast.error("Failed to unlock mapicon")
					console.error("Error unlocking mapicon:", error)
				}
			})
		},
		[unlockMapicon]
	)

	const hasChanges = useMemo(() => selectedMapiconId !== originalMapiconId, [selectedMapiconId, originalMapiconId])

	const equippedItemIds = useMemo(() => {
		if (!currentMapicon) return new Set<number>()
		return new Set([currentMapicon.mapiconId])
	}, [currentMapicon])

	const filteredItems = useMemo(() => {
		if (!searchData?.items) return []
		if (!searchTerm) return searchData.items
		return searchData.items.filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
	}, [searchData?.items, searchTerm])

	const customPreview = useCallback(
		(item: MapiconItem | null) => {
			if (!item)
				return <UserboxPreviewEmpty title="Select a Map Icon" description="Choose a map icon to preview and equip" />

			return (
				<UserboxPreviewWrapper>
					<UserboxPreviewImage
						src={`${CDN}/chunithm/map_icon/${item.imagePath || ""}`}
						alt={item.label}
						width={240}
						height={240}
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
						itemType="mapicon"
					/>
				</UserboxSearchCommandWrapper>
			</UserboxSearchBar>

			<UserboxContent>
				<Grid
					items={filteredItems}
					equippedItemIds={equippedItemIds}
					selectedItemId={selectedMapiconId}
					loading={isLoading}
					imageBasePath="chunithm/map_icon"
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
