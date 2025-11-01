import { ChunithmRatingColors } from "@/components/common/rating-colors"

interface LeaderboardPlayer {
	userName: string
	playerRating: number
	rank: number
}

const LeaderboardCard = ({ score }: { score: LeaderboardPlayer }) => {
	const ratingValue = score.playerRating ? score.playerRating / 100 : 0

	return (
		<div className="bg-card flex items-center justify-between rounded-sm border p-4">
			<div className="flex items-center gap-4">
				<span className="text-primary text-2xl font-bold tabular-nums">#{score.rank}</span>
				<div>
					<div className="text-foreground mb-1 text-base font-bold">{score.userName}</div>
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">Rating:</span>
						<ChunithmRatingColors rating={ratingValue} />
					</div>
				</div>
			</div>
		</div>
	)
}

export default LeaderboardCard
