import { useChunithmVersion } from "@/hooks/chunithm"

import { ChunithmRatingColors } from "./rating-colors"

export const RatingDisplay = function ({ playerRating, highestRating }: RatingDisplayProps) {
	const version = useChunithmVersion()

	return (
		<div className="flex flex-col gap-1">
			<div className="flex flex-col">
				<div className="flex items-center gap-2">
					<span className="font-bold">Player Rating:</span>
					{playerRating > 0 && version ? (
						<ChunithmRatingColors rating={playerRating} version={version} />
					) : (
						<span className="font-bold">Loading...</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					<span className="font-bold">Highest Rating:</span>
					{highestRating > 0 && version ? (
						<ChunithmRatingColors rating={highestRating} version={version} />
					) : (
						<span className="font-bold">Loading...</span>
					)}
				</div>
			</div>
		</div>
	)
}

export default RatingDisplay

interface RatingDisplayProps {
	playerRating: number
	highestRating: number
}
