import { useQuery } from "@tanstack/react-query"

import { api } from "@/utils"

export const useUserRoles = () => {
	return useQuery({
		queryKey: ["userRoles"],
		queryFn: async () => {
			const response = await api.users.roles.$get()
			if (!response.ok) throw new Error()

			const data = await response.json()

			return {
				upload: Number(data.upload),
				download: Number(data.download),
				special: Number(data.special)
			}
		}
	})
}
