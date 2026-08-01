import { useQuery } from "@tanstack/react-query"

import type { PopnPlaylog } from "@/app/shared/types"
import { api } from "@/app/shared/utils"

export function usePopnScores() {
	return useQuery<PopnPlaylog[]>({
		queryKey: ["popn", "scores"],
		queryFn: async () => {
			const response = await api.konami.popn.profile.playlog.$get()
			if (!response.ok) throw new Error("Failed to fetch Pop'n scores")
			return (await response.json()) as PopnPlaylog[]
		}
	})
}
