import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { TrophyRareType } from "@/app/shared/utils/enums"
import { api } from "@/app/shared/utils"

export interface TrophyItem {
	trophyId: number
	imagePath: string
	trophyRareType: TrophyRareType
	label: string
	locked: boolean
	slot: "main" | "sub1" | "sub2"
}

export function useCurrentTrophies() {
	return useQuery({
		queryKey: ["userbox", "trophy", "current"],
		queryFn: async () => {
			const response = await api.chunithm.userbox.trophy.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch current trophy")
			}
			return (await response.json()) as TrophyItem[]
		}
	})
}

export function useSearchTrophies(filters: { locked: boolean | null; rareType?: number | null }) {
	return useQuery({
		queryKey: ["userbox", "trophy", "search", filters],
		queryFn: async () => {
			const response = await api.chunithm.userbox.trophy.search.$post({
				json: {
					filter: {
						locked: filters.locked,
						rareType: filters.rareType ?? null
					}
				}
			})

			if (!response.ok) {
				throw new Error("Failed to search trophies")
			}

			return await response.json()
		}
	})
}

export function useEquipTrophy() {
	return useMutation({
		mutationFn: async (params: { trophyId: number; slot: "main" | "sub1" | "sub2" }) => {
			const response = await api.chunithm.userbox.trophy.$post({
				json: params
			})

			if (!response.ok) {
				throw new Error("Failed to equip trophy")
			}

			return await response.json()
		}
	})
}

export function useUnlockTrophy() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (trophyId: number) => {
			const response = await api.chunithm.userbox.trophy.unlock[":id"].$patch({
				param: { id: trophyId.toString() }
			})

			if (!response.ok) {
				throw new Error("Failed to unlock trophy")
			}

			return await response.json()
		},
		onSuccess: (_, trophyId) => {
			// Update search results to mark item as unlocked
			queryClient.setQueriesData({ queryKey: ["userbox", "trophy", "search"] }, (old: any) => {
				if (!old?.items) return old
				return {
					...old,
					items: old.items.map((item: TrophyItem) => (item.trophyId === trophyId ? { ...item, locked: false } : item))
				}
			})
		}
	})
}
