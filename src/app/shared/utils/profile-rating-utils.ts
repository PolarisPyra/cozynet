import type { DB } from "@/app/shared/types"

/**
 * Profile rating utilities for converting stored integer ratings to display format
 *
 * Database storage formats:
 * - Chunithm: playerRating stored as integer (e.g., 1500 = 15.00)
 * - Ongeki (legacy): playerRating stored as integer (e.g., 1500 = 15.00)
 * - Ongeki (Refresh v8+): newPlayerRating stored as integer (e.g., 15000 = 15.000)
 * - Maimai: playerRating stored as integer and displayed as-is (e.g., 3361 = 3361)
 */

export type ChunithmProfile = Pick<
	DB.ChuniProfileData,
	"version" | "userName" | "level" | "reincarnationNum" | "playerRating" | "playCount" | "lastPlayDate"
>

export type OngekiProfile = Pick<
	DB.OngekiProfileData,
	| "version"
	| "userName"
	| "level"
	| "reincarnationNum"
	| "playerRating"
	| "newPlayerRating"
	| "playCount"
	| "lastPlayDate"
>

export type MaimaiProfile = Pick<
	DB.Mai2ProfileDetail,
	"version" | "userName" | "playerRating" | "playCount" | "lastPlayDate"
>

export interface ProfileRatingResult {
	rating: number | null
	decimals: number
}

/**
 * Converts Chunithm player rating from database format to display format
 * Database: 1500 -> Display: 15.00
 *
 * @param playerRating - Stored rating integer from database
 * @returns Display rating value or null if no rating
 */
export const convertChunithmRating = (playerRating: number | null | undefined): number | null => {
	if (!playerRating) return null
	return playerRating / 100
}

/**
 * Converts Ongeki player rating from database format to display format
 * Handles both legacy (v<8) and Refresh (v8+) formats
 *
 * Legacy: Database 1500 -> Display 15.00 (2 decimals)
 * Refresh: Database 15000 -> Display 15.000 (3 decimals)
 *
 * @param playerRating - Stored rating integer (legacy format)
 * @param newPlayerRating - Stored rating integer (Refresh format)
 * @param version - Game version number
 * @returns Object with rating value and decimal places needed
 */
export const convertOngekiRating = (
	playerRating: number | null | undefined,
	newPlayerRating: number | null | undefined,
	version: number
): ProfileRatingResult => {
	const isRefresh = version >= 8

	if (isRefresh && newPlayerRating) {
		return {
			rating: newPlayerRating / 1000,
			decimals: 3
		}
	}

	if (playerRating) {
		return {
			rating: playerRating / 100,
			decimals: 2
		}
	}

	return { rating: null, decimals: 2 }
}

/**
 * Converts Maimai player rating from database format to display format
 * Maimai ratings are stored as integers and displayed as-is (no division)
 * Database: 3361 -> Display: 3361
 * Note: 0 is a valid rating value, only null/undefined should return null
 *
 * @param playerRating - Stored rating integer from database
 * @returns Display rating value or null if no rating
 */
export const convertMaimaiRating = (playerRating: number | null | undefined): number | null => {
	if (playerRating === null || playerRating === undefined) return null
	return playerRating
}

/**
 * Converts profile rating based on game type
 * Unified function that handles all game types
 *
 * @param gameKey - Game identifier ("chunithm", "chunithmnew", "ongeki", "maimai", "maimaidx")
 * @param profile - Profile data object
 * @param version - Game version number
 * @returns Object with rating value and decimal places needed
 */
export const convertProfileRating = (
	gameKey: string,
	profile: ChunithmProfile | OngekiProfile | MaimaiProfile,
	version: number
): ProfileRatingResult => {
	const isChunithm = gameKey === "chunithm" || gameKey === "chunithmnew"
	const isOngeki = gameKey === "ongeki"
	const isMaimai = gameKey === "maimai" || gameKey === "maimaidx"

	if (isChunithm) {
		const chunithmProfile = profile as ChunithmProfile
		const rating = convertChunithmRating(chunithmProfile.playerRating)
		return { rating, decimals: 2 }
	}

	if (isOngeki) {
		const ongekiProfile = profile as OngekiProfile
		return convertOngekiRating(ongekiProfile.playerRating, ongekiProfile.newPlayerRating, version)
	}

	if (isMaimai) {
		const maimaiProfile = profile as MaimaiProfile
		const rating = convertMaimaiRating(maimaiProfile.playerRating)
		return { rating, decimals: 0 }
	}

	return { rating: null, decimals: 2 }
}

/**
 * Converts score playlog rating to display format for Chunithm
 * Database: 1500 -> Display: 15.00
 *
 * @param playerRating - Stored rating integer from playlog
 * @returns Display rating value or 0 if no rating
 */
export const convertChunithmScoreRating = (playerRating: number | null | undefined): number => {
	return convertChunithmRating(playerRating) ?? 0
}

/**
 * Converts score playlog rating to display format for Ongeki
 * Handles both legacy and Refresh formats
 *
 * @param playerRating - Stored rating integer from playlog
 * @param isRefresh - Whether this is Refresh version (v8+)
 * @returns Object with rating value and decimal places needed
 */
export const convertOngekiScoreRating = (
	playerRating: number | null | undefined,
	isRefresh: boolean
): ProfileRatingResult => {
	if (!playerRating) {
		return { rating: null, decimals: isRefresh ? 3 : 2 }
	}

	return {
		rating: isRefresh ? playerRating / 1000 : playerRating / 100,
		decimals: isRefresh ? 3 : 2
	}
}
