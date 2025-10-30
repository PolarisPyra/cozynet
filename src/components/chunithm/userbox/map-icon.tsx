import React, { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import { UserboxSearchCommand } from "@/components/chunithm/userbox/userbox-search-command";
import { Button } from "@/components/ui/button";
import {
	MapiconItem,
	useCurrentMapicon,
	useEquipMapicon,
	useSearchMapicons,
	useUnlockMapicon,
} from "@/hooks/chunithm/userbox/mapicon";
import { CDN } from "@/lib/constants";

import { Grid } from "./grid/grid";

const MapiconCustomization: React.FC = () => {
	const [selectedMapiconId, setSelectedMapiconId] = useState<number | null>(null);
	const [originalMapiconId, setOriginalMapiconId] = useState<number | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>("");

	const { data: currentMapicon } = useCurrentMapicon();
	const { data: searchData, isLoading } = useSearchMapicons({ locked: null });
	const { mutate: equipMapicon } = useEquipMapicon();
	const { mutate: unlockMapicon } = useUnlockMapicon();

	// Track the original mapicon when component mounts
	useEffect(() => {
		if (currentMapicon && originalMapiconId === null) {
			setOriginalMapiconId(currentMapicon.mapiconId);
			setSelectedMapiconId(currentMapicon.mapiconId);
		}
	}, [currentMapicon, originalMapiconId]);

	const handleSelect = useCallback((item: MapiconItem) => {
		setSelectedMapiconId(item.mapiconId);
	}, []);

	const handleEquip = useCallback(
		(item: MapiconItem) => {
			equipMapicon(item.mapiconId, {
				onSuccess: () => {
					setOriginalMapiconId(item.mapiconId);
				},
				onError: (error) => {
					toast.error("Failed to equip mapicon");
					console.error("Error equipping mapicon:", error);
				},
			});
		},
		[equipMapicon]
	);

	const handleUnlock = useCallback(
		(item: MapiconItem) => {
			unlockMapicon(item.mapiconId, {
				onError: (error) => {
					toast.error("Failed to unlock mapicon");
					console.error("Error unlocking mapicon:", error);
				},
			});
		},
		[unlockMapicon, equipMapicon]
	);

	const hasChanges = useMemo(() => {
		return selectedMapiconId !== originalMapiconId;
	}, [selectedMapiconId, originalMapiconId]);

	const equippedItemIds = originalMapiconId ? new Set([originalMapiconId]) : new Set<number>();

	// Filtered items based on search term
	const filteredItems = useMemo(() => {
		if (!searchData?.items) return [];

		let items = searchData.items;

		// Apply search term filter
		if (searchTerm) {
			items = items.filter((item) => item.label.toLowerCase().includes(searchTerm.toLowerCase()));
		}

		return items;
	}, [searchData?.items, searchTerm]);

	// Custom preview component without name
	const customPreview = useCallback(
		(item: MapiconItem | null) => {
			if (!item) {
				return (
					<div className="mb-4 flex h-fit flex-col items-center justify-center">
						<h3 className="text-primary text-xl font-semibold">Select a Map Icon</h3>
						<p className="text-muted-foreground mt-2">Choose a map icon to preview and equip</p>
					</div>
				);
			}

			return (
				<div className="mb-4 flex h-fit flex-col items-center justify-center">
					{/* Preview Image */}
					<div style={{ maxWidth: "100%" }}>
						<img
							src={`${CDN}/chunithm/map_icon/${item.imagePath || ""}`}
							alt={item.label}
							className="mx-auto mb-2"
							style={{
								width: 120 * 2,
								height: 120 * 2,
								objectFit: "contain",
								borderRadius: "0.5rem",
							}}
						/>
					</div>

					{/* Equip/Unlock Button */}
					<Button
						onClick={() => (item.locked ? handleUnlock(item) : handleEquip(item))}
						disabled={!hasChanges && !item.locked}
						variant="custom"
						className="mt-2 rounded-sm text-sm"
					>
						{item.locked ? "Unlock" : "Equip"}
					</Button>
				</div>
			);
		},
		[hasChanges, handleEquip, handleUnlock]
	);

	return (
		<div className="flex h-full flex-col">
			{/* Search Bar */}
			<div className="border-border bg-background/95 flex-shrink-0 backdrop-blur-sm">
				<div className="px-4 py-3">
					<div className="flex items-center gap-2">
						<div className="flex-1">
							<UserboxSearchCommand
								items={searchData?.items || []}
								searchQuery={searchTerm}
								onSearchChange={setSearchTerm}
								onItemSelect={handleSelect}
								itemType="mapicon"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Grid Content */}
			<div className="flex-1 px-2 pb-2 sm:p-4">
				<Grid
					items={filteredItems}
					equippedItemIds={equippedItemIds}
					selectedItemId={selectedMapiconId}
					loading={isLoading}
					itemHeight={100}
					itemWidth={100}
					imageBasePath="chunithm/map_icon"
					onItemClick={handleSelect}
					onEquip={handleEquip}
					onUnlock={handleUnlock}
					hasChanges={hasChanges}
					customPreview={customPreview}
					maxColumns={9}
					minColumns={4}
				/>
			</div>
		</div>
	);
};

export default MapiconCustomization;
