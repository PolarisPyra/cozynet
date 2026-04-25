import { useQuery } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"

export const useUserNewRatingBaseBestList = (enabled = true) => {
	return useQuery({
		queryKey: ["userNewRatingBaseBestList"],
		queryFn: async () => {
			const response = await api.ongeki.newRating.userNewRatingBaseBestList.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch rating data")
			}
			return await response.json()
		},
		enabled
	})
}

export const useUserNewRatingBaseBestNewList = (enabled = true) => {
	return useQuery({
		queryKey: ["userNewRatingBaseBestNewList"],
		queryFn: async () => {
			const response = await api.ongeki.newRating.userNewRatingBaseBestNewList.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch rating data")
			}
			return await response.json()
		},
		enabled
	})
}
export const useUserNewRatingBasePScoreList = (enabled = true) => {
	return useQuery({
		queryKey: ["userNewRatingBasePScoreList"],
		queryFn: async () => {
			const response = await api.ongeki.newRating.userNewRatingBasePScoreList.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch rating data")
			}
			return await response.json()
		},
		enabled
	})
}

export const useUserNewRatingBaseNextBestList = (enabled = true) => {
	return useQuery({
		queryKey: ["userNewRatingBaseNextBestList"],
		queryFn: async () => {
			const response = await api.ongeki.newRating.userNewRatingBaseNextBestList.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch rating data")
			}

			return await response.json()
		},
		enabled
	})
}

export const useNewPlayerRating = (enabled = true) => {
	return useQuery({
		queryKey: ["newPlayerRating"],
		queryFn: async () => {
			const response = await api.ongeki.newRating.newPlayerRating.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch player rating")
			}

			return await response.json()
		},
		enabled
	})
}

export const useNewHighestRating = (enabled = true) => {
	return useQuery({
		queryKey: ["newHighestRating"],
		queryFn: async () => {
			const response = await api.ongeki.newRating.newPlayerRating.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch highest rating")
			}

			return await response.json()
		},
		enabled
	})
}
