import { createContext } from "react"

import type { UserMeta } from "@/server/types/jwt"

export interface AuthContextValue {
	user: UserMeta | null
	isLoading: boolean
	isVerifying: boolean
	error: string
	login: (username: string, password: string) => Promise<void>
	logout: () => Promise<void>
	setUser: (user: UserMeta | null) => void
	signup: (username: string, password: string, accessCode: string) => Promise<void>
	clearError: () => void
	verifySession: () => Promise<boolean>
}

export const AuthContext = createContext<AuthContextValue>({} as AuthContextValue)
