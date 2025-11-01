import React, { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import { UserboxSearchCommand } from "@/components/chunithm/userbox/userbox-search-command";
import { Button } from "@/components/ui/button";
import {
	CharacterItem,
	useCurrentCharacter,
	useEquipCharacter,
	useSearchCharacters,
	useUnlockCharacter,
} from "@/hooks/chunithm/userbox/character";
import { CDN } from "@/lib/constants";

import { Grid } from "./grid/grid";

const CharacterCustomization: React.FC = () => {
	const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);
	const [originalCharacterId, setOriginalCharacterId] = useState<number | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>("");

	const { data: currentCharacter, isLoading: currentLoading } = useCurrentCharacter();
	const { data: searchData, isLoading: searchLoading } = useSearchCharacters({ locked: null });
	const { mutate: equipCharacter } = useEquipCharacter();
	const { mutate: unlockCharacter } = useUnlockCharacter();

	useEffect(() => {
		if (currentCharacter) {
			setOriginalCharacterId(currentCharacter.characterId);
			setSelectedCharacterId(currentCharacter.characterId);
		} else {
			// Character is disabled or not equipped, reset to no selection
			setOriginalCharacterId(null);
			setSelectedCharacterId(null);
		}
	}, [currentCharacter]);

	const handleSelect = useCallback((item: CharacterItem) => {
		setSelectedCharacterId(item.characterId);
	}, []);

	const handleEquip = useCallback(
		(item: CharacterItem) => {
			equipCharacter(item.characterId, {
				onSuccess: () => {
					toast.success("Character equipped successfully");
				},
				onError: (error) => {
					toast.error("Failed to equip character");
					console.error("Error equipping character:", error);
				},
			});
		},
		[equipCharacter]
	);

	const handleUnlock = useCallback(
		(item: CharacterItem) => {
			unlockCharacter(item.characterId, {
				onSuccess: () => {
					toast.success("Character unlocked successfully");
				},
				onError: (error) => {
					toast.error("Failed to unlock character");
					console.error("Error unlocking character:", error);
				},
			});
		},
		[unlockCharacter]
	);

	const hasChanges = useMemo(() => {
		return selectedCharacterId !== originalCharacterId;
	}, [selectedCharacterId, originalCharacterId]);

	const equippedItemIds = useMemo(() => {
		// If no character is equipped (disabled or not set), return empty set
		if (!currentCharacter) {
			return new Set<number>();
		}
		return new Set([currentCharacter.characterId]);
	}, [currentCharacter]);

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
		(item: CharacterItem | null) => {
			if (!item) {
				return (
					<div className="mb-4 flex h-fit flex-col items-center justify-center">
						<h3 className="text-primary text-xl font-semibold">Select a Character</h3>
						<p className="text-muted-foreground mt-2">Choose a character to preview and equip</p>
					</div>
				);
			}

			return (
				<div className="mb-4 flex h-fit flex-col items-center justify-center">
					{/* Preview Image */}
					<div style={{ maxWidth: "100%" }}>
						<img
							src={`${CDN}/chunithm/characters/${item.imagePath || ""}`}
							alt={item.label}
							className="mx-auto mb-2"
							style={{
								width: 140 * 2,
								height: 180 * 2,
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
								itemType="character"
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
					selectedItemId={selectedCharacterId}
					loading={isLoading}
					imageBasePath="chunithm/characters"
					onItemClick={handleSelect}
					onEquip={handleEquip}
					onUnlock={handleUnlock}
					hasChanges={hasChanges}
					customPreview={customPreview}
					useCompactImageSizing={true}
				/>
			</div>
		</div>
	);
};

export default CharacterCustomization;
