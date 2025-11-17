import { useOngekiVersion } from "@/app/features/ongeki/hooks"

import { OngekiRatingColors } from "./rating-colors"

interface OngekiRatingDisplayProps {
	playerRating: number
	highestRating: number
	ratingDecimals: number
}

export function OngekiRatingDisplay({ playerRating, highestRating, ratingDecimals }: OngekiRatingDisplayProps) {
	const version = useOngekiVersion()

	return (
		<div className="flex flex-col gap-1">
			<div className="flex flex-col">
				<div className="flex items-center gap-2">
					<span className="font-bold">Player Rating:</span>
					{playerRating > 0 && version ? (
						<OngekiRatingColors rating={playerRating} version={version} decimals={ratingDecimals} />
					) : (
						<span className="font-bold">Loading...</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					<span className="font-bold">Highest Rating:</span>
					{highestRating > 0 && version ? (
						<OngekiRatingColors rating={highestRating} version={version} decimals={ratingDecimals} />
					) : (
						<span className="font-bold">Loading...</span>
					)}
				</div>
			</div>
		</div>
	)
}
