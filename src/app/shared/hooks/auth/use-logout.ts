import { useMutation } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"

export function useLogout() {
	return useMutation({
		mutationFn: async (): Promise<void> => {
			const response = await api.logout.$post()

			if (!response.ok) {
				throw new Error("Logout failed")
			}
		}
	})
}
