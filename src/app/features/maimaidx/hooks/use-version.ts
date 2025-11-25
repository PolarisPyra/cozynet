import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "@/app/shared/hooks/auth/use-auth"
import { useCurrentUser } from "@/app/shared/hooks/users"
import { api } from "@/app/shared/utils"

export const useMaimaiDxVersion = (): number => {
	const { versions } = useCurrentUser()
	return versions.maimaidx_version
}

export const useMaimaiDxVersions = () => {
	return useQuery({
		queryKey: ["mai2Versions"],
		queryFn: async () => {
			const response = await api.maimaidx.cozynet.versions.$get()
			if (!response.ok) {
				throw new Error()
			}

			return await response.json()
		}
	})
}

export const useUpdateMaimaiDxVersion = () => {
	const { setUser } = useAuth()
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (version: number) => {
			const response = await api.maimaidx.cozynet.update.$post({
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
