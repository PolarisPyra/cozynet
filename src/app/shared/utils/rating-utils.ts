import React from "react"

export interface TierConfig {
	threshold: number
	name: string
	textStyle: React.CSSProperties
}

export const ratingToInt = (rating: number): number => Math.floor(rating * 1000)

export const getTierFromConfig = (ratingInt: number, tiers: readonly TierConfig[]): TierConfig => {
	return tiers.find(tier => ratingInt >= tier.threshold) || tiers[tiers.length - 1]
}

export const getTier = (rating: number, tiers: readonly TierConfig[]): number => {
	const ratingInt = ratingToInt(rating)
	const tier = getTierFromConfig(ratingInt, tiers)
	return tiers.indexOf(tier)
}

export const getColorName = (rating: number, tiers: readonly TierConfig[]): string => {
	const ratingInt = ratingToInt(rating)
	return getTierFromConfig(ratingInt, tiers).name
}

export const getRatingStyle = (rating: number, tiers: readonly TierConfig[]): React.CSSProperties => {
	const ratingInt = ratingToInt(rating)
	return getTierFromConfig(ratingInt, tiers).textStyle
}
