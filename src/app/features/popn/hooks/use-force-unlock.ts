import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"

const queryKey = ["popn", "force-unlock-songs"]

export function usePopnForceUnlockSongs() {
	return useQuery({
		queryKey,
		queryFn: async () => {
			const response = await api.konami.popn.settings.forceUnlock.$get()
			if (!response.ok) throw new Error("Failed to fetch Pop'n song force-unlock setting")
			return response.json()
		}
	})
}

export function useUpdatePopnForceUnlockSongs() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (enabled: boolean) => {
			const response = await api.konami.popn.settings.forceUnlock.$post({
				json: { enabled }
			})
			if (!response.ok) throw new Error("Failed to update Pop'n song force-unlock setting")
			return response.json()
		},
		onSuccess: data => queryClient.setQueryData(queryKey, data)
	})
}
