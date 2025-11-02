import React from "react"

import { TierConfig, getColorName, getRatingStyle, getTier } from "@/utils/rating-utils"

const ONGEKI_TIERS_OLD: readonly TierConfig[] = [
	{
		threshold: 16000,
		name: "Rainbow",
		textStyle: {
			background: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		}
	},
	{
		threshold: 15250,
		name: "Platinum",
		textStyle: {
			background: "linear-gradient(to bottom, #ffe387 28%, #fff8c9 50%, #ffce68 51%, #fff8c9 80%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		}
	},
	{
		threshold: 14500,
		name: "Gold",
		textStyle: {
			background: "linear-gradient(to bottom, #efba00 28%, #fff8c9 50%, #cd7200 51%, #fff8c9 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		}
	},
	{
		threshold: 13250,
		name: "Silver",
		textStyle: {
			background: "linear-gradient(to bottom, #525151 30%, #cbc9c9 50%, #cbc9c9 51%, #525151 60%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
			textShadow: "1px 1px 1px rgba(0, 0, 0, 0.1)"
		}
	},
	{
		threshold: 12000,
		name: "Bronze",
		textStyle: {
			background: "linear-gradient(to bottom, #ffa200 25%, #c64000 50%, #ffa200 51%, #c64000 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
			textShadow: "1px 1px 1px rgba(0, 0, 0, 0.1)"
		}
	},
	{
		threshold: 10000,
		name: "Purple",
		textStyle: {
			color: "#ba00ef"
		}
	},
	{
		threshold: 7000,
		name: "Red",
		textStyle: {
			color: "#ef2d00"
		}
	},
	{
		threshold: 4000,
		name: "Orange",
		textStyle: {
			color: "#ef9d00"
		}
	},
	{
		threshold: 0,
		name: "Green",
		textStyle: {
			color: "#00d747"
		}
	}
] as const

const ONGEKI_TIERS_REFRESH: readonly TierConfig[] = [
	{
		threshold: 21000,
		name: "Rainbow",
		textStyle: {
			background: "linear-gradient(135deg, #f7fe12 0%, #00ffff 50%, #fe70d3 100%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		}
	},
	{
		threshold: 20000,
		name: "Rainbow",
		textStyle: {
			background: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
			filter: "drop-shadow(0 0 2px rgba(247, 254, 18, 0.4)) drop-shadow(0 0 4px rgba(0, 255, 255, 0.3))"
		}
	},
	{
		threshold: 19000,
		name: "Rainbow",
		textStyle: {
			background: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		}
	},
	{
		threshold: 18000,
		name: "Rainbow",
		textStyle: {
			background: "linear-gradient(to bottom, #ffe387 28%, #fff8c9 50%, #ffce68 51%, #fff8c9 80%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		}
	},
	{
		threshold: 17000,
		name: "Gold",
		textStyle: {
			background: "linear-gradient(to bottom, #efba00 28%, #fff8c9 50%, #cd7200 51%, #fff8c9 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		}
	},
	{
		threshold: 15000,
		name: "Silver",
		textStyle: {
			background: "linear-gradient(to bottom, #525151 30%, #cbc9c9 50%, #cbc9c9 51%, #525151 60%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
			textShadow: "1px 1px 1px rgba(0, 0, 0, 0.1)"
		}
	},
	{
		threshold: 13000,
		name: "Bronze",
		textStyle: {
			background: "linear-gradient(to bottom, #ffa200 25%, #c64000 50%, #ffa200 51%, #c64000 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
			textShadow: "1px 1px 1px rgba(0, 0, 0, 0.1)"
		}
	},
	{
		threshold: 11000,
		name: "Purple",
		textStyle: {
			color: "#ba00ef"
		}
	},
	{
		threshold: 9000,
		name: "Red",
		textStyle: {
			color: "#ef2d00"
		}
	},
	{
		threshold: 7000,
		name: "Orange",
		textStyle: {
			color: "#ef9d00"
		}
	},
	{
		threshold: 4000,
		name: "Green",
		textStyle: {
			color: "#00d747"
		}
	},
	{
		threshold: 0,
		name: "Cyan",
		textStyle: {
			color: "#00b6bd"
		}
	}
] as const

const getOngekiTiers = (version: number): readonly TierConfig[] => {
	return version >= 8 ? ONGEKI_TIERS_REFRESH : ONGEKI_TIERS_OLD
}

export const getOngekiTier = (rating: number, version: number): number => {
	const tiers = getOngekiTiers(version)
	return getTier(rating, tiers)
}

export const getOngekiColorName = (rating: number, version: number): string => {
	const tiers = getOngekiTiers(version)
	return getColorName(rating, tiers)
}

export const getOngekiRatingStyle = (rating: number, version: number): React.CSSProperties => {
	const tiers = getOngekiTiers(version)
	return getRatingStyle(rating, tiers)
}

export const OngekiRatingColors: React.FC<{ rating: number; version: number; decimals?: number }> = ({
	rating,
	version,
	decimals = 2
}) => {
	const ratingString = rating.toFixed(decimals)
	const style = getOngekiRatingStyle(rating, version)
	const tier = getOngekiTier(rating, version)

	return (
		<span key={`ongeki-${version}-${tier}`} className="font-bold" style={style}>
			{ratingString}
		</span>
	)
}
