import { useState } from "react"

import { Trophy as TrophyIcon } from "lucide-react"
import { toast } from "sonner"

import { useCurrentTrophies, useEquipTrophy, useSearchTrophies } from "@/app/features/chunithm/hooks/userbox/trophy"
import { Button } from "@/app/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/shared/components/ui/select"
import { ItemSelectionDialog } from "@/app/shared/components/userbox/item-selection-dialog"
import { CDN } from "@/app/shared/utils/constants"
import { TrophyRareType } from "@/app/shared/utils/enums"

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

export function Trophy() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [selectedSlot, setSelectedSlot] = useState<"main" | "sub1" | "sub2">("main")
	const [rareTypeFilter, setRareTypeFilter] = useState<number | null>(null)
	const [lockedFilter, setLockedFilter] = useState<boolean | null>(null)
	const { data: currentTrophies } = useCurrentTrophies()
	const { data: searchResults } = useSearchTrophies({ locked: lockedFilter, rareType: rareTypeFilter })
	const { mutate: equipTrophy } = useEquipTrophy()

	const items = searchResults?.items ?? []

	const mainTrophy = currentTrophies?.find(t => t.slot === "main")
	const sub1Trophy = currentTrophies?.find(t => t.slot === "sub1")
	const sub2Trophy = currentTrophies?.find(t => t.slot === "sub2")

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

	const getTrophyImageUrl = (trophy: typeof mainTrophy) => {
		if (!trophy) return null
		const backgroundImage = honorBackgrounds[trophy.trophyRareType]
		return backgroundImage && backgroundImage.trim() !== ""
			? `${CDN}/chunithm/honorBackgrounds/${backgroundImage}`
			: trophy.imagePath && trophy.imagePath.trim() !== ""
				? `${CDN}/chunithm/honorBackgrounds/${trophy.imagePath}`
				: null
	}

	return (
		<>
			<div className="bg-card border-border flex flex-col overflow-hidden rounded-sm border">
				<div className="bg-muted/50 border-border flex items-center justify-center border-b px-4 py-3">
					<span className="text-primary text-sm font-semibold">Trophy</span>
				</div>
				<div className="flex flex-1 flex-col p-4">
					<div className="mb-auto flex flex-col gap-3">
						{[
							{ trophy: mainTrophy, label: "Main" },
							{ trophy: sub1Trophy, label: "Sub 1" },
							{ trophy: sub2Trophy, label: "Sub 2" }
						].map(({ trophy, label }, idx) => {
							const imageUrl = getTrophyImageUrl(trophy)
							// Don't show text overlay if trophy has a custom image (like KOP)
							const backgroundImage = trophy ? honorBackgrounds[trophy.trophyRareType] : null
							const hasCustomImage = trophy && trophy.imagePath && (!backgroundImage || backgroundImage.trim() === "")
							return (
								<div key={idx} className="flex flex-col gap-1">
									<div className="text-muted-foreground text-xs">{label}</div>
									<div className="relative">
										{imageUrl ? (
											<>
												<img src={imageUrl} alt={label} className="h-12 w-full rounded-sm object-cover" />
												{trophy?.label && !hasCustomImage && (
													<div className="absolute inset-0 flex items-center justify-center px-2">
														<span className="w-full truncate text-center text-xs font-bold text-black drop-shadow-md">
															{trophy.label}
														</span>
													</div>
												)}
											</>
										) : (
											<div className="bg-muted flex h-12 w-full items-center justify-center rounded-sm">
												<TrophyIcon className="h-5 w-5 opacity-30" />
											</div>
										)}
									</div>
								</div>
							)
						})}
					</div>

					<Button size="sm" variant="secondary" onClick={() => setIsDialogOpen(true)} className="mt-4 w-full">
						Change
					</Button>
				</div>
			</div>

			<ItemSelectionDialog
				title="Select Trophy"
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				items={items.map(item => {
					const backgroundImage = honorBackgrounds[item.trophyRareType as TrophyRareType]
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
				currentItemId={currentTrophies?.find(t => t.slot === selectedSlot)?.trophyId}
				onSelect={handleEquip}
				imageClassName="h-12 w-full"
				headerControls={
					<div className="flex flex-col gap-3">
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
						<div className="flex gap-2">
							<div className="flex-1">
								<Select
									value={rareTypeFilter === null ? "all" : rareTypeFilter.toString()}
									onValueChange={v => setRareTypeFilter(v === "all" ? null : parseInt(v))}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Rare Type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Types</SelectItem>
										<SelectItem value="0">Normal</SelectItem>
										<SelectItem value="1">Bronze</SelectItem>
										<SelectItem value="2">Silver</SelectItem>
										<SelectItem value="3">Gold</SelectItem>
										<SelectItem value="5">Platinum</SelectItem>
										<SelectItem value="7">Rainbow</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="flex-1">
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
							</div>
						</div>
					</div>
				}
			/>
		</>
	)
}
