import { useQuery } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"
import type { UserMeta } from "@/server/types/jwt"

export function useVerifySession(enabled = true) {
	return useQuery({
		queryKey: ["auth", "verify"],
		queryFn: async (): Promise<UserMeta> => {
			const response = await api.users.verify.$post({})

			if (!response.ok) {
				throw new Error("Session verification failed")
			}

			return (await response.json()) as UserMeta
		},
		enabled,
		retry: false,
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false, // Prevent refetch on rapid tab switches
		refetchOnMount: true // Always refetch on mount for security
	})
}
