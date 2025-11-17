import {
	usePlayerRating,
	useUserRatingBaseHotList,
	useUserRatingBaseList,
	useUserRatingBaseNewList,
	useUserRatingBaseNextList
} from "@/app/features/chunithm/hooks"

const useRatingData = (activeTab: string = "base") => {
	// Fetch player rating and highest rating from single endpoint
	const { data: ratingData = [] } = usePlayerRating(true)

	// Only fetch data for active tab
	const shouldFetchBase = activeTab === "base"
	const shouldFetchHot = activeTab === "recent"
	const shouldFetchNew = activeTab === "new"
	const shouldFetchNext = activeTab === "potential"

	const { data: baseSongs = [], isLoading: isLoadingBase } = useUserRatingBaseList(shouldFetchBase)
	const { data: hotSongs = [], isLoading: isLoadingHot } = useUserRatingBaseHotList(shouldFetchHot)
	const { data: newSongs = [], isLoading: isLoadingNew } = useUserRatingBaseNewList(shouldFetchNew)
	const { data: nextSongs = [], isLoading: isLoadingNext } = useUserRatingBaseNextList(shouldFetchNext)

	const getActiveData = (tab: string) => {
		switch (tab) {
			case "base":
				return baseSongs
			case "new":
				return newSongs
			case "recent":
				return hotSongs
			case "potential":
				return nextSongs
			default:
				return baseSongs
		}
	}

	const getActiveLoading = (tab: string) => {
		switch (tab) {
			case "base":
				return isLoadingBase
			case "new":
				return isLoadingNew
			case "recent":
				return isLoadingHot
			case "potential":
				return isLoadingNext
			default:
				return isLoadingBase
		}
	}

	const playerRatingValue = (ratingData[0]?.playerRating ?? 0) / 100
	const highestRatingValue = (ratingData[0]?.highestRating ?? 0) / 100

	return {
		getActiveData,
		getActiveLoading,
		playerRatingValue,
		highestRatingValue
	}
}

export default useRatingData
