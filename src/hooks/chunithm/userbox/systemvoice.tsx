import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/utils"

export interface SystemvoiceItem {
	systemVoiceId: number
	imagePath: string
	label: string
	locked: boolean
}

export function useCurrentSystemvoice() {
	return useQuery({
		queryKey: ["userbox", "systemvoice", "current"],
		queryFn: async () => {
			const response = await api.chunithm.userbox.systemvoice.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch current systemvoice")
			}
			return (await response.json()) as SystemvoiceItem
		}
	})
}

export function useSearchSystemvoices(filters: { locked: boolean | null }) {
	return useQuery({
		queryKey: ["userbox", "systemvoice", "search", filters],
		queryFn: async () => {
			const response = await api.chunithm.userbox.systemvoice.search.$post({
				json: {
					filter: filters
				}
			})

			if (!response.ok) {
				throw new Error("Failed to search systemvoices")
			}

			return await response.json()
		}
	})
}

export function useEquipSystemvoice() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (systemVoiceId: number) => {
			const response = await api.chunithm.userbox.systemvoice.$post({
				json: { systemVoiceId }
			})

			if (!response.ok) {
				throw new Error("Failed to equip systemvoice")
			}

			return await response.json()
		},
		onSuccess: (_, systemVoiceId) => {
			// Update current systemvoice in cache
			queryClient.setQueryData(["userbox", "systemvoice", "current"], (old: SystemvoiceItem | undefined) => {
				if (!old) return old
				const searchQueries = queryClient.getQueriesData({ queryKey: ["userbox", "systemvoice", "search"] })
				let equippedItem = null

				for (const [, searchData] of searchQueries) {
					if (searchData && typeof searchData === "object" && "items" in searchData) {
						const items = (searchData as any).items as SystemvoiceItem[]
						equippedItem = items.find(item => item.systemVoiceId === systemVoiceId)
						if (equippedItem) break
					}
				}

				return equippedItem || { ...old, id: systemVoiceId }
			})
		}
	})
}

export function useUnlockSystemvoice() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (systemVoiceId: number) => {
			const response = await api.chunithm.userbox.systemvoice.unlock[":id"].$patch({
				param: { id: systemVoiceId.toString() }
			})

			if (!response.ok) {
				throw new Error("Failed to unlock systemvoice")
			}

			return await response.json()
		},
		onSuccess: (_, systemVoiceId) => {
			// Update search results to mark item as unlocked
			queryClient.setQueriesData({ queryKey: ["userbox", "systemvoice", "search"] }, (old: any) => {
				if (!old?.items) return old
				return {
					...old,
					items: old.items.map((item: SystemvoiceItem) =>
						item.systemVoiceId === systemVoiceId ? { ...item, locked: false } : item
					)
				}
			})
		}
	})
}
