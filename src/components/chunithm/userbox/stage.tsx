import React, { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import { UserboxSearchCommand } from "@/components/chunithm/userbox/userbox-search-command";
import { Button } from "@/components/ui/button";
import {
	StageItem,
	useCurrentStage,
	useEquipStage,
	useSearchStages,
	useUnlockStage,
} from "@/hooks/chunithm/userbox/stage";
import { CDN } from "@/lib/constants";

import { Grid } from "./grid/grid";

const StageCustomization: React.FC = () => {
	const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
	const [originalStageId, setOriginalStageId] = useState<number | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>("");

	const { data: currentStage, isLoading: currentLoading } = useCurrentStage();
	const { data: searchData, isLoading: searchLoading } = useSearchStages({ locked: null });
	const { mutate: equipStage } = useEquipStage();
	const { mutate: unlockStage } = useUnlockStage();

	useEffect(() => {
		if (currentStage) {
			setOriginalStageId(currentStage.stageId);
			setSelectedStageId(currentStage.stageId);
		}
	}, [currentStage]);

	const handleSelect = useCallback((item: StageItem) => {
		setSelectedStageId(item.stageId);
	}, []);

	const handleEquip = useCallback(
		(item: StageItem) => {
			equipStage(item.stageId, {
				onSuccess: () => {
					toast.success("Stage equipped successfully");
				},
				onError: (error) => {
					toast.error("Failed to equip stage");
					console.error("Error equipping stage:", error);
				},
			});
		},
		[equipStage]
	);

	const handleUnlock = useCallback(
		(item: StageItem) => {
			unlockStage(item.stageId, {
				onSuccess: () => {
					toast.success("Stage unlocked successfully");
				},
				onError: (error) => {
					toast.error("Failed to unlock stage");
					console.error("Error unlocking stage:", error);
				},
			});
		},
		[unlockStage]
	);

	const hasChanges = useMemo(() => {
		return selectedStageId !== originalStageId;
	}, [selectedStageId, originalStageId]);

	const equippedItemIds = useMemo(() => {
		const id = currentStage?.stageId ?? 0;
		return new Set([id]);
	}, [currentStage]);

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

	// Custom preview component without name
	const customPreview = useCallback(
		(item: StageItem | null) => {
			if (!item) {
				return (
					<div className="mb-4 flex h-fit flex-col items-center justify-center">
						<h3 className="text-primary text-xl font-semibold">Select a Stage</h3>
						<p className="text-muted-foreground mt-2">Choose a stage to preview and equip</p>
					</div>
				);
			}

			return (
				<div className="mb-4 flex h-fit flex-col items-center justify-center">
					{/* Preview Image */}
					<div style={{ maxWidth: "100%" }}>
						<img
							src={`${CDN}/chunithm/stage/${item.imagePath || ""}`}
							alt={item.label}
							className="mx-auto mb-2"
							style={{
								width: 120 * 2,
								height: 90 * 2,
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
								itemType="stage"
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
					selectedItemId={selectedStageId}
					loading={isLoading}
					itemHeight={100}
					itemWidth={100}
					imageBasePath="chunithm/stage"
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

export default StageCustomization;
