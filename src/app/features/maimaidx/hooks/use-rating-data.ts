import type { MaimaiRating } from "@/app/shared/types"
import { calculateMaimaiRating } from "@/app/shared/utils/maimai"
import { convertMaimaiRating } from "@/app/shared/utils/profile-rating-utils"

import { usePlayerRating, useUserRatingBaseList, useUserRatingNewList } from "./use-rating"

type MaimaiRatingInput = Omit<MaimaiRating, "difficulty" | "rating"> & {
	difficulty: number | null
}

type MaimaiRatingWithCalculated = MaimaiRating & {
	rating: number
}

const calculateSongRating = (song: MaimaiRatingInput): MaimaiRatingWithCalculated => {
	const difficulty = song.difficulty ?? 0
	const achievement = song.achievement ?? 0
	return {
		...song,
		difficulty,
		rating: calculateMaimaiRating(difficulty, achievement)
	}
}

const useMaimaiDxRatingData = (activeTab: string = "base") => {
	const isBaseTab = activeTab === "base"
	const isNewTab = activeTab === "new"

	const { data: ratingData = [] } = usePlayerRating(true)
	const { data: baseSongs = [], isLoading: isLoadingBase } = useUserRatingBaseList(isBaseTab)
	const { data: newSongs = [], isLoading: isLoadingNew } = useUserRatingNewList(isNewTab)

	const baseRatings = baseSongs.map(calculateSongRating)
	const newRatings = newSongs.map(calculateSongRating)

	const playerRatingValue = convertMaimaiRating(ratingData[0]?.playerRating ?? null)
	const highestRatingValue = convertMaimaiRating(ratingData[0]?.highestRating ?? null)

	return {
		activeData: isNewTab ? newRatings : baseRatings,
		isLoading: isNewTab ? isLoadingNew : isLoadingBase,
		playerRatingValue,
		highestRatingValue
	}
}

export default useMaimaiDxRatingData
