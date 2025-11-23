import { useChunithmVersion } from "@/app/features/chunithm/hooks"
import { convertChunithmRating } from "@/app/shared/utils/profile-rating-utils"

import { ChunithmRatingColors } from "./rating-colors"

export const LeaderboardCard = function ({ score }: { score: LeaderboardPlayer }) {
	const version = useChunithmVersion()
	const ratingValue = convertChunithmRating(score.playerRating) ?? 0

	return (
		<div className="bg-card flex items-center justify-between rounded-sm border p-4">
			<div className="flex items-center gap-4">
				<span className="text-primary text-2xl font-bold tabular-nums">#{score.rank}</span>
				<div>
					<div className="text-foreground mb-1 text-base font-bold">{score.userName}</div>
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">Rating:</span>
						{ratingValue > 0 && version ? (
							<ChunithmRatingColors rating={ratingValue} version={version} />
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

interface LeaderboardPlayer {
	userName: string
	playerRating: number
	rank: number
}
