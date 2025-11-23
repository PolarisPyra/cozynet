import { useQuery } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"

export const useUserRatingBaseList = (enabled = true) => {
	return useQuery({
		queryKey: ["maimaidx", "rating", "base"],
		queryFn: async () => {
			const response = await api.maimaidx.rating.user_rating_base_list.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch rating base")
			}
			return await response.json()
		},
		enabled
	})
}

export const useUserRatingNewList = (enabled = true) => {
	return useQuery({
		queryKey: ["maimaidx", "rating", "new"],
		queryFn: async () => {
			const response = await api.maimaidx.rating.user_rating_new_list.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch rating new")
			}
			return await response.json()
		},
		enabled
	})
}

export const usePlayerRating = (enabled = true) => {
	return useQuery({
		queryKey: ["maimaidx", "playerRating"],
		queryFn: async () => {
			const response = await api.maimaidx.rating.playerRating.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch player rating")
			}
			return await response.json()
		},
		enabled
	})
}
