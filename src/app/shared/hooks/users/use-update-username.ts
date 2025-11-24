import { useMutation, useQueryClient } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"

import { useAuth } from "../auth/use-auth"

interface UpdateUsernameVariables {
	username: string
}

export function useUpdateUsername() {
	const { setUser } = useAuth()
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ username }: UpdateUsernameVariables) => {
			const response = await api.common.profile.username.$post({
				json: { username }
			})
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				const errorMessage =
					(errorData as { message?: string; error?: string }).message ||
					(errorData as { message?: string; error?: string }).error ||
					"Failed to update username"
				throw new Error(errorMessage)
			}
			return await response.json()
		},
		onSuccess: async data => {
			// Invalidate and refetch user data
			await queryClient.invalidateQueries({ queryKey: ["auth", "verify"] })

			// Update the user in auth context with the full user object from the server
			// This includes the refreshed JWT token data
			setUser(data)
		}
	})
}
