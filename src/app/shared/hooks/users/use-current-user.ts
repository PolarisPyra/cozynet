import type { UserMeta } from "@/server/types/jwt"

import { useAuth } from "../auth/use-auth"

export const useCurrentUser = (): UserMeta => {
	const { user } = useAuth()
	if (!user) {
		throw new Error("useUser must be used within an authenticated context")
	}
	return user
}
