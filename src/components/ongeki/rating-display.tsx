import { OngekiRatingColors } from "@/components/common/rating-colors";

interface OngekiRatingDisplayProps {
	playerRating: number;
	highestRating: number;
	ratingDecimals: number;
	isRefreshOrAbove?: boolean;
}

const OngekiRatingDisplay = ({
	playerRating,
	highestRating,
	ratingDecimals,
	isRefreshOrAbove,
}: OngekiRatingDisplayProps) => {
	return (
		<div className="flex flex-col gap-1">
			<div className="flex flex-col">
				<div className="flex items-center gap-2">
					<span className="font-bold">Player Rating:</span>
					{playerRating > 0 ? (
						<OngekiRatingColors rating={playerRating} decimals={ratingDecimals} isRefresh={isRefreshOrAbove} />
					) : (
						<span className="font-bold">Loading...</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					<span className="font-bold">Highest Rating:</span>
					{highestRating > 0 ? (
						<OngekiRatingColors rating={highestRating} decimals={ratingDecimals} isRefresh={isRefreshOrAbove} />
					) : (
						<span className="font-bold">Loading...</span>
					)}
				</div>
			</div>
		</div>
	);
};

export default OngekiRatingDisplay;
