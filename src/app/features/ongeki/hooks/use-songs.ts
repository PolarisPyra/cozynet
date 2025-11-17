import { useQuery } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"

export function useOngekiSongs() {
	return useQuery({
		queryKey: ["ongeki", "songs"],
		queryFn: async () => {
			const response = await api.ongeki.static.music.$get()

			if (!response.ok) {
				throw new Error("Failed to fetch songs")
			}

			return await response.json()
		}
	})
}
