import { createContext, useContext, useState, ReactNode } from "react"

import { AvatarSlot } from "@/app/features/chunithm/hooks/userbox/avatar"

interface AvatarPendingContextType {
	pendingSelections: Partial<Record<AvatarSlot, number>>
	setPendingSelections: React.Dispatch<React.SetStateAction<Partial<Record<AvatarSlot, number>>>>
}

const AvatarPendingContext = createContext<AvatarPendingContextType | undefined>(undefined)

export function AvatarPendingProvider({ children }: { children: ReactNode }) {
	const [pendingSelections, setPendingSelections] = useState<Partial<Record<AvatarSlot, number>>>({})

	return (
		<AvatarPendingContext.Provider value={{ pendingSelections, setPendingSelections }}>
			{children}
		</AvatarPendingContext.Provider>
	)
}

export function useAvatarPending() {
	const context = useContext(AvatarPendingContext)
	if (context === undefined) {
		throw new Error("useAvatarPending must be used within an AvatarPendingProvider")
	}
	return context
}

