import { useMemo } from "react"
import { OngekiGekForceRating, OngekiRating } from "@/utils/ongeki"

interface RatingInfoInput {
	playerRating?: number | null
	techScore?: number | null
	level?: number | null
	isFullCombo?: number
	isAllBreak?: number
	isFullBell?: number
	ongekiVersion?: number
}

export const useOngekiRatingInfo = function(input: RatingInfoInput) {
	const isRefresh = (input.ongekiVersion ?? 8) >= 8

	const calculatedRating = useMemo(() => {
		if (input.playerRating && input.playerRating > 0) {
			return isRefresh ? input.playerRating / 1000 : input.playerRating / 100
		}

		if (input.techScore != null && input.level != null) {
			return isRefresh
				? OngekiGekForceRating(
						input.level,
						input.techScore,
						input.isFullCombo ?? 0,
						input.isAllBreak ?? 0,
						input.isFullBell ?? 0
					) / 1000
				: OngekiRating(input.level, input.techScore) / 100
		}

		return null
	}, [input.playerRating, input.techScore, input.level, input.isFullCombo, input.isAllBreak, input.isFullBell, isRefresh])

	return { calculatedRating, isRefresh }
}
