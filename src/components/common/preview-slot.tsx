import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { CDN } from "@/lib/constants";

// BaseItem interface for preview slot
interface BaseItem {
	id?: number;
	avatarAccessoryId?: number;
	characterId?: number;
	trophyId?: number;
	nameplateId?: number;
	mapiconId?: number;
	stageId?: number;
	systemVoiceId?: number;
	imagePath: string;
	label: string;
	locked: boolean;
}

interface PreviewSlotProps<T extends BaseItem> {
	item: T | null;
	imageBasePath: string;
	onEquip?: (item: T) => void;
	onUnlock?: (item: T) => void;
	hasChanges: boolean;
	className?: string;
}

export const PreviewSlot = <T extends BaseItem>({
	item,
	imageBasePath,
	onEquip,
	onUnlock,
	hasChanges,
	className,
}: PreviewSlotProps<T>) => {
	const handleAction = useCallback(() => {
		if (!item) return;

		if (item.locked && onUnlock) {
			onUnlock(item);
		} else if (onEquip) {
			onEquip(item);
		}
	}, [item, onEquip, onUnlock]);

	if (!item) return null;

	return (
		<div className={`mb-4 flex h-fit flex-col items-center justify-center gap-4 p-6 ${className || ""}`}>
			<h3 className="text-primary text-center text-xl font-semibold">{item.label}</h3>
			{item.imagePath && (
				<img
					src={`${CDN}/${imageBasePath}/${item.imagePath}`}
					alt={item.label}
					className="mx-auto max-w-full rounded-sm"
					style={{
						height: "auto",
						objectFit: "contain",
					}}
				/>
			)}
			{(onEquip || onUnlock) && (
				<Button onClick={handleAction} disabled={!hasChanges} variant="custom">
					{item.locked ? "Unlock" : "Equip"}
				</Button>
			)}
		</div>
	);
};
