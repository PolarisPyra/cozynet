import { useQuery } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"

export function useChunithmProfile() {
	return useQuery({
		queryKey: ["chunithm", "profile"],
		queryFn: async () => {
			const response = await api.chunithm.profile.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch profile data")
			}

			return await response.json()
		}
	})
}

