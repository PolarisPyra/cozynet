import { useMemo, useState } from "react"

import { Trophy as TrophyIcon } from "lucide-react"
import { toast } from "sonner"

import { useUserboxPending } from "@/app/features/chunithm/components/userbox/userbox-pending-context"
import { useChunithmVersion } from "@/app/features/chunithm/hooks/use-version"
import {
	TrophyItem,
	useCurrentTrophies,
	useEquipTrophy,
	useSearchTrophies,
	useUnlockTrophy
} from "@/app/features/chunithm/hooks/userbox/trophy"
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
	[TrophyRareType.Ultima]: `honor_bg_ultima.webp`,
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
	const version = useChunithmVersion()
	const isVerseOrAbove = version >= 17
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [selectedSlot, setSelectedSlot] = useState<"main" | "sub1" | "sub2">("main")
	const [rareTypeFilter, setRareTypeFilter] = useState<number | null>(null)
	const [lockedFilter, setLockedFilter] = useState<boolean | null>(null)
	const { trophy: pendingTrophies, setTrophy } = useUserboxPending()
	const { data: currentTrophies } = useCurrentTrophies()
	const { data: searchResults } = useSearchTrophies({ locked: lockedFilter, rareType: rareTypeFilter })
	const { mutate: equipTrophy } = useEquipTrophy()
	const { mutate: unlockTrophy } = useUnlockTrophy()

	const items = searchResults?.items ?? []
	const hasPendingSelections = Object.keys(pendingTrophies).length > 0

	// Get display trophies - prefer pending selections, then current
	const displayTrophies = useMemo(() => {
		const mainTrophy = currentTrophies?.find(t => t.slot === "main")
		const sub1Trophy = currentTrophies?.find(t => t.slot === "sub1")
		const sub2Trophy = currentTrophies?.find(t => t.slot === "sub2")

		return {
			main: pendingTrophies.main
				? items.find(item => item.trophyId === pendingTrophies.main) || mainTrophy
				: mainTrophy,
			sub1: pendingTrophies.sub1
				? items.find(item => item.trophyId === pendingTrophies.sub1) || sub1Trophy
				: sub1Trophy,
			sub2: pendingTrophies.sub2 ? items.find(item => item.trophyId === pendingTrophies.sub2) || sub2Trophy : sub2Trophy
		}
	}, [pendingTrophies, items, currentTrophies])

	const handleSelect = (id: number) => {
		// Only allow main trophy if below VERSE version
		if (!isVerseOrAbove && selectedSlot !== "main") {
			toast.error("Sub trophies are only available in VERSE and above")
			return
		}
		setTrophy(prev => ({
			...prev,
			[selectedSlot]: id
		}))
		setIsDialogOpen(false)
	}

	const handleSave = () => {
		if (!hasPendingSelections) {
			toast.error("No changes to save")
			return
		}

		// Filter out sub trophies if below VERSE version
		const trophiesToSave = isVerseOrAbove
			? pendingTrophies
			: Object.fromEntries(Object.entries(pendingTrophies).filter(([slot]) => slot === "main"))

		// Submit all pending trophy changes
		const savePromises = Object.entries(trophiesToSave).map(([slot, id]) => {
			return new Promise<void>((resolve, reject) => {
				equipTrophy(
					{ trophyId: id, slot: slot as "main" | "sub1" | "sub2" },
					{
						onSuccess: () => {
							toast.success(`Trophy equipped to ${slot} slot!`)
							resolve()
						},
						onError: () => {
							toast.error(`Failed to equip trophy to ${slot} slot`)
							reject()
						}
					}
				)
			})
		})

		Promise.all(savePromises)
			.then(() => {
				setTrophy({})
			})
			.catch(() => {
				// Errors are already handled in individual callbacks
			})
	}

	const handleEquip = (id: number) => {
		handleSelect(id)
	}

	const handleUnlock = (id: number) => {
		unlockTrophy(id, {
			onSuccess: () => {
				toast.success("Trophy unlocked successfully!")
			},
			onError: () => toast.error("Failed to unlock trophy")
		})
	}

	const getTrophyImageUrl = (trophy: TrophyItem | undefined) => {
		if (!trophy) return null
		const backgroundImage = honorBackgrounds[trophy.trophyRareType as TrophyRareType]
		return backgroundImage && backgroundImage.trim() !== ""
			? `${CDN}/chunithm/honorBackgrounds/${backgroundImage}`
			: trophy.imagePath && trophy.imagePath.trim() !== ""
				? `${CDN}/chunithm/honorBackgrounds/${trophy.imagePath}`
				: null
	}

	return (
		<>
			<div className="bg-card border-border flex flex-col overflow-hidden rounded-sm border">
				<div className="bg-muted/50 border-border flex items-center justify-center border-b px-3 py-2">
					<span className="text-primary text-sm font-semibold">Trophy</span>
				</div>
				<div className="flex flex-1 flex-col p-2">
					<div className="mb-2 flex flex-1 flex-col items-center justify-center gap-1.5">
						{[
							{ trophy: displayTrophies.main, label: "Main", slot: "main" as const },
							...(isVerseOrAbove
								? [
										{ trophy: displayTrophies.sub1, label: "Sub 1", slot: "sub1" as const },
										{ trophy: displayTrophies.sub2, label: "Sub 2", slot: "sub2" as const }
									]
								: [])
						].map(({ trophy, label }, idx) => {
							const imageUrl = getTrophyImageUrl(trophy)
							// Don't show text overlay if trophy has a custom image (like KOP)
							const backgroundImage = trophy ? honorBackgrounds[trophy.trophyRareType as TrophyRareType] : null
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

					<div className="mt-auto flex gap-2">
						<Button size="sm" variant="outline" onClick={() => setIsDialogOpen(true)} className="flex-1">
							Change
						</Button>
						<Button
							size="sm"
							variant="default"
							onClick={handleSave}
							disabled={!hasPendingSelections}
							className="flex-1"
						>
							Save
						</Button>
					</div>
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
				currentItemId={displayTrophies[selectedSlot]?.trophyId}
				onSelect={handleEquip}
				onUnlock={handleUnlock}
				imageClassName="h-12 w-full"
				headerControls={
					<div className="flex flex-col gap-3">
						<Select value={selectedSlot} onValueChange={v => setSelectedSlot(v as "main" | "sub1" | "sub2")}>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="main">Main</SelectItem>
								{isVerseOrAbove && <SelectItem value="sub1">Sub 1</SelectItem>}
								{isVerseOrAbove && <SelectItem value="sub2">Sub 2</SelectItem>}
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
										<SelectItem value={TrophyRareType.Normal.toString()}>Normal</SelectItem>
										<SelectItem value={TrophyRareType.Bronze.toString()}>Bronze</SelectItem>
										<SelectItem value={TrophyRareType.Silver.toString()}>Silver</SelectItem>
										<SelectItem value={TrophyRareType.Gold.toString()}>Gold</SelectItem>
										<SelectItem value={TrophyRareType.Gold2.toString()}>Gold+</SelectItem>
										<SelectItem value={TrophyRareType.Platinum.toString()}>Platinum</SelectItem>
										<SelectItem value={TrophyRareType.Platinum2.toString()}>Platinum+</SelectItem>
										<SelectItem value={TrophyRareType.Rainbow.toString()}>Rainbow</SelectItem>
										<SelectItem value={TrophyRareType.Staff.toString()}>Staff</SelectItem>
										<SelectItem value={TrophyRareType.Ongeki.toString()}>Ongeki</SelectItem>
										<SelectItem value={TrophyRareType.Maimai.toString()}>Maimai</SelectItem>
										<SelectItem value={TrophyRareType.Duals.toString()}>Duals</SelectItem>
										<SelectItem value={TrophyRareType.Idori.toString()}>Idori</SelectItem>
										<SelectItem value={TrophyRareType.Pheonix_g.toString()}>Phoenix</SelectItem>
										<SelectItem value={TrophyRareType.Pheonix_p.toString()}>Phoenix+</SelectItem>
										<SelectItem value={TrophyRareType.Pheonix_r.toString()}>Phoenix++</SelectItem>
										<SelectItem value={TrophyRareType.Lamp.toString()}>Spirit</SelectItem>
										<SelectItem value={TrophyRareType.Lamp2.toString()}>Tribute</SelectItem>
										<SelectItem value={TrophyRareType.Lamp3.toString()}>Legend</SelectItem>
										<SelectItem value={TrophyRareType.Kop.toString()}>KOP Finalist</SelectItem>
										<SelectItem value={TrophyRareType.Kop2.toString()}>KOP Champion</SelectItem>
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
