import { useMemo } from "react"

import { calculateOngekiGekForceRating, calculateOngekiRating } from "@/app/shared/utils/ongeki"
import { convertOngekiScoreRating } from "@/app/shared/utils/profile-rating-utils"

interface RatingInfoInput {
	playerRating?: number | null
	techScore?: number | null
	level?: number | null
	isFullCombo?: number
	isAllBreak?: number
	isFullBell?: number
	ongekiVersion?: number
}

export const useOngekiRatingInfo = function (input: RatingInfoInput) {
	const isRefresh = (input.ongekiVersion ?? 8) >= 8

	const calculatedRating = useMemo(() => {
		// If we have a stored playerRating, convert it using the shared utility
		if (input.playerRating && input.playerRating > 0) {
			const { rating } = convertOngekiScoreRating(input.playerRating, isRefresh)
			return rating
		}

		// Otherwise, calculate from techScore and level
		if (input.techScore != null && input.level != null) {
			return isRefresh
				? calculateOngekiGekForceRating(
						input.level,
						input.techScore,
						input.isFullCombo ?? 0,
						input.isAllBreak ?? 0,
						input.isFullBell ?? 0
					) / 1000
				: calculateOngekiRating(input.level, input.techScore) / 100
		}

		return null
	}, [
		input.playerRating,
		input.techScore,
		input.level,
		input.isFullCombo,
		input.isAllBreak,
		input.isFullBell,
		isRefresh
	])

	return { calculatedRating, isRefresh }
}
