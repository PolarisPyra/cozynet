import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"

import { useAuth } from "@/app/shared/hooks/auth/use-auth"
import { useCurrentUser } from "@/app/shared/hooks/users"

export const useChunithmVersion = (): number => {
	const { versions } = useCurrentUser()
	return versions.chunithm_version
}

export const useChunithmVersions = () => {
	return useQuery({
		queryKey: ["chunithmVersions"],
		queryFn: async () => {
			const response = await api.chunithm.cozynet.versions.$get()
			if (!response.ok) {
				throw new Error()
			}

			return await response.json()
		}
	})
}

export const useUpdateChunithmVersion = () => {
	const { setUser } = useAuth()
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (version: number) => {
			const response = await api.chunithm.cozynet.update.$post({
				json: { version }
			})
			if (!response.ok) {
				throw new Error()
			}

			const user = await response.json()
			setUser(user)
			// Invalidate and update the verify session query to ensure the new user data is used
			queryClient.setQueryData(["auth", "verify"], user)
			queryClient.invalidateQueries({ queryKey: ["auth", "verify"] })
		}
	})
}
