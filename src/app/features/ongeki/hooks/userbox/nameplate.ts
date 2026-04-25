import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"
import {
	findCachedSearchItem,
	type SearchResponse,
	updateCachedSearchResponse
} from "@/app/shared/utils/query-cache"

export interface NameplateItem {
	nameplateId: number
	imagePath: string
	label: string
	locked: boolean
	equipped?: boolean
}

export function useCurrentNameplate() {
	return useQuery({
		queryKey: ["ongeki", "userbox", "nameplate", "current"],
		queryFn: async () => {
			const response = await api.ongeki.userbox.nameplate.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch current nameplate")
			}
			return (await response.json()) as NameplateItem | null
		}
	})
}

export function useSearchNameplates(filters: { locked: boolean | null }) {
	return useQuery({
		queryKey: ["ongeki", "userbox", "nameplate", "search", filters],
		queryFn: async () => {
			const response = await api.ongeki.userbox.nameplate.search.$post({
				json: { filter: filters }
			})

			if (!response.ok) {
				throw new Error("Failed to search nameplates")
			}

			return (await response.json()) as SearchResponse<NameplateItem>
		}
	})
}

export function useEquipNameplate() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: number) => {
			// Find the nameplate in the search cache to get its nameplateId
			const searchQueries = queryClient.getQueriesData<unknown>({ queryKey: ["ongeki", "userbox", "nameplate", "search"] })
			const nameplateToEquip = findCachedSearchItem<NameplateItem>(searchQueries, item => item.nameplateId === id)

			if (!nameplateToEquip) {
				throw new Error("Nameplate not found")
			}

			const response = await api.ongeki.userbox.nameplate.$post({
				json: { nameplateId: nameplateToEquip.nameplateId }
			})

			if (!response.ok) {
				throw new Error("Failed to equip nameplate")
			}

			return await response.json()
		},
		onSuccess: (data, id) => {
			// Invalidate and refetch current nameplate
			queryClient.invalidateQueries({ queryKey: ["ongeki", "userbox", "nameplate", "current"] })

			// Update current nameplate in cache with server response
			queryClient.setQueryData(["ongeki", "userbox", "nameplate", "current"], data)

			// Update search results to reflect new equipped status
			queryClient.setQueriesData({ queryKey: ["ongeki", "userbox", "nameplate", "search"] }, old =>
				updateCachedSearchResponse<NameplateItem>(old, items =>
					items.map(item => ({
						...item,
						equipped: item.nameplateId === id
					}))
				)
			)

			// Invalidate search queries to ensure fresh data
			queryClient.invalidateQueries({ queryKey: ["ongeki", "userbox", "nameplate", "search"] })
		}
	})
}

export function useUnlockNameplate() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: number) => {
			// Find the nameplate in the search cache to get its nameplateId
			const searchQueries = queryClient.getQueriesData<unknown>({ queryKey: ["ongeki", "userbox", "nameplate", "search"] })
			const nameplateToUnlock = findCachedSearchItem<NameplateItem>(searchQueries, item => item.nameplateId === id)

			if (!nameplateToUnlock) {
				throw new Error("Nameplate not found")
			}

			const response = await api.ongeki.userbox.nameplate.unlock[":nameplateId"].$patch({
				param: { nameplateId: nameplateToUnlock.nameplateId.toString() }
			})

			if (!response.ok) {
				throw new Error("Failed to unlock nameplate")
			}

			return await response.json()
		},
		onSuccess: (_, id) => {
			queryClient.setQueriesData({ queryKey: ["ongeki", "userbox", "nameplate", "search"] }, old =>
				updateCachedSearchResponse<NameplateItem>(old, items =>
					items.map(item => (item.nameplateId === id ? { ...item, locked: false } : item))
				)
			)
		}
	})
}
