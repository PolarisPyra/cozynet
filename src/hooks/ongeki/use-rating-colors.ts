import { useMemo } from "react"

import { getOngekiColorName, getOngekiRatingStyle, getOngekiTier } from "@/components/ongeki/rating-colors"

import { useOngekiVersion } from "./use-version"

export interface OngekiRatingColor {
	colorName: string
	textStyle: React.CSSProperties
	tier: number
}

/**
 * Hook to get Ongeki rating color information based on rating and version.
 * Automatically uses the appropriate tier system (old for version < 8, refresh for version >= 8).
 *
 * @param rating - The rating value (e.g., 13.50)
 * @param version - Optional version override. If not provided, uses the current user's version.
 * @returns Rating color information or null if rating is invalid
 *
 * @example
 * ```tsx
 * const { colorName, textStyle } = useOngekiRatingColor(13.50)
 * return <span style={textStyle}>{colorName}</span>
 * ```
 */
export const useOngekiRatingColor = function (rating: number, version?: number): OngekiRatingColor | null {
	const currentVersion = useOngekiVersion()
	const effectiveVersion = version ?? currentVersion

	return useMemo(() => {
		if (rating <= 0 || !effectiveVersion) return null

		return {
			colorName: getOngekiColorName(rating, effectiveVersion),
			textStyle: getOngekiRatingStyle(rating, effectiveVersion),
			tier: getOngekiTier(rating, effectiveVersion)
		}
	}, [rating, effectiveVersion])
}
