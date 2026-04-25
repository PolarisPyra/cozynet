import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"
import {
	findCachedSearchItem,
	type SearchResponse,
	updateCachedSearchResponse
} from "@/app/shared/utils/query-cache"

export interface StageItem {
	stageId: number
	imagePath: string
	label: string
	locked: boolean
	equipped?: boolean
}

export function useCurrentStage() {
	return useQuery({
		queryKey: ["userbox", "stage", "current"],
		queryFn: async () => {
			const response = await api.chunithm.userbox.stage.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch current stage")
			}
			return (await response.json()) as StageItem | null
		}
	})
}

export function useSearchStages(filters: { locked: boolean | null }) {
	return useQuery({
		queryKey: ["userbox", "stage", "search", filters],
		queryFn: async () => {
			const response = await api.chunithm.userbox.stage.search.$post({
				json: { filter: filters }
			})

			if (!response.ok) {
				throw new Error("Failed to search stages")
			}

			return (await response.json()) as SearchResponse<StageItem>
		}
	})
}

export function useEquipStage() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: number) => {
			// Find the stage in the search cache to get its stageId
			const searchQueries = queryClient.getQueriesData<unknown>({ queryKey: ["userbox", "stage", "search"] })
			const stageToEquip = findCachedSearchItem<StageItem>(searchQueries, item => item.stageId === id)

			if (!stageToEquip) {
				throw new Error("Stage not found")
			}

			const response = await api.chunithm.userbox.stage.$post({
				json: { stageId: stageToEquip.stageId }
			})

			if (!response.ok) {
				throw new Error("Failed to equip stage")
			}

			return await response.json()
		},
		onSuccess: (data, id) => {
			// Invalidate and refetch current stage
			queryClient.invalidateQueries({ queryKey: ["userbox", "stage", "current"] })

			// Update current stage in cache with server response
			queryClient.setQueryData(["userbox", "stage", "current"], data)

			// Update search results to reflect new equipped status
			queryClient.setQueriesData({ queryKey: ["userbox", "stage", "search"] }, old =>
				updateCachedSearchResponse<StageItem>(old, items =>
					items.map(item => ({
						...item,
						equipped: item.stageId === id
					}))
				)
			)

			// Invalidate search queries to ensure fresh data
			queryClient.invalidateQueries({ queryKey: ["userbox", "stage", "search"] })
		}
	})
}

export function useUnlockStage() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: number) => {
			// Find the stage in the search cache to get its stageId
			const searchQueries = queryClient.getQueriesData<unknown>({ queryKey: ["userbox", "stage", "search"] })
			const stageToUnlock = findCachedSearchItem<StageItem>(searchQueries, item => item.stageId === id)

			if (!stageToUnlock) {
				throw new Error("Stage not found")
			}

			const response = await api.chunithm.userbox.stage.unlock[":stageId"].$patch({
				param: { stageId: stageToUnlock.stageId.toString() }
			})

			if (!response.ok) {
				throw new Error("Failed to unlock stage")
			}

			return await response.json()
		},
		onSuccess: (_, id) => {
			queryClient.setQueriesData({ queryKey: ["userbox", "stage", "search"] }, old =>
				updateCachedSearchResponse<StageItem>(old, items =>
					items.map(item => (item.stageId === id ? { ...item, locked: false } : item))
				)
			)
		}
	})
}
