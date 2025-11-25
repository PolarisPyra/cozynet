import { calculateOngekiGekForceRating, calculateOngekiRating } from "@/app/shared/utils/ongeki"
import { convertOngekiScoreRating } from "@/app/shared/utils/profile-rating-utils"

interface ScoreRatingInput {
	playerRating?: number | null
	techScore?: number | null
	level?: number | null
	isFullCombo?: number
	isAllBreak?: number
	isFullBell?: number
	version: number
	platinumScoreStar?: number | null
}

export const useOngekiScoreRating = function (input: ScoreRatingInput) {
	// Determine if this is Refresh based on platinumScoreStar presence, not user's version
	// Scores with platinumScoreStar are from Refresh (v8+), scores without are pre-Refresh
	const isRefresh = input.platinumScoreStar != null

	// If we have a stored playerRating, convert it using the shared utility
	if (input.playerRating && input.playerRating > 0) {
		const { rating } = convertOngekiScoreRating(input.playerRating, isRefresh)
		return { calculatedRating: rating, isRefresh }
	}

	// Otherwise, calculate from techScore and level
	if (input.techScore != null && input.level != null) {
		const calculatedRating = isRefresh
			? calculateOngekiGekForceRating(
					input.level,
					input.techScore,
					input.isFullCombo ?? 0,
					input.isAllBreak ?? 0,
					input.isFullBell ?? 0
				) / 1000
			: calculateOngekiRating(input.level, input.techScore) / 100

		return { calculatedRating, isRefresh }
	}

	return { calculatedRating: null, isRefresh }
}
