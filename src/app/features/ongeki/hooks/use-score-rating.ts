import { OngekiGekForceRating, OngekiRating } from "@/app/shared/utils/ongeki"
import { convertOngekiScoreRating } from "@/app/shared/utils/profile-rating-utils"

interface ScoreRatingInput {
	playerRating?: number | null
	techScore?: number | null
	level?: number | null
	isFullCombo?: number
	isAllBreak?: number
	isFullBell?: number
	version: number
}

export const useOngekiScoreRating = function (input: ScoreRatingInput) {
	const isRefresh = input.version >= 8

	// If we have a stored playerRating, convert it using the shared utility
	if (input.playerRating && input.playerRating > 0) {
		const { rating } = convertOngekiScoreRating(input.playerRating, isRefresh)
		return { calculatedRating: rating, isRefresh }
	}

	// Otherwise, calculate from techScore and level
	if (input.techScore != null && input.level != null) {
		const calculatedRating = isRefresh
			? OngekiGekForceRating(
					input.level,
					input.techScore,
					input.isFullCombo ?? 0,
					input.isAllBreak ?? 0,
					input.isFullBell ?? 0
				) / 1000
			: OngekiRating(input.level, input.techScore) / 100

		return { calculatedRating, isRefresh }
	}

	return { calculatedRating: null, isRefresh }
}
