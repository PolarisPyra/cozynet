import { OngekiGekForceRating, OngekiRating } from "@/app/shared/utils/ongeki"

interface ScoreRatingInput {
	playerRating?: number | null
	techScore?: number | null
	level?: number | null
	isFullCombo?: number
	isAllBreak?: number
	isFullBell?: number
	version: number
}

export const useOngekiScoreRating = function(input: ScoreRatingInput) {
	const isRefresh = input.version >= 8

	const calculatedRating =
		input.playerRating && input.playerRating > 0
			? isRefresh
				? input.playerRating / 1000
				: input.playerRating / 100
			: input.techScore != null && input.level != null
				? isRefresh
					? OngekiGekForceRating(
							input.level,
							input.techScore,
							input.isFullCombo ?? 0,
							input.isAllBreak ?? 0,
							input.isFullBell ?? 0
						) / 1000
					: OngekiRating(input.level, input.techScore) / 100
				: null

	return { calculatedRating, isRefresh }
}
