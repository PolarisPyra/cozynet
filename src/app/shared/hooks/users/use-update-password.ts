import { useMutation, useQueryClient } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"

import { useAuth } from "../auth/use-auth"

interface UpdatePasswordVariables {
	currentPassword: string
	newPassword: string
}

export function useUpdatePassword() {
	const { setUser } = useAuth()
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ currentPassword, newPassword }: UpdatePasswordVariables) => {
			const response = await api.common.profile.password.$post({
				json: { currentPassword, newPassword }
			})
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				const errorMessage =
					(errorData as { message?: string; error?: string }).message ||
					(errorData as { message?: string; error?: string }).error ||
					"Failed to update password"
				throw new Error(errorMessage)
			}
			return await response.json()
		},
		onSuccess: async data => {
			// Invalidate and refetch user data
			await queryClient.invalidateQueries({ queryKey: ["verifySession"] })

			// Update the user in auth context with the full user object from the server
			// This includes the refreshed JWT token data
			setUser(data)
		}
	})
}
