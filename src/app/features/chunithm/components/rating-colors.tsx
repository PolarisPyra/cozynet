import React from "react"

import { TierConfig, getColorName, getRatingStyle, getTier } from "@/app/shared/utils/rating-utils"

const CHUNITHM_TIERS_OLD: readonly TierConfig[] = [
	{
		threshold: 17000,
		name: "Rainbow",
		textStyle: {
			background: "linear-gradient(to bottom, #FFFF00 25%, #FF1493 40%, #0066FF 60%, #00E5CC 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		}
	},
	{
		threshold: 15000,
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
		threshold: 14000,
		name: "Gold",
		textStyle: {
			background: "linear-gradient(to bottom, #efba00 28%, #fff8c9 50%, #cd7200 51%, #fff8c9 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		}
	},
	{
		threshold: 13000,
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

const CHUNITHM_TIERS_NEW: readonly TierConfig[] = [
	{
		threshold: 17000,
		name: "Rainbow (極)",
		textStyle: {
			background: "linear-gradient(to bottom, #FFFF00 25%, #FF1493 40%, #0066FF 60%, #00E5CC 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		}
	},
	{
		threshold: 16750,
		name: "Rainbow (★★★★)",
		textStyle: {
			background: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		}
	},
	{
		threshold: 16500,
		name: "Rainbow (★★★)",
		textStyle: {
			background: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		}
	},
	{
		threshold: 16250,
		name: "Rainbow (★★)",
		textStyle: {
			background: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		}
	},
	{
		threshold: 16000,
		name: "Rainbow (★)",
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
			background: "linear-gradient(to bottom, #e5e4e2 28%, #f8f8f8 50%, #c0c0c0 51%, #f8f8f8 80%)",
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
			background: "linear-gradient(to bottom, #cd7f32 25%, #8b4513 50%, #cd7f32 51%, #8b4513 75%)",
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

const getChunithmTiers = (version: number): readonly TierConfig[] => {
	return version >= 11 ? CHUNITHM_TIERS_NEW : CHUNITHM_TIERS_OLD
}

export const getChunithmTier = (rating: number, version: number): number => {
	const tiers = getChunithmTiers(version)
	return getTier(rating, tiers)
}

export const getChunithmColorName = (rating: number, version: number): string => {
	const tiers = getChunithmTiers(version)
	return getColorName(rating, tiers)
}

export const getChunithmRatingStyle = (rating: number, version: number): React.CSSProperties => {
	const tiers = getChunithmTiers(version)
	return getRatingStyle(rating, tiers)
}

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
