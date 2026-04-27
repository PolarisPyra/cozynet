import { useMemo, useState } from "react"

import { useScoreLeaderboard } from "@/app/features/chunithm/hooks/use-score-leaderboard"
import { ChunithmPlaylog } from "@/app/shared/types"
import {
	convertRomVersionToVersion,
	formatSqlDateToLocalParts,
	levelToStars
} from "@/app/shared/utils/chunithm"
import { convertChunithmScoreRating } from "@/app/shared/utils/profile-rating-utils"
import { getChunithmLogo } from "@/app/shared/utils/version-logos"

interface UseChunithmScoreCardProps {
	score: ChunithmPlaylog
}

export function useChunithmScoreCard({ score }: UseChunithmScoreCardProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)

	const { scoreVersionId, scoreVersionLogo, songVersionLogo, ratingValue, isWorldsEnd, starCount } = useMemo(() => {
		const versionId = convertRomVersionToVersion(score.romVersion)
		const storedRating = convertChunithmScoreRating(score.playerRating)

		return {
			scoreVersionId: versionId,
			scoreVersionLogo: getChunithmLogo.getLogo(versionId),
			songVersionLogo: getChunithmLogo.getLogo(score.songVersion),
			ratingValue: storedRating,
			isWorldsEnd: score.chartId === 5,
			starCount: levelToStars(score.level)
		}
	}, [score.romVersion, score.songVersion, score.playerRating, score.chartId, score.level])

	const { data: previewLeaderboardData, isLoading: isLoadingPreviewLeaderboard } = useScoreLeaderboard(
		score.musicId ?? 0,
		score.chartId ?? 0,
		4
	)

	const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useScoreLeaderboard(
		score.musicId ?? 0,
		score.chartId ?? 0,
		100,
		isDialogOpen
	)

	const topFourEntries = previewLeaderboardData?.leaderboard ?? []
	const playDateParts = formatSqlDateToLocalParts(score.userPlayDate)

	const metaBadges = [
		...(score.userPlayDate
			? [
				{ key: "date", label: playDateParts.date },
				{ key: "time", label: playDateParts.time }
			]
			: []),
		...(score.isNewRecord === 1 ? [{ key: "new-record", label: "New Record" }] : []),
		...(score.skillName ? [{ key: "skill", label: score.skillName }] : [])
	]

	return {
		isDialogOpen,
		setIsDialogOpen,
		scoreVersionId,
		scoreVersionLogo,
		songVersionLogo,
		ratingValue,
		isWorldsEnd,
		starCount,
		leaderboardData,
		isLoadingLeaderboard,
		isLoadingPreviewLeaderboard,
		topFourEntries,
		metaBadges
	}
}
