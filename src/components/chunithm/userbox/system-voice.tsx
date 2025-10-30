import React, { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import { UserboxSearchCommand } from "@/components/chunithm/userbox/userbox-search-command";
import { Button } from "@/components/ui/button";
import {
	SystemvoiceItem,
	useCurrentSystemvoice,
	useEquipSystemvoice,
	useSearchSystemvoices,
	useUnlockSystemvoice,
} from "@/hooks/chunithm/userbox/systemvoice";
import { CDN } from "@/lib/constants";

import { Grid } from "./grid/grid";
import { VoiceSampleDropdown } from "./voice-sample-dropdown";

const SystemvoiceCustomization: React.FC = () => {
	const [selectedSystemvoiceId, setSelectedSystemvoiceId] = useState<number | null>(null);
	const [originalSystemvoiceId, setOriginalSystemvoiceId] = useState<number | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>("");

	const { data: currentSystemvoice } = useCurrentSystemvoice();
	const { data: searchData, isLoading } = useSearchSystemvoices({ locked: null });
	const { mutate: equipSystemvoice } = useEquipSystemvoice();
	const { mutate: unlockSystemvoice } = useUnlockSystemvoice();

	// Track the original systemvoice when component mounts
	useEffect(() => {
		if (currentSystemvoice && originalSystemvoiceId === null) {
			setOriginalSystemvoiceId(currentSystemvoice.systemVoiceId);
			setSelectedSystemvoiceId(currentSystemvoice.systemVoiceId);
		}
	}, [currentSystemvoice, originalSystemvoiceId]);

	const handleSelect = useCallback((item: SystemvoiceItem) => {
		setSelectedSystemvoiceId(item.systemVoiceId);
	}, []);

	const handleEquip = useCallback(
		(item: SystemvoiceItem) => {
			equipSystemvoice(item.systemVoiceId, {
				onSuccess: () => {
					setOriginalSystemvoiceId(item.systemVoiceId);
				},
				onError: (error) => {
					toast.error("Failed to equip systemvoice");
					console.error("Error equipping systemvoice:", error);
				},
			});
		},
		[equipSystemvoice]
	);

	const handleUnlock = useCallback(
		(item: SystemvoiceItem) => {
			unlockSystemvoice(item.systemVoiceId, {
				onError: (error) => {
					toast.error("Failed to unlock systemvoice");
					console.error("Error unlocking systemvoice:", error);
				},
			});
		},
		[unlockSystemvoice]
	);

	const hasChanges = useMemo(() => {
		return selectedSystemvoiceId !== originalSystemvoiceId;
	}, [selectedSystemvoiceId, originalSystemvoiceId]);

	const equippedItemIds = originalSystemvoiceId ? new Set([originalSystemvoiceId]) : new Set<number>();

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

	// Custom preview component with voice samples dropdown
	const customPreview = useCallback(
		(item: SystemvoiceItem | null) => {
			if (!item) {
				return (
					<div className="mb-4 flex h-fit flex-col items-center justify-center">
						<h3 className="text-primary text-xl font-semibold">Select a System Voice</h3>
						<p className="text-muted-foreground mt-2">Choose a system voice to preview and equip</p>
					</div>
				);
			}

			return (
				<div className="mb-4 flex h-fit flex-col items-center justify-center">
					{/* Preview Image */}
					<div style={{ maxWidth: "100%" }}>
						<img
							src={`${CDN}/chunithm/system_voice_thumbnails/${item.imagePath || ""}`}
							alt={item.label}
							className="mx-auto mb-2"
							style={{
								width: 240 * 1.5,
								height: 90 * 1.5,
								objectFit: "contain",
								borderRadius: "0.5rem",
							}}
						/>
					</div>
					<VoiceSampleDropdown systemVoiceId={item.systemVoiceId} />

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
								itemType="systemvoice"
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
					selectedItemId={selectedSystemvoiceId}
					loading={isLoading}
					layout="stacked"
					itemHeight={100}
					itemWidth={100}
					imageBasePath="chunithm/system_voice_thumbnails"
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

export default SystemvoiceCustomization;
