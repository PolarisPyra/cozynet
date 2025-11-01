import React, { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import { UserboxSearchCommand } from "@/components/chunithm/userbox/userbox-search-command";
import { Button } from "@/components/ui/button";
import {
	NameplateItem,
	useCurrentNameplate,
	useEquipNameplate,
	useSearchNameplates,
	useUnlockNameplate,
} from "@/hooks/chunithm/userbox/nameplate";
import { CDN } from "@/lib/constants";

import { Grid } from "./grid/grid";

const NameplateCustomization: React.FC = () => {
	const [selectedNameplateId, setSelectedNameplateId] = useState<number | null>(null);
	const [originalNameplateId, setOriginalNameplateId] = useState<number | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>("");

	const { data: currentNameplate, isLoading: currentLoading } = useCurrentNameplate();
	const { data: searchData, isLoading: searchLoading } = useSearchNameplates({ locked: null });
	const { mutate: equipNameplate } = useEquipNameplate();
	const { mutate: unlockNameplate } = useUnlockNameplate();

	useEffect(() => {
		if (currentNameplate) {
			setOriginalNameplateId(currentNameplate.nameplateId);
			setSelectedNameplateId(currentNameplate.nameplateId);
		} else {
			// Reset when no nameplate is equipped
			setOriginalNameplateId(null);
			setSelectedNameplateId(null);
		}
	}, [currentNameplate]);

	const handleSelect = useCallback((item: NameplateItem) => {
		setSelectedNameplateId(item.nameplateId);
	}, []);

	const handleEquip = useCallback(
		(item: NameplateItem) => {
			equipNameplate(item.nameplateId, {
				onSuccess: () => {
					toast.success("Nameplate equipped successfully");
				},
				onError: (error) => {
					toast.error("Failed to equip nameplate");
					console.error("Error equipping nameplate:", error);
				},
			});
		},
		[equipNameplate]
	);

	const handleUnlock = useCallback(
		(item: NameplateItem) => {
			unlockNameplate(item.nameplateId, {
				onSuccess: () => {
					toast.success("Nameplate unlocked successfully");
				},
				onError: (error) => {
					toast.error("Failed to unlock nameplate");
					console.error("Error unlocking nameplate:", error);
				},
			});
		},
		[unlockNameplate]
	);

	const hasChanges = useMemo(() => {
		return selectedNameplateId !== originalNameplateId;
	}, [selectedNameplateId, originalNameplateId]);

	const equippedItemIds = useMemo(() => {
		if (searchData?.items) {
			const equippedFromSearch = searchData.items.filter((item) => item.equipped).map((item) => item.nameplateId);
			if (equippedFromSearch.length > 0) {
				return new Set(equippedFromSearch);
			}
		}
		if (currentNameplate) {
			return new Set([currentNameplate.nameplateId]);
		}
		return new Set<number>();
	}, [currentNameplate, searchData?.items]);

	const isLoading = currentLoading || searchLoading;

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

	// Custom preview function to display larger nameplate
	const customPreview = useCallback(
		(selectedItem: NameplateItem | null) => {
			if (!selectedItem) {
				return (
					<div className="mb-4 flex h-fit flex-col items-center justify-center">
						<h3 className="text-primary text-xl font-semibold">Select a Nameplate</h3>
						<p className="text-muted-foreground mt-2">Choose a nameplate to preview and equip</p>
					</div>
				);
			}

			const handleAction = () => {
				if (selectedItem.locked) {
					handleUnlock(selectedItem);
				} else {
					handleEquip(selectedItem);
				}
			};

			return (
				<div className="mb-4 flex h-fit flex-col items-center justify-center gap-4 p-4 sm:p-6">
					{selectedItem.imagePath && (
						<img
							src={`${CDN}/chunithm/nameplate/${selectedItem.imagePath}`}
							alt={selectedItem.label}
							className="mx-auto h-auto max-w-full rounded-sm"
							style={{
								width: "min(320px, 80vw)",
								height: "auto",
								objectFit: "contain",
							}}
						/>
					)}
					<Button onClick={handleAction} disabled={!hasChanges} variant="custom" className="w-full rounded-sm sm:w-auto">
						{selectedItem.locked ? "Unlock" : "Equip"}
					</Button>
				</div>
			);
		},
		[handleEquip, handleUnlock, hasChanges]
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
								itemType="nameplate"
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
					selectedItemId={selectedNameplateId}
					loading={isLoading}
					imageBasePath="chunithm/nameplate"
					onItemClick={handleSelect}
					onEquip={handleEquip}
					onUnlock={handleUnlock}
					hasChanges={hasChanges}
					customPreview={customPreview}
				/>
			</div>
		</div>
	);
};

export default NameplateCustomization;
