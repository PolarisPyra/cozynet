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
	StageItem,
	useCurrentStage,
	useEquipStage,
	useSearchStages,
	useUnlockStage
} from "@/hooks/chunithm/userbox/stage"
import { CDN } from "@/lib/constants"

import { Grid } from "./grid/grid"

export function StageCustomization() {
	const [selectedStageId, setSelectedStageId] = useState<number | null>(null)
	const [originalStageId, setOriginalStageId] = useState<number | null>(null)
	const [searchTerm, setSearchTerm] = useState("")

	const { data: currentStage, isLoading: currentLoading } = useCurrentStage()
	const { data: searchData, isLoading: searchLoading } = useSearchStages({ locked: null })
	const { mutate: equipStage } = useEquipStage()
	const { mutate: unlockStage } = useUnlockStage()

	useEffect(() => {
		if (!currentStage) {
			setOriginalStageId(null)
			setSelectedStageId(null)
			return
		}
		setOriginalStageId(currentStage.stageId)
		setSelectedStageId(currentStage.stageId)
	}, [currentStage])

	const handleSelect = useCallback((item: StageItem) => {
		setSelectedStageId(item.stageId)
	}, [])

	const handleEquip = useCallback(
		(item: StageItem) => {
			equipStage(item.stageId, {
				onSuccess: () => {
					toast.success("Stage equipped successfully")
				},
				onError: error => {
					toast.error("Failed to equip stage")
					console.error("Error equipping stage:", error)
				}
			})
		},
		[equipStage]
	)

	const handleUnlock = useCallback(
		(item: StageItem) => {
			unlockStage(item.stageId, {
				onSuccess: () => {
					toast.success("Stage unlocked successfully")
				},
				onError: error => {
					toast.error("Failed to unlock stage")
					console.error("Error unlocking stage:", error)
				}
			})
		},
		[unlockStage]
	)

	const hasChanges = useMemo(() => selectedStageId !== originalStageId, [selectedStageId, originalStageId])

	const equippedItemIds = useMemo(() => {
		if (!currentStage) return new Set<number>()
		return new Set([currentStage.stageId])
	}, [currentStage])

	const isLoading = currentLoading || searchLoading

	const filteredItems = useMemo(() => {
		if (!searchData?.items) return []
		if (!searchTerm) return searchData.items
		return searchData.items.filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
	}, [searchData?.items, searchTerm])

	const customPreview = useCallback(
		(item: StageItem | null) => {
			if (!item) return <UserboxPreviewEmpty title="Select a Stage" description="Choose a stage to preview and equip" />

			return (
				<UserboxPreviewWrapper>
					<UserboxPreviewImage
						src={`${CDN}/chunithm/stage/${item.imagePath || ""}`}
						alt={item.label}
						width={240}
						height={180}
					/>
					<UserboxEquipUnlockButton item={item} hasChanges={hasChanges} onEquip={() => handleEquip(item)} onUnlock={() => handleUnlock(item)} />
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
						itemType="stage"
					/>
				</UserboxSearchCommandWrapper>
			</UserboxSearchBar>

			<UserboxContent>
				<Grid
					items={filteredItems}
					equippedItemIds={equippedItemIds}
					selectedItemId={selectedStageId}
					loading={isLoading}
					imageBasePath="chunithm/stage"
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
