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
	SystemvoiceItem,
	useCurrentSystemvoice,
	useEquipSystemvoice,
	useSearchSystemvoices,
	useUnlockSystemvoice
} from "@/hooks/chunithm/userbox/systemvoice"
import { CDN } from "@/lib/constants"

import { Grid } from "./grid/grid"
import { VoiceSampleDropdown } from "./voice-sample-dropdown"

export function SystemvoiceCustomization() {
	const [selectedSystemvoiceId, setSelectedSystemvoiceId] = useState<number | null>(null)
	const [originalSystemvoiceId, setOriginalSystemvoiceId] = useState<number | null>(null)
	const [searchTerm, setSearchTerm] = useState("")

	const { data: currentSystemvoice } = useCurrentSystemvoice()
	const { data: searchData, isLoading } = useSearchSystemvoices({ locked: null })
	const { mutate: equipSystemvoice } = useEquipSystemvoice()
	const { mutate: unlockSystemvoice } = useUnlockSystemvoice()

	useEffect(() => {
		if (!currentSystemvoice || originalSystemvoiceId !== null) return
		setOriginalSystemvoiceId(currentSystemvoice.systemVoiceId)
		setSelectedSystemvoiceId(currentSystemvoice.systemVoiceId)
	}, [currentSystemvoice, originalSystemvoiceId])

	const handleSelect = useCallback((item: SystemvoiceItem) => {
		setSelectedSystemvoiceId(item.systemVoiceId)
	}, [])

	const handleEquip = useCallback(
		(item: SystemvoiceItem) => {
			equipSystemvoice(item.systemVoiceId, {
				onSuccess: () => {
					setOriginalSystemvoiceId(item.systemVoiceId)
				},
				onError: error => {
					toast.error("Failed to equip systemvoice")
					console.error("Error equipping systemvoice:", error)
				}
			})
		},
		[equipSystemvoice]
	)

	const handleUnlock = useCallback(
		(item: SystemvoiceItem) => {
			unlockSystemvoice(item.systemVoiceId, {
				onError: error => {
					toast.error("Failed to unlock systemvoice")
					console.error("Error unlocking systemvoice:", error)
				}
			})
		},
		[unlockSystemvoice]
	)

	const hasChanges = useMemo(
		() => selectedSystemvoiceId !== originalSystemvoiceId,
		[selectedSystemvoiceId, originalSystemvoiceId]
	)

	const equippedItemIds = originalSystemvoiceId ? new Set([originalSystemvoiceId]) : new Set<number>()

	const filteredItems = useMemo(() => {
		if (!searchData?.items) return []
		if (!searchTerm) return searchData.items
		return searchData.items.filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
	}, [searchData?.items, searchTerm])

	const customPreview = useCallback(
		(item: SystemvoiceItem | null) => {
			if (!item)
				return (
					<UserboxPreviewEmpty title="Select a System Voice" description="Choose a system voice to preview and equip" />
				)

			return (
				<UserboxPreviewWrapper>
					<UserboxPreviewImage
						src={`${CDN}/chunithm/system_voice_thumbnails/${item.imagePath || ""}`}
						alt={item.label}
						width={360}
						height={135}
					/>
					<VoiceSampleDropdown systemVoiceId={item.systemVoiceId} />
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
						itemType="systemvoice"
					/>
				</UserboxSearchCommandWrapper>
			</UserboxSearchBar>

			<UserboxContent>
				<Grid
					items={filteredItems}
					equippedItemIds={equippedItemIds}
					selectedItemId={selectedSystemvoiceId}
					loading={isLoading}
					imageBasePath="chunithm/system_voice_thumbnails"
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
