import { createContext, useContext, useState, ReactNode } from "react"

interface UserboxPendingContextType {
	nameplate: number | null
	setNameplate: (id: number | null) => void
	trophy: Partial<Record<"main" | "sub1" | "sub2", number>>
	setTrophy: React.Dispatch<React.SetStateAction<Partial<Record<"main" | "sub1" | "sub2", number>>>>
	systemVoice: number | null
	setSystemVoice: (id: number | null) => void
	mapIcon: number | null
	setMapIcon: (id: number | null) => void
	character: number | null
	setCharacter: (id: number | null) => void
	stage: number | null
	setStage: (id: number | null) => void
}

const UserboxPendingContext = createContext<UserboxPendingContextType | undefined>(undefined)

export function UserboxPendingProvider({ children }: { children: ReactNode }) {
	const [nameplate, setNameplate] = useState<number | null>(null)
	const [trophy, setTrophy] = useState<Partial<Record<"main" | "sub1" | "sub2", number>>>({})
	const [systemVoice, setSystemVoice] = useState<number | null>(null)
	const [mapIcon, setMapIcon] = useState<number | null>(null)
	const [character, setCharacter] = useState<number | null>(null)
	const [stage, setStage] = useState<number | null>(null)

	return (
		<UserboxPendingContext.Provider
			value={{
				nameplate,
				setNameplate,
				trophy,
				setTrophy,
				systemVoice,
				setSystemVoice,
				mapIcon,
				setMapIcon,
				character,
				setCharacter,
				stage,
				setStage
			}}
		>
			{children}
		</UserboxPendingContext.Provider>
	)
}

export function useUserboxPending() {
	const context = useContext(UserboxPendingContext)
	if (context === undefined) {
		throw new Error("useUserboxPending must be used within a UserboxPendingProvider")
	}
	return context
}

