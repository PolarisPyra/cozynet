import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/app/shared/utils/api"

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

			return await response.json()
		}
	})
}

export function useEquipStage() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: number) => {
			// Find the stage in the search cache to get its stageId
			const searchQueries = queryClient.getQueriesData({ queryKey: ["userbox", "stage", "search"] })
			let stageToEquip: StageItem | undefined = undefined

			for (const [, searchData] of searchQueries) {
				if (searchData && typeof searchData === "object" && "items" in searchData) {
					const items = (searchData as any).items as StageItem[]
					stageToEquip = items.find(item => item.stageId === id)
					if (stageToEquip) break
				}
			}

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
			queryClient.setQueriesData({ queryKey: ["userbox", "stage", "search"] }, (old: any) => {
				if (!old?.items) return old
				return {
					...old,
					items: old.items.map((item: StageItem) => ({
						...item,
						equipped: item.stageId === id
					}))
				}
			})

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
			const searchQueries = queryClient.getQueriesData({ queryKey: ["userbox", "stage", "search"] })
			let stageToUnlock: StageItem | undefined = undefined

			for (const [, searchData] of searchQueries) {
				if (searchData && typeof searchData === "object" && "items" in searchData) {
					const items = (searchData as any).items as StageItem[]
					stageToUnlock = items.find(item => item.stageId === id)
					if (stageToUnlock) break
				}
			}

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
			queryClient.setQueriesData({ queryKey: ["userbox", "stage", "search"] }, (old: any) => {
				if (!old?.items) return old
				return {
					...old,
					items: old.items.map((item: StageItem) => (item.stageId === id ? { ...item, locked: false } : item))
				}
			})
		}
	})
}
