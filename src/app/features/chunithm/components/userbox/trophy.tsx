import { useState } from "react"

import { Trophy as TrophyIcon } from "lucide-react"

import { useCurrentTrophies, useEquipTrophy, useSearchTrophies } from "@/app/features/chunithm/hooks/userbox/trophy"
import { ItemSelectionDialog } from "@/app/shared/components/userbox/item-selection-dialog"
import { Button } from "@/app/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/shared/components/ui/select"
import { TrophyRareType } from "@/app/shared/utils/enums"
import { CDN } from "@/app/shared/utils/constants"
import { toast } from "sonner"

const honorBackgrounds: Record<TrophyRareType, string> = {
	[TrophyRareType.Normal]: `honor_bg_normal.webp`,
	[TrophyRareType.Bronze]: `honor_bg_bronze.webp`,
	[TrophyRareType.Silver]: `honor_bg_silver.webp`,
	[TrophyRareType.Gold]: `honor_bg_gold.webp`,
	[TrophyRareType.Gold2]: `honor_bg_gold.webp`,
	[TrophyRareType.Platinum]: `honor_bg_platina.webp`,
	[TrophyRareType.Platinum2]: `honor_bg_platina.webp`,
	[TrophyRareType.Rainbow]: `honor_bg_rainbow.webp`,
	[TrophyRareType.Staff]: `honor_bg_staff.webp`,
	[TrophyRareType.Ongeki]: `honor_bg_ongeki.webp`,
	[TrophyRareType.Maimai]: `honor_bg_maimai.webp`,
	[TrophyRareType.Duals]: `honor_bg_platina.webp`,
	[TrophyRareType.Idori]: `honor_bg_platina.webp`,
	[TrophyRareType.Pheonix_g]: `honor_bg_phoenix_g.webp`,
	[TrophyRareType.Pheonix_p]: `honor_bg_phoenix_p.webp`,
	[TrophyRareType.Pheonix_r]: `honor_bg_phoenix_r.webp`,
	[TrophyRareType.Lamp]: ``,
	[TrophyRareType.Lamp2]: ``,
	[TrophyRareType.Lamp3]: ``,
	[TrophyRareType.Kop]: ``,
	[TrophyRareType.Kop2]: ``
}

const SLOT_LABELS = {
	main: "Main",
	sub1: "Sub 1",
	sub2: "Sub 2"
}

export function Trophy() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [selectedSlot, setSelectedSlot] = useState<"main" | "sub1" | "sub2">("main")
	const { data: currentTrophies } = useCurrentTrophies()
	const { data: searchResults } = useSearchTrophies({ locked: false, rareType: null })
	const { mutate: equipTrophy } = useEquipTrophy()

	const items = searchResults?.items ?? []
	const currentTrophy = currentTrophies?.find(t => t.slot === selectedSlot)

	const handleEquip = (id: number) => {
		equipTrophy(
			{ trophyId: id, slot: selectedSlot },
			{
				onSuccess: () => {
					toast.success(`Trophy equipped to ${selectedSlot} slot!`)
					setIsDialogOpen(false)
				},
				onError: () => toast.error("Failed to equip trophy")
			}
		)
	}

	const getTrophyImageUrl = (trophy: typeof currentTrophy) => {
		if (!trophy) return null
		const backgroundImage = honorBackgrounds[trophy.trophyRareType]
		return backgroundImage && backgroundImage.trim() !== ""
			? `${CDN}/chunithm/honorBackgrounds/${backgroundImage}`
			: trophy.imagePath && trophy.imagePath.trim() !== ""
				? `${CDN}/chunithm/honorBackgrounds/${trophy.imagePath}`
				: null
	}

	const currentTrophyImageUrl = getTrophyImageUrl(currentTrophy)

	return (
		<>
			<div className="bg-card border-border flex flex-col overflow-hidden rounded-sm border">
				<div className="bg-muted/50 border-border flex items-center justify-center border-b px-4 py-3">
					<span className="text-primary text-sm font-semibold">{SLOT_LABELS[selectedSlot]}</span>
				</div>
				<div className="flex flex-1 flex-col p-4 text-center">
					<p className="mb-3 min-h-[20px] truncate text-sm font-medium">{currentTrophy?.label || "None"}</p>
					<div className="mb-4 flex flex-1 items-center justify-center">
						{currentTrophyImageUrl ? (
							<img src={currentTrophyImageUrl} alt="Trophy" className="h-16 w-full max-w-[128px] rounded-sm object-cover" />
						) : (
							<div className="bg-muted flex h-16 w-full max-w-[128px] items-center justify-center rounded-sm">
								<TrophyIcon className="h-6 w-6 opacity-30" />
							</div>
						)}
					</div>
					<Button size="sm" onClick={() => setIsDialogOpen(true)} className="w-full">
						Change
					</Button>
				</div>
			</div>

			<ItemSelectionDialog
				title="Select Trophy"
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				items={items.map(item => {
					const backgroundImage = honorBackgrounds[item.trophyRareType]
					const imageUrl =
						backgroundImage && backgroundImage.trim() !== ""
							? `${CDN}/chunithm/honorBackgrounds/${backgroundImage}`
							: item.imagePath && item.imagePath.trim() !== ""
								? `${CDN}/chunithm/honorBackgrounds/${item.imagePath}`
								: ""
					return {
						id: item.trophyId,
						name: item.label,
						imageUrl,
						locked: item.locked
					}
				})}
				currentItemId={currentTrophy?.trophyId}
				onSelect={handleEquip}
				imageClassName="h-12 w-full"
				headerControls={
					<Select value={selectedSlot} onValueChange={v => setSelectedSlot(v as "main" | "sub1" | "sub2")}>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="main">Main</SelectItem>
							<SelectItem value="sub1">Sub 1</SelectItem>
							<SelectItem value="sub2">Sub 2</SelectItem>
						</SelectContent>
					</Select>
				}
			/>
		</>
	)
}
