import { useState } from "react"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useOngekiVersion, useUnlockAllCards } from "@/hooks/ongeki"

const CardManagement = () => {
	const version = useOngekiVersion()

	const { mutate: unlockAllCards } = useUnlockAllCards()
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

	return (
		<div className="bg-card rounded-sm p-4 md:p-6">
			<h2 className="text-primary mb-4 text-xl font-semibold">Card Management</h2>
			<Button onClick={handleUnlockAllCards} variant="custom" disabled={isUnlocking.cards}>
				{isUnlocking.cards ? "Unlocking..." : "Unlock all cards"}
			</Button>
		</div>
	)
}

export default CardManagement
