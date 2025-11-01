import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/utils"

export enum AvatarSlot {
	ALL = "all",
	BACK = "back",
	FACE = "face",
	HEAD = "head",
	ITEM = "item",
	SKIN = "skin",
	WEAR = "wear"
}

export function useSearchAvatarItems(filters: { slot: string[]; locked: boolean | null }) {
	return useQuery({
		queryKey: ["userbox", "avatar", "search", filters],
		queryFn: async () => {
			const response = await api.chunithm.userbox.avatar.search.$post({
				json: {
					filter: {
						slot: filters.slot as any,
						locked: filters.locked
					}
				}
			})

			if (!response.ok) {
				throw new Error("Failed to search avatar items")
			}

			return await response.json()
		}
	})
}

export function useEquipAvatarItem() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ itemId, slot }: { itemId: number; slot: string }) => {
			const response = await api.chunithm.userbox.avatar.$post({
				json: {
					[slot]: itemId
				}
			})

			if (!response.ok) {
				throw new Error("Failed to equip avatar item")
			}

			return await response.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["userbox", "avatar"] })
		}
	})
}

export function useUnlockAvatarItem() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (itemId: number) => {
			const response = await api.chunithm.userbox.avatar.unlock[":id"].$patch({
				param: { id: itemId.toString() }
			})

			if (!response.ok) {
				throw new Error("Failed to unlock avatar item")
			}

			return await response.json()
		},
		onSuccess: () => {
			// Invalidate search queries to update the item's locked status
			queryClient.invalidateQueries({ queryKey: ["userbox", "avatar", "search"] })
		}
	})
}
