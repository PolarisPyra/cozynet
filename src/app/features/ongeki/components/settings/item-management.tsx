import { useState } from "react"

import { toast } from "sonner"

import { Button } from "@/app/shared/components/ui/button"
import { useOngekiVersion, useUnlockAllCards, useUnlockAllItems, useUnlockSpecificItem } from "@/app/features/ongeki/hooks"

const ItemManagement = () => {
	const version = useOngekiVersion()

	const { mutate: unlockAllCards } = useUnlockAllCards()
	const { mutate: unlockAllItems } = useUnlockAllItems()
	const { mutate: unlockSpecificItem } = useUnlockSpecificItem()

	const [isUnlocking, setIsUnlocking] = useState<{ [key: string]: boolean }>({
		cards: false,
		items: false,
		specific: false
	})

	const handleUnlockAllCards = async () => {
		if (!version) return

		setIsUnlocking(prev => ({ ...prev, cards: true }))
		try {
			unlockAllCards(Number(version), {
				onSuccess: () => {
					toast.success("Cards unlocked successfully!")
				},
				onError: () => {
					toast.error("Failed to unlock cards")
				}
			})
		} finally {
			setIsUnlocking(prev => ({ ...prev, cards: false }))
		}
	}

	const handleUnlockAllItems = async () => {
		if (!version) return

		setIsUnlocking(prev => ({ ...prev, items: true }))
		try {
			unlockAllItems(version, {
				onSuccess: () => {
					toast.success("Items unlocked successfully!")
				},
				onError: () => {
					toast.error("Failed to unlock Items")
				}
			})
		} finally {
			setIsUnlocking(prev => ({ ...prev, items: false }))
		}
	}
	const handleUnlockSpecificItem = async (itemKind: number) => {
		if (!version) return

		setIsUnlocking(prev => ({ ...prev, specific: true }))
		try {
			unlockSpecificItem(
				{ itemKind, version: Number(version) },
				{
					onSuccess: () => {
						toast.success("Items unlocked successfully!")
					},
					onError: () => {
						toast.error("Failed to unlock items")
					}
				}
			)
		} finally {
			setIsUnlocking(prev => ({ ...prev, specific: false }))
		}
	}

	return (
		<div className="bg-card rounded-sm p-4 md:p-6">
			<h2 className="text-primary mb-4 text-xl font-semibold">Item Management</h2>
			<div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
				<Button onClick={() => handleUnlockSpecificItem(2)} variant="outline" size="sm" disabled={isUnlocking.specific}>
					{isUnlocking.specific ? "Unlocking..." : "Unlock nameplates"}
				</Button>
				<Button onClick={() => handleUnlockSpecificItem(17)} variant="outline" size="sm" disabled={isUnlocking.specific}>
					{isUnlocking.specific ? "Unlocking..." : "Unlock costumes"}
				</Button>
				<Button onClick={() => handleUnlockSpecificItem(19)} variant="outline" size="sm" disabled={isUnlocking.specific}>
					{isUnlocking.specific ? "Unlocking..." : "Unlock attachments"}
				</Button>
				<Button onClick={handleUnlockAllCards} variant="outline" size="sm" disabled={isUnlocking.cards}>
					{isUnlocking.cards ? "Unlocking..." : "Unlock Cards"}
				</Button>
			</div>
			<Button onClick={handleUnlockAllItems} variant="outline" size="sm" disabled={isUnlocking.items} className="w-full">
				{isUnlocking.items ? "Unlocking..." : "Unlock all items"}
			</Button>
		</div>
	)
}

export default ItemManagement
