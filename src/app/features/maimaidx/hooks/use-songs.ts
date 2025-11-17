import { useQuery } from "@tanstack/react-query"

import { Mai2StaticMusic } from "@/app/shared/types"
import { api } from "@/app/shared/utils"

export function useMaimaiDxSongs() {
	return useQuery<Mai2StaticMusic[]>({
		queryKey: ["maimaidx", "songs"],
		queryFn: async () => {
			const response = await api.maimaidx.static.music.$get()

			if (!response.ok) {
				throw new Error("Failed to fetch songs")
			}

			return await response.json()
		}
	})
}
