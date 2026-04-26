import { useMemo, useState } from "react"

import { useScoreLeaderboard } from "@/app/features/ongeki/hooks/use-score-leaderboard"
import { useOngekiScoreRating } from "@/app/features/ongeki/hooks/use-score-rating"
import { useCurrentUser } from "@/app/shared/hooks/users/use-current-user"
import { OngekiPlaylog } from "@/app/shared/types"
import { formatOngekiScorePlaylogDate } from "@/app/shared/utils/ongeki"
import { getOngekiLogo } from "@/app/shared/utils/version-logos"

interface UseOngekiScoreCardProps {
	score: OngekiPlaylog
	ongekiVersion: number
}

export function useOngekiScoreCard({ score, ongekiVersion }: UseOngekiScoreCardProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const currentUser = useCurrentUser()

	const { calculatedRating, isRefresh } = useOngekiScoreRating({
		playerRating: score.playerRating,
		techScore: score.techScore,
		level: score.level,
		isFullCombo: score.isFullCombo,
		isAllBreak: score.isAllBreak,
		isFullBell: score.isFullBell,
		scoreVersion: score.scoreVersion,
		version: ongekiVersion,
		platinumScoreStar: score.platinumScoreStar
	})

	const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useScoreLeaderboard(
		score.musicId ?? 0,
		score.chartId ?? 0,
		100,
		isDialogOpen
	)

	const { data: previewLeaderboardData, isLoading: isLoadingPreviewLeaderboard } = useScoreLeaderboard(
		score.musicId ?? 0,
		score.chartId ?? 0,
		4
	)

	const topFourEntries = previewLeaderboardData?.leaderboard ?? []
	const playDateParts = formatOngekiScorePlaylogDate(score.userPlayDate)

	const songVersionLogo = useMemo(() => {
		return getOngekiLogo.getLogo(score.earliest_version)
	}, [score.earliest_version])

	const metaBadges = [
		...(score.userPlayDate
			? [
				{ key: "date", label: playDateParts.date },
				{ key: "time", label: playDateParts.time }
			]
			: []),
		...(score.isTechNewRecord === 1 ? [{ key: "new-score-record", label: "New Score Record" }] : []),
		...(score.isBattleNewRecord === 1 ? [{ key: "new-battle-record", label: "New Battle Record" }] : [])
	]

	return {
		isDialogOpen,
		setIsDialogOpen,
		currentUser,
		calculatedRating,
		isRefresh,
		leaderboardData,
		isLoadingLeaderboard,
		isLoadingPreviewLeaderboard,
		topFourEntries,
		songVersionLogo,
		metaBadges
	}
}
