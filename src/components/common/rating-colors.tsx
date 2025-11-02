import React from "react"

interface TierConfig {
	threshold: number
	name: string
	backgroundColor: string
	textStyle: React.CSSProperties
	badgeColor: string
}

// ============================================================================
// CHUNITHM TIERS
// ============================================================================

const CHUNITHM_TIERS_OLD: readonly TierConfig[] = [
	{
		threshold: 17000,
		name: "Rainbow",
		backgroundColor: "linear-gradient(to bottom, #FFFF00 25%, #FF1493 40%, #0066FF 60%, #00E5CC 75%)",
		textStyle: {
			background: "linear-gradient(to bottom, #FFFF00 25%, #FF1493 40%, #0066FF 60%, #00E5CC 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		},
		badgeColor: "#00bfff"
	},
	{
		threshold: 15000,
		name: "Platinum",
		backgroundColor: "linear-gradient(to bottom, #ffe387 28%, #fff8c9 50%, #ffce68 51%, #fff8c9 80%)",
		textStyle: {
			background: "linear-gradient(to bottom, #ffe387 28%, #fff8c9 50%, #ffce68 51%, #fff8c9 80%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		},
		badgeColor: "#ffce68"
	},
	{
		threshold: 14500,
		name: "Gold",
		backgroundColor: "linear-gradient(to bottom, #efba00 28%, #fff8c9 50%, #cd7200 51%, #fff8c9 75%)",
		textStyle: {
			background: "linear-gradient(to bottom, #efba00 28%, #fff8c9 50%, #cd7200 51%, #fff8c9 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		},
		badgeColor: "#efba00"
	},
	{
		threshold: 14000,
		name: "Gold",
		backgroundColor: "linear-gradient(to bottom, #efba00 28%, #fff8c9 50%, #cd7200 51%, #fff8c9 75%)",
		textStyle: {
			background: "linear-gradient(to bottom, #efba00 28%, #fff8c9 50%, #cd7200 51%, #fff8c9 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		},
		badgeColor: "#efba00"
	},
	{
		threshold: 13000,
		name: "Silver",
		backgroundColor: "linear-gradient(to bottom, #525151 30%, #cbc9c9 50%, #cbc9c9 51%, #525151 60%)",
		textStyle: {
			background: "linear-gradient(to bottom, #525151 30%, #cbc9c9 50%, #cbc9c9 51%, #525151 60%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
			textShadow: "1px 1px 1px rgba(0, 0, 0, 0.1)"
		},
		badgeColor: "#cbc9c9"
	},
	{
		threshold: 12000,
		name: "Bronze",
		backgroundColor: "linear-gradient(to bottom, #ffa200 25%, #c64000 50%, #ffa200 51%, #c64000 75%)",
		textStyle: {
			background: "linear-gradient(to bottom, #ffa200 25%, #c64000 50%, #ffa200 51%, #c64000 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
			textShadow: "1px 1px 1px rgba(0, 0, 0, 0.1)"
		},
		badgeColor: "#ffa200"
	},
	{
		threshold: 10000,
		name: "Purple",
		backgroundColor: "#ba00ef",
		textStyle: {
			color: "#ba00ef"
		},
		badgeColor: "#ba00ef"
	},
	{
		threshold: 7000,
		name: "Red",
		backgroundColor: "#ef2d00",
		textStyle: {
			color: "#ef2d00"
		},
		badgeColor: "#ef2d00"
	},
	{
		threshold: 4000,
		name: "Orange",
		backgroundColor: "#ef9d00",
		textStyle: {
			color: "#ef9d00"
		},
		badgeColor: "#ef9d00"
	},
	{
		threshold: 0,
		name: "Green",
		backgroundColor: "#00d747",
		textStyle: {
			color: "#00d747"
		},
		badgeColor: "#00d747"
	}
] as const

const CHUNITHM_TIERS_NEW: readonly TierConfig[] = [
	{
		threshold: 17000,
		name: "Rainbow (極)",
		backgroundColor: "linear-gradient(to bottom, #FFFF00 25%, #FF1493 40%, #0066FF 60%, #00E5CC 75%)",
		textStyle: {
			background: "linear-gradient(to bottom, #FFFF00 25%, #FF1493 40%, #0066FF 60%, #00E5CC 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		},
		badgeColor: "#00bfff"
	},
	{
		threshold: 16750,
		name: "Rainbow (★★★★)",
		backgroundColor: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
		textStyle: {
			background: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		},
		badgeColor: "#0d9488"
	},
	{
		threshold: 16500,
		name: "Rainbow (★★★)",
		backgroundColor: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
		textStyle: {
			background: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		},
		badgeColor: "#0d9488"
	},
	{
		threshold: 16250,
		name: "Rainbow (★★)",
		backgroundColor: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
		textStyle: {
			background: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		},
		badgeColor: "#0d9488"
	},
	{
		threshold: 16000,
		name: "Rainbow (★)",
		backgroundColor: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
		textStyle: {
			background: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		},
		badgeColor: "#0d9488"
	},
	{
		threshold: 15250,
		name: "Platinum",
		backgroundColor: "linear-gradient(to bottom, #e5e4e2 28%, #f8f8f8 50%, #c0c0c0 51%, #f8f8f8 80%)",
		textStyle: {
			background: "linear-gradient(to bottom, #e5e4e2 28%, #f8f8f8 50%, #c0c0c0 51%, #f8f8f8 80%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		},
		badgeColor: "#c0c0c0"
	},
	{
		threshold: 14500,
		name: "Gold",
		backgroundColor: "linear-gradient(to bottom, #efba00 28%, #fff8c9 50%, #cd7200 51%, #fff8c9 75%)",
		textStyle: {
			background: "linear-gradient(to bottom, #efba00 28%, #fff8c9 50%, #cd7200 51%, #fff8c9 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		},
		badgeColor: "#efba00"
	},
	{
		threshold: 13250,
		name: "Silver",
		backgroundColor: "linear-gradient(to bottom, #525151 30%, #cbc9c9 50%, #cbc9c9 51%, #525151 60%)",
		textStyle: {
			background: "linear-gradient(to bottom, #525151 30%, #cbc9c9 50%, #cbc9c9 51%, #525151 60%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
			textShadow: "1px 1px 1px rgba(0, 0, 0, 0.1)"
		},
		badgeColor: "#cbc9c9"
	},
	{
		threshold: 12000,
		name: "Bronze",
		backgroundColor: "linear-gradient(to bottom, #cd7f32 25%, #8b4513 50%, #cd7f32 51%, #8b4513 75%)",
		textStyle: {
			background: "linear-gradient(to bottom, #cd7f32 25%, #8b4513 50%, #cd7f32 51%, #8b4513 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
			textShadow: "1px 1px 1px rgba(0, 0, 0, 0.1)"
		},
		badgeColor: "#cd7f32"
	},
	{
		threshold: 10000,
		name: "Purple",
		backgroundColor: "#ba00ef",
		textStyle: {
			color: "#ba00ef"
		},
		badgeColor: "#ba00ef"
	},
	{
		threshold: 7000,
		name: "Red",
		backgroundColor: "#ef2d00",
		textStyle: {
			color: "#ef2d00"
		},
		badgeColor: "#ef2d00"
	},
	{
		threshold: 4000,
		name: "Orange",
		backgroundColor: "#ef9d00",
		textStyle: {
			color: "#ef9d00"
		},
		badgeColor: "#ef9d00"
	},
	{
		threshold: 0,
		name: "Green",
		backgroundColor: "#00d747",
		textStyle: {
			color: "#00d747"
		},
		badgeColor: "#00d747"
	}
] as const

// ============================================================================
// ONGEKI TIERS
// ============================================================================

const ONGEKI_TIERS_OLD: readonly TierConfig[] = [
	{
		threshold: 16000,
		name: "Rainbow",
		backgroundColor: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
		textStyle: {
			background: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		},
		badgeColor: "#0d9488"
	},
	{
		threshold: 15250,
		name: "Platinum",
		backgroundColor: "linear-gradient(to bottom, #ffe387 28%, #fff8c9 50%, #ffce68 51%, #fff8c9 80%)",
		textStyle: {
			background: "linear-gradient(to bottom, #ffe387 28%, #fff8c9 50%, #ffce68 51%, #fff8c9 80%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		},
		badgeColor: "#ffce68"
	},
	{
		threshold: 14500,
		name: "Gold",
		backgroundColor: "linear-gradient(to bottom, #efba00 28%, #fff8c9 50%, #cd7200 51%, #fff8c9 75%)",
		textStyle: {
			background: "linear-gradient(to bottom, #efba00 28%, #fff8c9 50%, #cd7200 51%, #fff8c9 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		},
		badgeColor: "#efba00"
	},
	{
		threshold: 13250,
		name: "Silver",
		backgroundColor: "linear-gradient(to bottom, #525151 30%, #cbc9c9 50%, #cbc9c9 51%, #525151 60%)",
		textStyle: {
			background: "linear-gradient(to bottom, #525151 30%, #cbc9c9 50%, #cbc9c9 51%, #525151 60%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
			textShadow: "1px 1px 1px rgba(0, 0, 0, 0.1)"
		},
		badgeColor: "#cbc9c9"
	},
	{
		threshold: 12000,
		name: "Bronze",
		backgroundColor: "linear-gradient(to bottom, #ffa200 25%, #c64000 50%, #ffa200 51%, #c64000 75%)",
		textStyle: {
			background: "linear-gradient(to bottom, #ffa200 25%, #c64000 50%, #ffa200 51%, #c64000 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
			textShadow: "1px 1px 1px rgba(0, 0, 0, 0.1)"
		},
		badgeColor: "#ffa200"
	},
	{
		threshold: 10000,
		name: "Purple",
		backgroundColor: "#ba00ef",
		textStyle: {
			color: "#ba00ef"
		},
		badgeColor: "#ba00ef"
	},
	{
		threshold: 7000,
		name: "Red",
		backgroundColor: "#ef2d00",
		textStyle: {
			color: "#ef2d00"
		},
		badgeColor: "#ef2d00"
	},
	{
		threshold: 4000,
		name: "Orange",
		backgroundColor: "#ef9d00",
		textStyle: {
			color: "#ef9d00"
		},
		badgeColor: "#ef9d00"
	},
	{
		threshold: 0,
		name: "Green",
		backgroundColor: "#00d747",
		textStyle: {
			color: "#00d747"
		},
		badgeColor: "#00d747"
	}
] as const

const ONGEKI_TIERS_REFRESH: readonly TierConfig[] = [
	{
		threshold: 21000,
		name: "Rainbow",
		backgroundColor: "linear-gradient(135deg, #f7fe12 0%, #00ffff 50%, #fe70d3 100%)",
		textStyle: {
			background: "linear-gradient(135deg, #f7fe12 0%, #00ffff 50%, #fe70d3 100%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		},
		badgeColor: "#00bfff"
	},
	{
		threshold: 20000,
		name: "Rainbow",
		backgroundColor: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
		textStyle: {
			background: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
			filter: "drop-shadow(0 0 2px rgba(247, 254, 18, 0.4)) drop-shadow(0 0 4px rgba(0, 255, 255, 0.3))"
		},
		badgeColor: "#0d9488"
	},
	{
		threshold: 19000,
		name: "Rainbow",
		backgroundColor: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
		textStyle: {
			background: "linear-gradient(to bottom, #f7fe12 40%, #00ffff 34%, #fe70d3 66%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		},
		badgeColor: "#0d9488"
	},
	{
		threshold: 18000,
		name: "Rainbow",
		backgroundColor: "linear-gradient(to bottom, #ffe387 28%, #fff8c9 50%, #ffce68 51%, #fff8c9 80%)",
		textStyle: {
			background: "linear-gradient(to bottom, #ffe387 28%, #fff8c9 50%, #ffce68 51%, #fff8c9 80%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		},
		badgeColor: "#ffce68"
	},
	{
		threshold: 17000,
		name: "Gold",
		backgroundColor: "linear-gradient(to bottom, #efba00 28%, #fff8c9 50%, #cd7200 51%, #fff8c9 75%)",
		textStyle: {
			background: "linear-gradient(to bottom, #efba00 28%, #fff8c9 50%, #cd7200 51%, #fff8c9 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text"
		},
		badgeColor: "#efba00"
	},
	{
		threshold: 15000,
		name: "Silver",
		backgroundColor: "linear-gradient(to bottom, #525151 30%, #cbc9c9 50%, #cbc9c9 51%, #525151 60%)",
		textStyle: {
			background: "linear-gradient(to bottom, #525151 30%, #cbc9c9 50%, #cbc9c9 51%, #525151 60%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
			textShadow: "1px 1px 1px rgba(0, 0, 0, 0.1)"
		},
		badgeColor: "#cbc9c9"
	},
	{
		threshold: 13000,
		name: "Bronze",
		backgroundColor: "linear-gradient(to bottom, #ffa200 25%, #c64000 50%, #ffa200 51%, #c64000 75%)",
		textStyle: {
			background: "linear-gradient(to bottom, #ffa200 25%, #c64000 50%, #ffa200 51%, #c64000 75%)",
			WebkitTextFillColor: "rgba(255, 255, 255, 0)",
			WebkitBackgroundClip: "text",
			backgroundClip: "text",
			textShadow: "1px 1px 1px rgba(0, 0, 0, 0.1)"
		},
		badgeColor: "#ffa200"
	},
	{
		threshold: 11000,
		name: "Purple",
		backgroundColor: "#ba00ef",
		textStyle: {
			color: "#ba00ef"
		},
		badgeColor: "#ba00ef"
	},
	{
		threshold: 9000,
		name: "Red",
		backgroundColor: "#ef2d00",
		textStyle: {
			color: "#ef2d00"
		},
		badgeColor: "#ef2d00"
	},
	{
		threshold: 7000,
		name: "Orange",
		backgroundColor: "#ef9d00",
		textStyle: {
			color: "#ef9d00"
		},
		badgeColor: "#ef9d00"
	},
	{
		threshold: 4000,
		name: "Green",
		backgroundColor: "#00d747",
		textStyle: {
			color: "#00d747"
		},
		badgeColor: "#00d747"
	},
	{
		threshold: 0,
		name: "Cyan",
		backgroundColor: "#00b6bd",
		textStyle: {
			color: "#00b6bd"
		},
		badgeColor: "#00b6bd"
	}
] as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const ratingToInt = (rating: number): number => Math.floor(rating * 1000)

const getTierFromConfig = (ratingInt: number, tiers: readonly TierConfig[]): TierConfig => {
	return tiers.find(tier => ratingInt >= tier.threshold) || tiers[tiers.length - 1]
}

const formatBackgroundStyle = (backgroundColor: string): React.CSSProperties => {
	return backgroundColor.startsWith("linear-gradient") ? { background: backgroundColor } : { backgroundColor }
}

// ============================================================================
// CHUNITHM HELPERS
// ============================================================================

const getChunithmTiers = (version: number): readonly TierConfig[] => {
	return version >= 11 ? CHUNITHM_TIERS_NEW : CHUNITHM_TIERS_OLD
}

export const getChunithmTier = (rating: number, version: number): number => {
	const ratingInt = ratingToInt(rating)
	const tiers = getChunithmTiers(version)
	const tier = getTierFromConfig(ratingInt, tiers)
	return tiers.indexOf(tier)
}

export const getChunithmColorName = (rating: number, version: number): string => {
	const ratingInt = ratingToInt(rating)
	const tiers = getChunithmTiers(version)
	return getTierFromConfig(ratingInt, tiers).name
}

export const getChunithmColorBackground = (rating: number, version: number): React.CSSProperties => {
	const ratingInt = ratingToInt(rating)
	const tiers = getChunithmTiers(version)
	const tier = getTierFromConfig(ratingInt, tiers)
	return formatBackgroundStyle(tier.backgroundColor)
}

export const getChunithmRatingStyle = (rating: number, version: number): React.CSSProperties => {
	const ratingInt = ratingToInt(rating)
	const tiers = getChunithmTiers(version)
	return getTierFromConfig(ratingInt, tiers).textStyle
}

export const getChunithmColorBadgeColor = (rating: number, version: number): string => {
	const ratingInt = ratingToInt(rating)
	const tiers = getChunithmTiers(version)
	return getTierFromConfig(ratingInt, tiers).badgeColor
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

// ============================================================================
// ONGEKI HELPERS
// ============================================================================

const getOngekiTiers = (version: number): readonly TierConfig[] => {
	return version >= 8 ? ONGEKI_TIERS_REFRESH : ONGEKI_TIERS_OLD
}

export const getOngekiTier = (rating: number, version: number): number => {
	const ratingInt = ratingToInt(rating)
	const tiers = getOngekiTiers(version)
	const tier = getTierFromConfig(ratingInt, tiers)
	return tiers.indexOf(tier)
}

export const getOngekiColorName = (rating: number, version: number): string => {
	const ratingInt = ratingToInt(rating)
	const tiers = getOngekiTiers(version)
	return getTierFromConfig(ratingInt, tiers).name
}

export const getOngekiColorBackground = (rating: number, version: number): React.CSSProperties => {
	const ratingInt = ratingToInt(rating)
	const tiers = getOngekiTiers(version)
	const tier = getTierFromConfig(ratingInt, tiers)
	return formatBackgroundStyle(tier.backgroundColor)
}

export const getOngekiRatingStyle = (rating: number, version: number): React.CSSProperties => {
	const ratingInt = ratingToInt(rating)
	const tiers = getOngekiTiers(version)
	return getTierFromConfig(ratingInt, tiers).textStyle
}

export const getOngekiColorBadgeColor = (rating: number, version: number): string => {
	const ratingInt = ratingToInt(rating)
	const tiers = getOngekiTiers(version)
	return getTierFromConfig(ratingInt, tiers).badgeColor
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
