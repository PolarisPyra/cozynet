import { useState } from "react"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useOngekiVersion, useUnlockAllItems, useUnlockSpecificItem } from "@/hooks/ongeki"

const ItemManagement = () => {
	const version = useOngekiVersion()

	const { mutate: unlockAllItems } = useUnlockAllItems()
	const { mutate: unlockSpecificItem } = useUnlockSpecificItem()

	const [isUnlocking, setIsUnlocking] = useState<{ [key: string]: boolean }>({
		cards: false,
		items: false,
		specific: false
	})

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
				<Button onClick={() => handleUnlockSpecificItem(2)} variant="custom" disabled={isUnlocking.specific}>
					{isUnlocking.specific ? "Unlocking..." : "Unlock nameplates"}
				</Button>
				<Button onClick={() => handleUnlockSpecificItem(17)} variant="custom" disabled={isUnlocking.specific}>
					{isUnlocking.specific ? "Unlocking..." : "Unlock costumes"}
				</Button>
				<Button onClick={() => handleUnlockSpecificItem(19)} variant="custom" disabled={isUnlocking.specific}>
					{isUnlocking.specific ? "Unlocking..." : "Unlock attachments"}
				</Button>
			</div>
			<Button onClick={handleUnlockAllItems} variant="custom" disabled={isUnlocking.items}>
				{isUnlocking.items ? "Unlocking..." : "Unlock all items"}
			</Button>
		</div>
	)
}

export default ItemManagement
