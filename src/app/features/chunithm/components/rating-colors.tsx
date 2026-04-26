import React from "react"
import { getChunithmRatingStyle, getChunithmTier } from "../utils/rating"

export const ChunithmRatingColors: React.FC<{ rating: number; version: number }> = ({ rating, version }) => {
	const ratingString = rating.toFixed(2)
	const style = getChunithmRatingStyle(rating, version)
	const tier = getChunithmTier(rating, version)

	return (
		<span key={`chunithm-${version}-${tier}`} className="font-bold" style={style}>
			{ratingString}
		</span>
	)
}
