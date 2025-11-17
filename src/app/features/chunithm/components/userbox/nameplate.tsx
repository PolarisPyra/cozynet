import { useCallback, useEffect, useMemo, useState } from "react"

import { toast } from "sonner"

import {
	UserboxContent,
	UserboxPageWrapper,
	UserboxPreviewEmpty,
	UserboxPreviewWrapper,
	UserboxSearchBar,
	UserboxSearchCommandWrapper
} from "@/app/features/chunithm/components/userbox/userbox-layout"
import { UserboxSearchCommand } from "@/app/features/chunithm/components/userbox/userbox-search-command"
import { Button } from "@/app/shared/components/ui/button"
import {
	NameplateItem,
	useCurrentNameplate,
	useEquipNameplate,
	useSearchNameplates,
	useUnlockNameplate
} from "@/app/features/chunithm/hooks/userbox/nameplate"
import { CDN } from "@/app/shared/utils/constants"

import { Grid } from "./grid/grid"

export function NameplateCustomization() {
	const [selectedNameplateId, setSelectedNameplateId] = useState<number | null>(null)
	const [originalNameplateId, setOriginalNameplateId] = useState<number | null>(null)
	const [searchTerm, setSearchTerm] = useState("")

	const { data: currentNameplate, isLoading: currentLoading } = useCurrentNameplate()
	const { data: searchData, isLoading: searchLoading } = useSearchNameplates({ locked: null })
	const { mutate: equipNameplate } = useEquipNameplate()
	const { mutate: unlockNameplate } = useUnlockNameplate()

	useEffect(() => {
		if (!currentNameplate) {
			setOriginalNameplateId(null)
			setSelectedNameplateId(null)
			return
		}
		setOriginalNameplateId(currentNameplate.nameplateId)
		setSelectedNameplateId(currentNameplate.nameplateId)
	}, [currentNameplate])

	const handleSelect = useCallback((item: NameplateItem) => {
		setSelectedNameplateId(item.nameplateId)
	}, [])

	const handleEquip = useCallback(
		(item: NameplateItem) => {
			equipNameplate(item.nameplateId, {
				onSuccess: () => {
					toast.success("Nameplate equipped successfully")
				},
				onError: error => {
					toast.error("Failed to equip nameplate")
					console.error("Error equipping nameplate:", error)
				}
			})
		},
		[equipNameplate]
	)

	const handleUnlock = useCallback(
		(item: NameplateItem) => {
			unlockNameplate(item.nameplateId, {
				onSuccess: () => {
					toast.success("Nameplate unlocked successfully")
				},
				onError: error => {
					toast.error("Failed to unlock nameplate")
					console.error("Error unlocking nameplate:", error)
				}
			})
		},
		[unlockNameplate]
	)

	const hasChanges = useMemo(
		() => selectedNameplateId !== originalNameplateId,
		[selectedNameplateId, originalNameplateId]
	)

	const equippedItemIds = useMemo(() => {
		if (searchData?.items) {
			const equippedFromSearch = searchData.items.filter(item => item.equipped).map(item => item.nameplateId)
			if (equippedFromSearch.length > 0) return new Set(equippedFromSearch)
		}
		if (currentNameplate) return new Set([currentNameplate.nameplateId])
		return new Set<number>()
	}, [currentNameplate, searchData?.items])

	const isLoading = currentLoading || searchLoading

	const filteredItems = useMemo(() => {
		if (!searchData?.items) return []
		if (!searchTerm) return searchData.items
		return searchData.items.filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
	}, [searchData?.items, searchTerm])

	const customPreview = useCallback(
		(selectedItem: NameplateItem | null) => {
			if (!selectedItem)
				return <UserboxPreviewEmpty title="Select a Nameplate" description="Choose a nameplate to preview and equip" />

			const handleAction = () => {
				if (selectedItem.locked) {
					handleUnlock(selectedItem)
					return
				}
				handleEquip(selectedItem)
			}

			return (
				<UserboxPreviewWrapper>
					<div className="flex flex-col items-center justify-center gap-4 p-4 sm:p-6">
						{selectedItem.imagePath && (
							<img
								src={`${CDN}/chunithm/nameplate/${selectedItem.imagePath}`}
								alt={selectedItem.label}
								className="mx-auto h-auto max-w-full rounded-sm"
								style={{
									width: "min(320px, 80vw)",
									height: "auto",
									objectFit: "contain"
								}}
							/>
						)}
						<Button onClick={handleAction} disabled={!hasChanges} variant="custom" className="w-full rounded-sm sm:w-auto">
							{selectedItem.locked ? "Unlock" : "Equip"}
						</Button>
					</div>
				</UserboxPreviewWrapper>
			)
		},
		[handleEquip, handleUnlock, hasChanges]
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
						itemType="nameplate"
					/>
				</UserboxSearchCommandWrapper>
			</UserboxSearchBar>

			<UserboxContent>
				<Grid
					items={filteredItems}
					equippedItemIds={equippedItemIds}
					selectedItemId={selectedNameplateId}
					loading={isLoading}
					imageBasePath="chunithm/nameplate"
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
