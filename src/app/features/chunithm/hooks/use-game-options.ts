import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { DB } from "@/app/shared/types"
import { api } from "@/app/shared/utils/api"

export function useGameOptions() {
	return useQuery({
		queryKey: ["chunithm", "game-options"],
		queryFn: async () => {
			const response = await api.chunithm.options.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch game options")
			}
			return (await response.json()) as DB.ChuniProfileOption
		}
	})
}

export function useUpdateGameOptions() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (options: Record<string, number>) => {
			const response = await api.chunithm.options.update.$post({
				json: options
			})
			if (!response.ok) {
				throw new Error("Failed to update game options")
			}
			return await response.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["chunithm", "game-options"] })
		}
	})
}
