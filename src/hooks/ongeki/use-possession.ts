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

export function usePossessionPlaylog() {
	return useQuery({
		queryKey: ["ongeki", "possession", "playlog"],
		queryFn: async () => {
			const response = await api.ongeki.possession.playlog.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch possession playlog")
			}

			return await response.json()
		}
	})
}

