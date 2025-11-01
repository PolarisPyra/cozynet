import { ChunithmRatingColors } from "@/components/common/rating-colors"

interface RatingDisplayProps {
	playerRating: number
	highestRating: number
}

const RatingDisplay = ({ playerRating, highestRating }: RatingDisplayProps) => {
	return (
		<div className="flex flex-col gap-1">
			<div className="flex flex-col">
				<div className="flex items-center gap-2">
					<span className="font-bold">Player Rating:</span>
					{playerRating > 0 ? (
						<ChunithmRatingColors rating={playerRating} />
					) : (
						<span className="font-bold">Loading...</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					<span className="font-bold">Highest Rating:</span>
					{highestRating > 0 ? (
						<ChunithmRatingColors rating={highestRating} />
					) : (
						<span className="font-bold">Loading...</span>
					)}
				</div>
			</div>
		</div>
	)
}

export default RatingDisplay
