import { useQuery } from "@tanstack/react-query"

import { api } from "@/utils"

export function useChunithmSongs() {
	return useQuery({
		queryKey: ["chunithm", "songs"],
		queryFn: async () => {
			const response = await api.chunithm.static.chuni_static_music.$get()

			if (!response.ok) {
				throw new Error("Failed to fetch songs")
			}

			return await response.json()
		}
	})
}
