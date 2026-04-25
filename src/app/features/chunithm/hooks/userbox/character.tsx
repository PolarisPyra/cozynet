import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"
import {
	findCachedSearchItem,
	type SearchResponse,
	updateCachedSearchResponse
} from "@/app/shared/utils/query-cache"

export interface CharacterItem {
	characterId: number
	imagePath: string
	label: string
	locked: boolean
	equipped?: boolean
}

export function useCurrentCharacter() {
	return useQuery({
		queryKey: ["userbox", "character", "current"],
		queryFn: async () => {
			const response = await api.chunithm.userbox.character.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch current character")
			}
			return (await response.json()) as CharacterItem | null
		}
	})
}

export function useSearchCharacters(filters: { locked: boolean | null }) {
	return useQuery({
		queryKey: ["userbox", "character", "search", filters],
		queryFn: async () => {
			const response = await api.chunithm.userbox.character.search.$post({
				json: { filter: filters }
			})

			if (!response.ok) {
				throw new Error("Failed to search characters")
			}

			return (await response.json()) as SearchResponse<CharacterItem>
		}
	})
}

export function useEquipCharacter() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: number) => {
			// Find the character in the search cache to get its characterId
			const searchQueries = queryClient.getQueriesData<unknown>({ queryKey: ["userbox", "character", "search"] })
			const characterToEquip = findCachedSearchItem<CharacterItem>(searchQueries, item => item.characterId === id)

			if (!characterToEquip) {
				throw new Error("Character not found")
			}

			const response = await api.chunithm.userbox.character.$post({
				json: { characterId: characterToEquip.characterId }
			})

			if (!response.ok) {
				throw new Error("Failed to equip character")
			}

			return await response.json()
		},
		onSuccess: (data, id) => {
			// Invalidate and refetch current character
			queryClient.invalidateQueries({ queryKey: ["userbox", "character", "current"] })

			// Update current character in cache with server response
			queryClient.setQueryData(["userbox", "character", "current"], data)

			// Update search results to reflect new equipped status
			queryClient.setQueriesData({ queryKey: ["userbox", "character", "search"] }, old =>
				updateCachedSearchResponse<CharacterItem>(old, items =>
					items.map(item => ({
						...item,
						equipped: item.characterId === id
					}))
				)
			)

			// Invalidate search queries to ensure fresh data
			queryClient.invalidateQueries({ queryKey: ["userbox", "character", "search"] })
		}
	})
}

export function useUnlockCharacter() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: number) => {
			// Find the character in the search cache to get its characterId
			const searchQueries = queryClient.getQueriesData<unknown>({ queryKey: ["userbox", "character", "search"] })
			const characterToUnlock = findCachedSearchItem<CharacterItem>(searchQueries, item => item.characterId === id)

			if (!characterToUnlock) {
				throw new Error("Character not found")
			}

			const response = await api.chunithm.userbox.character.unlock[":characterId"].$patch({
				param: { characterId: characterToUnlock.characterId.toString() }
			})

			if (!response.ok) {
				throw new Error("Failed to unlock character")
			}

			return await response.json()
		},
		onSuccess: (_, id) => {
			queryClient.setQueriesData({ queryKey: ["userbox", "character", "search"] }, old =>
				updateCachedSearchResponse<CharacterItem>(old, items =>
					items.map(item => (item.characterId === id ? { ...item, locked: false } : item))
				)
			)
		}
	})
}
