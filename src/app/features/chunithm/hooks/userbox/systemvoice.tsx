import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"
import { type SearchResponse, updateCachedSearchResponse } from "@/app/shared/utils/query-cache"

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

			return (await response.json()) as SearchResponse<SystemvoiceItem>
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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["userbox", "systemvoice", "current"] })
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
			queryClient.setQueriesData({ queryKey: ["userbox", "systemvoice", "search"] }, old =>
				updateCachedSearchResponse<SystemvoiceItem>(old, items =>
					items.map(item => (item.systemVoiceId === systemVoiceId ? { ...item, locked: false } : item))
				)
			)
		}
	})
}
