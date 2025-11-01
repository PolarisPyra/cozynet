import { useQuery } from "@tanstack/react-query"

import { Mai2Playlog } from "@/shared/types"
import { api } from "@/utils"

// Fetch MaiMai DX scores from playlog
export function useMaimaiDxScores() {
	return useQuery<Mai2Playlog[]>({
		queryKey: ["maimaidx", "scores"],
		queryFn: async () => {
			const response = await api.maimaidx.profile.playlog.$get()

			if (!response.ok) {
				throw new Error()
			}

			return await response.json()
		}
	})
}
