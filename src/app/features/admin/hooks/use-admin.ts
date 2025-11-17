import { useQuery } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"

export const useAdmin = () => {
	return useQuery({
		queryKey: ["adminRoles"],
		queryFn: async () => {
			const response = await api.admin.roles.$get()
			if (!response.ok) {
				throw new Error()
			}

			return await response.json()
		}
	})
}
