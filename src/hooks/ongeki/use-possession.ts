import { useQuery } from "@tanstack/react-query"

import { api } from "@/utils"

export function usePossession() {
	return useQuery({
		queryKey: ["ongeki", "possession"],
		queryFn: async () => {
			const response = await api.ongeki.possession.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch possession data")
			}

			return await response.json()
		}
	})
}

