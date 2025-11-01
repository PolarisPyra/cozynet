import { useQuery } from "@tanstack/react-query"

import type { DB } from "@/shared/types"
import { api } from "@/utils"

interface CardsResponse {
	cards: (DB.OngekiUserCard & DB.OngekiStaticCards)[]
}

export function useOngekiCards() {
	return useQuery<CardsResponse>({
		queryKey: ["ongeki", "cards"],
		queryFn: async () => {
			const response = await api.ongeki.cards.$get()

			if (!response.ok) {
				throw new Error("Failed to fetch cards")
			}

			return await response.json()
		}
	})
}
