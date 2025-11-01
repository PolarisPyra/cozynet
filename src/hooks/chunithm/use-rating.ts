import { useQuery } from "@tanstack/react-query"

import { api } from "@/utils"

/**
 * Fetches and returns the 10 most recent plays that contribute to their rating.
 * - For versions before VERSE (version < 17)
 */

export const useUserRatingBaseHotList = (enabled = true) => {
	return useQuery({
		queryKey: ["userRatingBaseHotList"],
		queryFn: async () => {
			const response = await api.chunithm.rating.user_rating_base_hot_list.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch recent rating plays")
			}

			return await response.json()
		},
		enabled
	})
}

/**
 * Fetches and returns the user's top 30 best all-time plays that contribute to their rating.
 * - B30 (Best 30) for all versions
 */

export const useUserRatingBaseList = (enabled = true) => {
	return useQuery({
		queryKey: ["userRatingBaseList"],
		queryFn: async () => {
			const response = await api.chunithm.rating.user_rating_base_list.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch best 30 rating")
			}

			return await response.json()
		},
		enabled
	})
}

/**
 * Fetches and returns the 20 best plays for the current game version that contribute to the user's rating.
 * - N20 (New 20) for VERSE and above (version >= 17)
 */

export const useUserRatingBaseNewList = (enabled = true) => {
	return useQuery({
		queryKey: ["userRatingBaseNewList"],
		queryFn: async () => {
			const response = await api.chunithm.rating.user_rating_base_new_list.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch new 20 rating")
			}
			return await response.json()
		},
		enabled
	})
}

/**
 * Fetches and returns 10 potential plays that could improve the user's rating.
 * - For versions before VERSE (version < 17): returns userRatingBaseNextList
 * - For VERSE and above (version >= 17): returns userRatingBaseNewNextList
 */

export const useUserRatingBaseNextList = (enabled = true) => {
	return useQuery({
		queryKey: ["userRatingBaseNextList"],
		queryFn: async () => {
			const response = await api.chunithm.rating.user_rating_base_next_list.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch potential rating improvements")
			}

			return await response.json()
		},
		enabled
	})
}

/**
 * Fetches and returns the player's current rating.
 */
export const usePlayerRating = (enabled = true) => {
	return useQuery({
		queryKey: ["playerRating"],
		queryFn: async () => {
			const response = await api.chunithm.rating.playerRating.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch nameplates")
			}

			return await response.json()
		},
		enabled
	})
}

/**
 * Fetches and returns the player's highest achieved rating.
 */
export const useHighestRating = (enabled = true) => {
	return useQuery({
		queryKey: ["highestRating"],
		queryFn: async () => {
			const response = await api.chunithm.rating.highestRating.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch nameplates")
			}

			return await response.json()
		},
		enabled
	})
}
