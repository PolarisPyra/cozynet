import { useQuery } from "@tanstack/react-query"

import type { DB } from "@/app/shared/types"
import { api } from "@/app/shared/utils"

export function usePopnSongs() {
	return useQuery<DB.PopnStaticMusic[]>({
		queryKey: ["popn", "songs"],
		queryFn: async () => {
			const response = await api.konami.popn.static.music.$get()
			if (!response.ok) throw new Error("Failed to fetch Pop'n songs")
			return response.json()
		}
	})
}
