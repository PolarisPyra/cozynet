import React, { useCallback, useMemo, useState } from "react";

import { toast } from "sonner";

import { UserboxSearchCommand } from "@/components/chunithm/userbox/userbox-search-command";
import { Filter } from "@/components/common/filter";
import { Button } from "@/components/ui/button";
import { MarqueeLabel } from "@/components/ui/marquee-label";
import { useChunithmVersion } from "@/hooks/chunithm";
import {
	TrophyItem,
	useCurrentTrophies,
	useEquipTrophy,
	useSearchTrophies,
	useUnlockTrophy,
} from "@/hooks/chunithm/userbox/trophy";
import { CDN, honorBackgrounds } from "@/lib/constants";
import { TrophyRareType } from "@/lib/enums";

import { Grid } from "./grid/grid";

const imageBasePath = "chunithm/honorBackgrounds";
const TrophyCustomization: React.FC = () => {
	const version = useChunithmVersion();
	const [selectedTrophyId, setSelectedTrophyId] = useState<number | null>(null);
	const [selectedRareType, setSelectedRareType] = useState<TrophyRareType | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>("");

	const { data: currentTrophies, isLoading: currentLoading, refetch: refetchCurrentTrophies } = useCurrentTrophies();
	const { data: searchData, isLoading: searchLoading } = useSearchTrophies({
		locked: null,
		rareType: selectedRareType,
	});
	// Separate query for search command that gets all trophies
	const { data: allTrophiesData } = useSearchTrophies({
		locked: null,
		rareType: null, // Get all rare types for search
	});
	const { mutate: equipTrophy } = useEquipTrophy();
	const { mutate: unlockTrophy } = useUnlockTrophy();

	const handleItemClick = useCallback(
		(item: TrophyItem) => {
			// Don't select already equipped trophies
			const isEquipped = currentTrophies?.some((t) => t.trophyId === item.trophyId);
			if (!isEquipped) {
				setSelectedTrophyId(item.trophyId);
				// Clear the rare type filter so the selected trophy is visible in the grid
				setSelectedRareType(null);
			}
		},
		[currentTrophies]
	);
	const handleEquipClick = useCallback(
		(item: TrophyItem, slot: "main" | "sub1" | "sub2") => {
			equipTrophy(
				{ trophyId: item.trophyId, slot },
				{
					onSuccess: () => {
						refetchCurrentTrophies();
						toast.success(`Trophy equipped to ${slot}!`);
					},
					onError: () => {
						toast.error("Failed to equip trophy");
					},
				}
			);
		},
		[equipTrophy, refetchCurrentTrophies]
	);

	// Grid component wrapper for handleEquipClick
	const handleGridEquip = useCallback(
		(item: TrophyItem) => {
			handleEquipClick(item, "main"); // Default to main slot for grid
		},
		[handleEquipClick]
	);

	const handleUnlockClick = useCallback(
		(item: TrophyItem) => {
			unlockTrophy(item.trophyId, {
				onSuccess: () => {
					toast.success(`${item.label} unlocked!`);
				},
				onError: () => {
					toast.error("Failed to unlock trophy");
				},
			});
		},
		[unlockTrophy]
	);

	const handleRareTypeChange = useCallback((filterValue: string) => {
		const rareType = filterValue === "all" ? null : (parseInt(filterValue) as TrophyRareType);
		setSelectedRareType(rareType);
		setSelectedTrophyId(null); // Clear selection when changing filters
	}, []);

	// Create rare type filter options - hide bronze filter for version 16 and above
	const rareTypeFilters = useMemo(() => {
		const filters = [
			{ value: "all", label: "All" },
			{ value: TrophyRareType.Normal.toString(), label: "Normal" },
		];

		// Only include bronze filter for versions below 16
		if (!version || version < 16) {
			filters.push({ value: TrophyRareType.Bronze.toString(), label: "Bronze" });
		}

		filters.push(
			{ value: TrophyRareType.Silver.toString(), label: "Silver" },
			{ value: TrophyRareType.Gold.toString(), label: "Gold" },
			{ value: TrophyRareType.Gold2.toString(), label: "Gold+" },
			{ value: TrophyRareType.Platinum.toString(), label: "Platinum" },
			{ value: TrophyRareType.Platinum2.toString(), label: "Platinum+" },
			{ value: TrophyRareType.Rainbow.toString(), label: "Rainbow" },
			{ value: TrophyRareType.Staff.toString(), label: "Staff" },
			{ value: TrophyRareType.Ongeki.toString(), label: "Ongeki" },
			{ value: TrophyRareType.Maimai.toString(), label: "Maimai" },
			{ value: TrophyRareType.Duals.toString(), label: "Duals" },
			{ value: TrophyRareType.Idori.toString(), label: "Idori" },
			{ value: TrophyRareType.Pheonix_g.toString(), label: "Phoenix" },
			{ value: TrophyRareType.Pheonix_p.toString(), label: "Phoenix+" },
			{ value: TrophyRareType.Pheonix_r.toString(), label: "Phoenix++" },
			{ value: TrophyRareType.Lamp.toString(), label: "Lamp" },
			{ value: TrophyRareType.Lamp2.toString(), label: "Lamp+" },
			{ value: TrophyRareType.Lamp3.toString(), label: "Lamp++" },
			{ value: TrophyRareType.Kop.toString(), label: "KOP" },
			{ value: TrophyRareType.Kop2.toString(), label: "KOP+" }
		);

		return filters;
	}, [version]);

	const equippedItemIds = useMemo(() => {
		return new Set(currentTrophies?.map((t) => t.trophyId) ?? []);
	}, [currentTrophies]);

	const isLoading = currentLoading || searchLoading;

	const items = useMemo(() => {
		const mappedItems = (searchData?.items ?? []).map((i) => {
			const bg = honorBackgrounds[i.trophyRareType as TrophyRareType];
			if (bg) {
				i.imagePath = bg;
			}
			return i;
		});

		return mappedItems;
	}, [searchData]);

	// All items for search command (not filtered by rare type)
	const allItems = useMemo(() => {
		const mappedItems = (allTrophiesData?.items ?? []).map((i) => {
			const bg = honorBackgrounds[i.trophyRareType as TrophyRareType];
			if (bg) {
				i.imagePath = bg;
			}
			return i;
		});

		return mappedItems;
	}, [allTrophiesData]);

	// Grid items (not filtered by search term - search is only for the dropdown)
	const filteredItems = useMemo(() => {
		// Use allItems when no rare type filter is active, otherwise use items
		return selectedRareType === null ? allItems : items;
	}, [items, allItems, selectedRareType]);

	const TrophyRender = useCallback((trophyItem: TrophyItem, clickable: boolean = true) => {
		const shouldRenderLabelOnBackground = !!honorBackgrounds[trophyItem.trophyRareType];
		const imagePath = trophyItem.imagePath ? trophyItem.imagePath : honorBackgrounds[trophyItem.trophyRareType];

		return (
			<div
				className="relative flex items-center justify-center"
				style={{ width: "240px", height: "30px" }}
				onClick={clickable ? () => setSelectedTrophyId(trophyItem.trophyId) : undefined}
			>
				<img
					src={`${CDN}/${imageBasePath}/${imagePath}` || ""}
					alt={trophyItem.label}
					className="absolute inset-0 h-full w-full object-contain"
					style={{ width: "240px", height: "30px" }}
				/>
				{shouldRenderLabelOnBackground && (
					<MarqueeLabel
						text={trophyItem.label}
						className="relative z-10 text-black uppercase drop-shadow-lg"
						style={{ fontSize: "12px" }}
					/>
				)}
			</div>
		);
	}, []);

	// Handle overlaying text and whatnot
	const customPreview = useCallback(
		(selectedItem: TrophyItem | null) => {
			const equippedTrophy = selectedItem ? currentTrophies?.find((t) => t.trophyId === selectedItem.trophyId) : null;
			const disabled = equippedTrophy?.slot === "main";

			return (
				<div className="flex flex-col items-center">
					{currentTrophies?.map((t) => (
						<div key={t.trophyId} className="flex items-center">
							<h3 className="text-primary text-md mr-4 w-16 py-3 font-semibold uppercase">{t.slot.toUpperCase()}</h3>
							{TrophyRender(t, false)}
						</div>
					)) ?? []}

					{selectedItem && (
						<div className="flex items-center">
							<h3 className="text-primary text-md mr-4 w-16 py-3 font-semibold uppercase">Preview</h3>
							{TrophyRender(selectedItem)}
						</div>
					)}

					<div className="my-2 flex flex-row gap-4">
						{!selectedItem ? (
							<>
								<Button key="main" variant="custom" className="rounded-sm text-sm" disabled>
									Main
								</Button>
								<Button key="sub1" variant="custom" className="text-sm" disabled>
									Sub 1
								</Button>
								<Button key="sub2" variant="custom" className="rounded-sm text-sm" disabled>
									Sub 2
								</Button>
							</>
						) : selectedItem.locked ? (
							<Button onClick={() => handleUnlockClick(selectedItem)} variant="default" className="rounded-sm text-sm">
								Unlock
							</Button>
						) : !!equippedTrophy?.slot ? (
							<>
								<Button key="main" variant="custom" className="rounded-sm text-sm" disabled>
									Main
								</Button>
								<Button key="sub1" variant="custom" className="rounded-sm text-sm" disabled>
									Sub 1
								</Button>
								<Button key="sub2" variant="custom" className="rounded-sm text-sm" disabled>
									Sub 2
								</Button>
							</>
						) : (
							<>
								<Button
									key="main"
									onClick={() => handleEquipClick(selectedItem, "main")}
									disabled={disabled}
									variant="custom"
									className="rounded-sm text-sm"
								>
									Main
								</Button>
								<Button
									key="sub1"
									onClick={() => handleEquipClick(selectedItem, "sub1")}
									disabled={disabled}
									variant="custom"
									className="rounded-sm text-sm"
								>
									Sub 1
								</Button>
								<Button
									key="sub2"
									onClick={() => handleEquipClick(selectedItem, "sub2")}
									disabled={disabled}
									variant="custom"
									className="rounded-sm text-sm"
								>
									Sub 2
								</Button>
							</>
						)}
					</div>
				</div>
			);
		},
		[currentTrophies, handleEquipClick, handleUnlockClick, TrophyRender]
	);

	return (
		<div className="flex h-full flex-col">
			{/* Search Bar and Filters */}
			<div className="border-border bg-background/95 flex-shrink-0 backdrop-blur-sm">
				<div className="px-4 py-3">
					<div className="flex items-center gap-2">
						<div className="flex-1">
							<UserboxSearchCommand
								items={allItems}
								searchQuery={searchTerm}
								onSearchChange={setSearchTerm}
								onItemSelect={handleItemClick}
								itemType="trophy"
							/>
						</div>
						<Filter
							filters={rareTypeFilters}
							selectedFilter={selectedRareType === null ? "all" : selectedRareType.toString()}
							onFilterChange={handleRareTypeChange}
						/>
					</div>
				</div>
			</div>

			{/* Trophy Grid - Takes remaining page */}
			<div className="flex-1 px-2 pb-2 sm:p-4">
				<Grid
					items={filteredItems}
					equippedItemIds={equippedItemIds}
					selectedItemId={selectedTrophyId}
					loading={isLoading}
					imageBasePath={imageBasePath}
					onItemClick={handleItemClick}
					onEquip={handleGridEquip}
					onUnlock={handleUnlockClick}
					customPreview={customPreview}
					useCompactImageSizing={true}
				/>
			</div>
		</div>
	);
};

export default TrophyCustomization;
