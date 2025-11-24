import { useOngekiVersion } from "@/app/features/ongeki/hooks"
import { OngekiRatingColors } from "@/app/features/ongeki/components/rating-colors"
import { convertOngekiScoreRating } from "@/app/shared/utils/profile-rating-utils"

interface LeaderboardPlayer {
	userName: string
	playerRating: number
	newPlayerRating: number | null
	rank: number
}

export const LeaderboardCard = function ({ score }: { score: LeaderboardPlayer }) {
	const version = useOngekiVersion()
	const isRefreshOrAbove = Number(version) >= 8
	const playerRatingToUse = isRefreshOrAbove && score.newPlayerRating !== null ? score.newPlayerRating : score.playerRating
	const { rating: ratingValue, decimals } = convertOngekiScoreRating(playerRatingToUse, isRefreshOrAbove)
	const displayRating = ratingValue ?? 0

	return (
		<div className="bg-card flex items-center justify-between rounded-sm border p-4">
			<div className="flex items-center gap-4">
				<span className="text-primary text-2xl font-bold tabular-nums">#{score.rank}</span>
				<div>
					<div className="text-foreground mb-1 text-base font-bold">{score.userName}</div>
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">Rating:</span>
						{displayRating > 0 && version ? (
							<OngekiRatingColors rating={displayRating} version={version} decimals={decimals} />
						) : (
							<span className="text-foreground text-sm font-medium">-</span>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default LeaderboardCard

