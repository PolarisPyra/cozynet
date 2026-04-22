import { calculateOngekiGekForceRating, calculateOngekiRating } from "@/app/shared/utils/ongeki"
import { convertOngekiScoreRating } from "@/app/shared/utils/profile-rating-utils"

interface ScoreRatingInput {
	playerRating?: number | null
	techScore?: number | null
	level?: number | null
	isFullCombo?: number
	isAllBreak?: number
	isFullBell?: number
	scoreVersion?: number | null
	version: number
	platinumScoreStar?: number | null
}

export const useOngekiScoreRating = function (input: ScoreRatingInput) {
	const scoreVersion = input.scoreVersion ?? input.version
	const isRefresh = scoreVersion >= 8

	// Prefer recalculating from score data so imported rows render consistently
	// even if the stored playerRating format differs.
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

	if (input.playerRating && input.playerRating > 0) {
		const { rating } = convertOngekiScoreRating(input.playerRating, isRefresh)
		return { calculatedRating: rating, isRefresh }
	}

	return { calculatedRating: null, isRefresh }
}
