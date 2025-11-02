import { useQuery } from "@tanstack/react-query"

import { api } from "@/utils"

export function usePossession() {
	return useQuery({
		queryKey: ["chunithm", "possession"],
		queryFn: async () => {
			const response = await api.chunithm.possession.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch possession data")
			}

			return await response.json()
		}
	})
}

