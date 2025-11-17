import { useQuery } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"

export function useOngekiProfile() {
	return useQuery({
		queryKey: ["ongeki", "profile"],
		queryFn: async () => {
			const response = await api.ongeki.profile.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch profile data")
			}

			return await response.json()
		}
	})
}

