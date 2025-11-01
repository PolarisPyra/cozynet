import { useMutation } from "@tanstack/react-query"

import { api } from "@/utils"

interface UpdateNameVariables {
	userName: string
}

export function useUpdateName() {
	return useMutation({
		mutationFn: async ({ userName }: UpdateNameVariables) => {
			const response = await api.chunithm.username.update.$post({
				json: { userName }
			})
			if (!response.ok) {
				throw new Error("Failed to update username")
			}
			return response.json()
		},
		onError: error => {
			console.error("Error updating username:", error)
		}
	})
}
