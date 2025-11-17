import {
	useNewPlayerRating,
	usePlayerRating,
	useUserNewRatingBaseBestList,
	useUserNewRatingBaseBestNewList,
	useUserNewRatingBaseNextBestList,
	useUserRatingBaseHotList,
	useUserRatingBaseList,
	useUserRatingBaseNewList,
	useUserRatingBaseNextList
} from "@/app/features/ongeki/hooks"
import { useUserNewRatingBasePScoreList } from "@/app/features/ongeki/hooks/use-new-rating"

const useOngekiRatingData = (version: number, activeTab: string = "base") => {
	const isRefreshOrAbove = version >= 8

	// Only fetch the rating endpoints based on version (not both old and new)
	// Single endpoint returns both playerRating and highestRating
	const { data: playerRating = [] } = usePlayerRating(!isRefreshOrAbove)
	const { data: newPlayerRating = [] } = useNewPlayerRating(isRefreshOrAbove)

	// Determine which queries to enable based on activeTab and version
	const shouldFetchBase = activeTab === "base" && !isRefreshOrAbove
	const shouldFetchHot = activeTab === "current" && !isRefreshOrAbove
	const shouldFetchNew = activeTab === "recent"
	const shouldFetchNext = activeTab === "next" && !isRefreshOrAbove
	const shouldFetchNewBase = activeTab === "base" && isRefreshOrAbove
	const shouldFetchNewNew = activeTab === "current" && isRefreshOrAbove
	const shouldFetchNewNext = activeTab === "next" && isRefreshOrAbove
	const shouldFetchPScore = activeTab === "pscore"

	// Only fetch data for active tab
	const { data: baseSongs = [], isLoading: isLoadingBase } = useUserRatingBaseList(shouldFetchBase)
	const { data: hotSongs = [], isLoading: isLoadingHot } = useUserRatingBaseHotList(shouldFetchHot)
	const { data: newSongs = [], isLoading: isLoadingNew } = useUserRatingBaseNewList(shouldFetchNew)
	const { data: nextSongs = [], isLoading: isLoadingNext } = useUserRatingBaseNextList(shouldFetchNext)

	const { data: newBaseSongs = [], isLoading: isLoadingNewBase } = useUserNewRatingBaseBestList(shouldFetchNewBase)
	const { data: newNewSongs = [], isLoading: isLoadingNewNew } = useUserNewRatingBaseBestNewList(shouldFetchNewNew)
	const { data: newNextSongs = [], isLoading: isLoadingNewNext } = useUserNewRatingBaseNextBestList(shouldFetchNewNext)
	const { data: newPscoreSongs = [], isLoading: isLoadingPScore } = useUserNewRatingBasePScoreList(shouldFetchPScore)

	const getActiveData = (tab: string) => {
		switch (tab) {
			case "base":
				return isRefreshOrAbove ? newBaseSongs : baseSongs
			case "current":
				return isRefreshOrAbove ? newNewSongs : hotSongs
			case "recent":
				return newSongs
			case "next":
				return isRefreshOrAbove ? newNextSongs : nextSongs
			case "pscore":
				return newPscoreSongs
			default:
				return isRefreshOrAbove ? newBaseSongs : baseSongs
		}
	}

	const getActiveLoading = (tab: string) => {
		switch (tab) {
			case "base":
				return isRefreshOrAbove ? isLoadingNewBase : isLoadingBase
			case "current":
				return isRefreshOrAbove ? isLoadingNewNew : isLoadingHot
			case "recent":
				return isLoadingNew
			case "next":
				return isRefreshOrAbove ? isLoadingNewNext : isLoadingNext
			case "pscore":
				return isLoadingPScore
			default:
				return isRefreshOrAbove ? isLoadingNewBase : isLoadingBase
		}
	}

	const playerRatingValue = isRefreshOrAbove
		? (newPlayerRating[0]?.newPlayerRating ?? 0) / 1000
		: (playerRating[0]?.playerRating ?? 0) / 100

	const highestRatingValue = isRefreshOrAbove
		? (newPlayerRating[0]?.newHighestRating ?? 0) / 1000
		: (playerRating[0]?.highestRating ?? 0) / 100

	const ratingDecimals = isRefreshOrAbove ? 3 : 2

	return {
		getActiveData,
		getActiveLoading,
		playerRatingValue,
		highestRatingValue,
		ratingDecimals,
		isRefreshOrAbove
	}
}

export default useOngekiRatingData
