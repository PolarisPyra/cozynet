import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/utils"

export interface NameplateItem {
	nameplateId: number
	imagePath: string
	label: string
	locked: boolean
	equipped?: boolean
}

export function useCurrentNameplate() {
	return useQuery({
		queryKey: ["userbox", "nameplate", "current"],
		queryFn: async () => {
			const response = await api.chunithm.userbox.nameplate.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch current nameplate")
			}
			return (await response.json()) as NameplateItem
		}
	})
}

export function useSearchNameplates(filters: { locked: boolean | null }) {
	return useQuery({
		queryKey: ["userbox", "nameplate", "search", filters],
		queryFn: async () => {
			const response = await api.chunithm.userbox.nameplate.search.$post({
				json: { filter: filters }
			})

			if (!response.ok) {
				throw new Error("Failed to search nameplates")
			}

			return await response.json()
		}
	})
}

export function useEquipNameplate() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: number) => {
			// Find the nameplate in the search cache to get its nameplateId
			const searchQueries = queryClient.getQueriesData({ queryKey: ["userbox", "nameplate", "search"] })
			let nameplateToEquip: NameplateItem | undefined = undefined

			for (const [, searchData] of searchQueries) {
				if (searchData && typeof searchData === "object" && "items" in searchData) {
					const items = (searchData as any).items as NameplateItem[]
					nameplateToEquip = items.find(item => item.nameplateId === id)
					if (nameplateToEquip) break
				}
			}

			if (!nameplateToEquip) {
				throw new Error("Nameplate not found")
			}

			const response = await api.chunithm.userbox.nameplate.$post({
				json: { nameplateId: nameplateToEquip.nameplateId }
			})

			if (!response.ok) {
				throw new Error("Failed to equip nameplate")
			}

			return await response.json()
		},
		onSuccess: (data, id) => {
			// Invalidate and refetch current nameplate
			queryClient.invalidateQueries({ queryKey: ["userbox", "nameplate", "current"] })

			// Update current nameplate in cache with server response
			queryClient.setQueryData(["userbox", "nameplate", "current"], data)

			// Update search results to reflect new equipped status
			queryClient.setQueriesData({ queryKey: ["userbox", "nameplate", "search"] }, (old: any) => {
				if (!old?.items) return old
				return {
					...old,
					items: old.items.map((item: NameplateItem) => ({
						...item,
						equipped: item.nameplateId === id
					}))
				}
			})

			// Invalidate search queries to ensure fresh data
			queryClient.invalidateQueries({ queryKey: ["userbox", "nameplate", "search"] })
		}
	})
}

export function useUnlockNameplate() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: number) => {
			// Find the nameplate in the search cache to get its nameplateId
			const searchQueries = queryClient.getQueriesData({ queryKey: ["userbox", "nameplate", "search"] })
			let nameplateToUnlock: NameplateItem | undefined = undefined

			for (const [, searchData] of searchQueries) {
				if (searchData && typeof searchData === "object" && "items" in searchData) {
					const items = (searchData as any).items as NameplateItem[]
					nameplateToUnlock = items.find(item => item.nameplateId === id)
					if (nameplateToUnlock) break
				}
			}

			if (!nameplateToUnlock) {
				throw new Error("Nameplate not found")
			}

			const response = await api.chunithm.userbox.nameplate.unlock[":nameplateId"].$patch({
				param: { nameplateId: nameplateToUnlock.nameplateId.toString() }
			})

			if (!response.ok) {
				throw new Error("Failed to unlock nameplate")
			}

			return await response.json()
		},
		onSuccess: (_, id) => {
			queryClient.setQueriesData({ queryKey: ["userbox", "nameplate", "search"] }, (old: any) => {
				if (!old?.items) return old
				return {
					...old,
					items: old.items.map((item: NameplateItem) => (item.nameplateId === id ? { ...item, locked: false } : item))
				}
			})
		}
	})
}
