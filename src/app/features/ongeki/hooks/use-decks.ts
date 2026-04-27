import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { DB } from "@/app/shared/types"
import { api } from "@/app/shared/utils"

interface DecksResponse {
	decks: DB.OngekiUserDeck[]
}

export function useOngekiDecks() {
	const queryClient = useQueryClient()

	const query = useQuery<DecksResponse>({
		queryKey: ["ongeki", "decks"],
		queryFn: async () => {
			const response = await api.ongeki.decks.$get()
			if (!response.ok) throw new Error("Failed to fetch decks")
			return await response.json()
		}
	})

	const updateDeck = useMutation({
		mutationFn: async (params: { deckId: number; cardId1: number; cardId2: number; cardId3: number }) => {
			const response = await api.ongeki.decks.update.$post({
				json: params
			})
			if (!response.ok) throw new Error("Failed to update deck")
			return await response.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ongeki", "decks"] })
			toast.success("Deck updated successfully")
		},
		onError: (error) => {
			toast.error(error.message)
		}
	})

	return {
		...query,
		decks: query.data?.decks || [],
		updateDeck
	}
}
