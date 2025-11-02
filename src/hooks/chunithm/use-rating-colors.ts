import { useMemo } from "react"

import {
	getChunithmColorBackground,
	getChunithmColorBadgeColor,
	getChunithmColorName,
	getChunithmRatingStyle,
	getChunithmTier
} from "@/components/common/rating-colors"

import { useChunithmVersion } from "./use-version"

export interface ChunithmRatingColor {
	colorName: string
	backgroundStyle: React.CSSProperties
	badgeColor: string
	textStyle: React.CSSProperties
	tier: number
}

/**
 * Hook to get Chunithm rating color information based on rating and version.
 * Automatically uses the appropriate tier system (old for version < 11, new for version >= 11).
 *
 * @param rating - The rating value (e.g., 13.50)
 * @param version - Optional version override. If not provided, uses the current user's version.
 * @returns Rating color information or null if rating is invalid
 *
 * @example
 * ```tsx
 * const { colorName, textStyle } = useChunithmRatingColor(13.50)
 * return <span style={textStyle}>{colorName}</span>
 * ```
 */
export const useChunithmRatingColor = function (rating: number, version?: number): ChunithmRatingColor | null {
	const currentVersion = useChunithmVersion()
	const effectiveVersion = version ?? currentVersion

	return useMemo(() => {
		if (rating <= 0 || !effectiveVersion) return null

		return {
			colorName: getChunithmColorName(rating, effectiveVersion),
			backgroundStyle: getChunithmColorBackground(rating, effectiveVersion),
			badgeColor: getChunithmColorBadgeColor(rating, effectiveVersion),
			textStyle: getChunithmRatingStyle(rating, effectiveVersion),
			tier: getChunithmTier(rating, effectiveVersion)
		}
	}, [rating, effectiveVersion])
}
