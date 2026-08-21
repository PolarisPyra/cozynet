import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"

export type PopnSettings = {
	musicPhase: number
	extraStagePhase: number
	tataitePonponPhase: number
	forceUnlockSongs: boolean
	forceUnlockDeco: boolean
	enableTimePlayMode: boolean
	enableLicenses: boolean
}

const queryKey = ["popn", "settings"]

export function usePopnSettings() {
	return useQuery<PopnSettings>({
		queryKey,
		queryFn: async () => {
			const response = await api.konami.popn.settings.$get()
			if (!response.ok) throw new Error("Failed to fetch Pop'n settings")
			return response.json()
		}
	})
}

export function useUpdatePopnSettings() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (settings: Partial<PopnSettings>) => {
			const response = await api.konami.popn.settings.$post({ json: settings })
			if (!response.ok) throw new Error("Failed to update Pop'n settings")
			return response.json()
		},
		onSuccess: data => queryClient.setQueryData(queryKey, data)
	})
}
