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

	if (input.playerRating && input.playerRating > 0) {
		const { rating } = convertOngekiScoreRating(input.playerRating, isRefresh)
		return { calculatedRating: rating, isRefresh }
	}

	return { calculatedRating: null, isRefresh }
}
