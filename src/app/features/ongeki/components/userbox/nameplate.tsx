import { useState } from "react"

import { Image } from "lucide-react"
import { toast } from "sonner"

import {
	useCurrentNameplate,
	useEquipNameplate,
	useSearchNameplates,
	useUnlockNameplate
} from "@/app/features/ongeki/hooks/userbox/nameplate"
import { Button } from "@/app/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/shared/components/ui/select"
import { ItemSelectionDialog } from "@/app/shared/components/userbox/item-selection-dialog"
import { CDN } from "@/app/shared/utils/constants"

export function Nameplate() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [lockedFilter, setLockedFilter] = useState<boolean | null>(null)
	const { data: currentNameplate } = useCurrentNameplate()
	const { data: searchResults } = useSearchNameplates({ locked: lockedFilter })
	const { mutate: equipNameplate } = useEquipNameplate()
	const { mutate: unlockNameplate } = useUnlockNameplate()

	const items = searchResults?.items ?? []

	const handleEquip = (id: number) => {
		equipNameplate(id, {
			onSuccess: () => {
				toast.success("Nameplate equipped successfully!")
				setIsDialogOpen(false)
			},
			onError: () => toast.error("Failed to equip nameplate")
		})
	}

	const handleUnlock = (id: number) => {
		unlockNameplate(id, {
			onSuccess: () => {
				toast.success("Nameplate unlocked successfully!")
			},
			onError: () => toast.error("Failed to unlock nameplate")
		})
	}

	return (
		<>
			<p> Work in progress... </p>
		</>
	)
}
