import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/utils"

export interface MapiconItem {
	mapiconId: number
	imagePath: string
	label: string
	locked: boolean
}

export function useCurrentMapicon() {
	return useQuery({
		queryKey: ["userbox", "mapicon", "current"],
		queryFn: async () => {
			const response = await api.chunithm.userbox.mapicon.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch current mapicon")
			}
			return (await response.json()) as MapiconItem | null
		}
	})
}

export function useSearchMapicons(filters: { locked: boolean | null }) {
	return useQuery({
		queryKey: ["userbox", "mapicon", "search", filters],
		queryFn: async () => {
			const response = await api.chunithm.userbox.mapicon.search.$post({
				json: {
					filter: filters
				}
			})

			if (!response.ok) {
				throw new Error("Failed to search mapicons")
			}

			return await response.json()
		}
	})
}

export function useEquipMapicon() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (mapIconId: number) => {
			const response = await api.chunithm.userbox.mapicon.$post({
				json: { mapIconId }
			})

			if (!response.ok) {
				throw new Error("Failed to equip mapicon")
			}

			return await response.json()
		},
		onSuccess: (_, mapIconId) => {
			// Update current mapicon in cache
			queryClient.setQueryData(["userbox", "mapicon", "current"], (old: MapiconItem | undefined) => {
				if (!old) return old
				const searchQueries = queryClient.getQueriesData({ queryKey: ["userbox", "mapicon", "search"] })
				let equippedItem = null

				for (const [, searchData] of searchQueries) {
					if (searchData && typeof searchData === "object" && "items" in searchData) {
						const items = (searchData as any).items as MapiconItem[]
						equippedItem = items.find(item => item.mapiconId === mapIconId)
						if (equippedItem) break
					}
				}

				return equippedItem || { ...old, mapiconId: mapIconId }
			})
		}
	})
}

export function useUnlockMapicon() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (mapIconId: number) => {
			const response = await api.chunithm.userbox.mapicon.unlock[":id"].$patch({
				param: { id: mapIconId.toString() }
			})

			if (!response.ok) {
				throw new Error("Failed to unlock mapicon")
			}

			return await response.json()
		},
		onSuccess: (_, mapIconId) => {
			// Update search results to mark item as unlocked
			queryClient.setQueriesData({ queryKey: ["userbox", "mapicon", "search"] }, (old: any) => {
				if (!old?.items) return old
				return {
					...old,
					items: old.items.map((item: MapiconItem) =>
						item.mapiconId === mapIconId ? { ...item, locked: false } : item
					)
				}
			})
		}
	})
}
