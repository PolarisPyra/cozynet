import { DateTime } from "luxon"

/**
 * Converts Ongeki profile datetime string (SQL format) to local time and returns
 * formatted date and time parts.
 * Used for: firstPlayDate, lastPlayDate from profile data
 */
export const formatOngekiProfileDate = (sqlDate: string | null | undefined): { date: string; time: string } => {
	if (!sqlDate) return { date: "—", time: "—" }

	try {
		// Ongeki profile dates are SQL format (e.g., "2025-01-10 03:48:54.2")
		const dt = DateTime.fromSQL(sqlDate, { zone: "Asia/Tokyo" }).toLocal()

		if (!dt.isValid) {
			console.warn(`Could not parse profile date: ${sqlDate}. Invalid reason: ${dt.invalidReason}`)
			return { date: "—", time: "—" }
		}

		return {
			date: dt.toFormat("MM/dd/yyyy"),
			time: dt.toFormat("h:mm a")
		}
	} catch (error) {
		console.error(`Error parsing profile date "${sqlDate}":`, error)
		return { date: "—", time: "—" }
	}
}

/**
 * Converts Ongeki score/playlog datetime string (ISO format) to local time and returns
 * formatted date and time parts.
 * Used for: userPlayDate from score playlog data
 */
export const formatOngekiScorePlaylogDate = (isoDate: string | null | undefined): { date: string; time: string } => {
	if (!isoDate) return { date: "—", time: "—" }

	try {
		// Ongeki score playlog dates are ISO format (e.g., "2025-01-10T03:48:54Z")
		const dt = DateTime.fromISO(isoDate.replace("Z", ""), { zone: "Asia/Tokyo" }).toLocal()

		if (!dt.isValid) {
			console.warn(`Could not parse score date: ${isoDate}. Invalid reason: ${dt.invalidReason}`)
			return { date: "—", time: "—" }
		}

		return {
			date: dt.toFormat("MM/dd/yyyy"),
			time: dt.toFormat("h:mm a")
		}
	} catch (error) {
		console.error(`Error parsing score date "${isoDate}":`, error)
		return { date: "—", time: "—" }
	}
}

export const ongekiBadgeColors = (chartId?: number) => {
	const diff = String(getDifficultyFromOngekiChart(chartId ?? 0))
	switch (diff) {
		case "Basic":
			return " border-green-600 text-primary"
		case "Advanced":
			return " border-orange-500 text-primary"
		case "Expert":
			return " border-red-600 text-primary"
		case "Master":
			return " border-purple-600 text-primary"
		case "Lunatic":
			return " border-black border-t-pink-500 border-r-pink-700 border-b-pink-500 border-l-pink-700"
		default:
			return " border-gray-700 text-primary"
	}
}

export const ongekiTextColors = (chartId?: number) => {
	const diff = String(getDifficultyFromOngekiChart(chartId ?? 0))
	switch (diff) {
		case "Basic":
			return "text-green-600"
		case "Advanced":
			return "text-orange-500"
		case "Expert":
			return "text-red-600"
		case "Master":
			return "text-purple-600"
		case "Lunatic":
		case "Ultima":
			// keep Lunatic/Ultima pink, but use a richer pink tone
			return "text-pink-400"
		default:
			return "text-foreground"
	}
}

export const getDifficultyFromOngekiChart = (chartId: number) => {
	switch (chartId) {
		case 0:
			return "Basic"
		case 1:
			return "Advanced"
		case 2:
			return "Expert"
		case 3:
			return "Master"
		case 10:
			return "Lunatic"
		default:
			return "Unknown"
	}
}

export const getOngekiGrade = (techScore: number): string => {
	if (techScore >= 1007500) return "SSSPLUS"
	if (techScore >= 1000000) return "SSS"
	if (techScore >= 990000) return "SS"
	if (techScore >= 970000) return "S"
	if (techScore >= 940000) return "AAA"
	if (techScore >= 900000) return "AA"
	if (techScore >= 850000) return "A"
	if (techScore >= 800000) return "BBB"
	if (techScore >= 750000) return "BB"
	if (techScore >= 700000) return "B"
	if (techScore >= 500000) return "C"
	return "D"
}

export const getOngekiClearStatus = (clearStatus: number): string => {
	if (clearStatus === 2) return "Won"
	if (clearStatus === 1) return "Draw"
	if (clearStatus === 0) return "Loss"
	return ""
}

export const getOngekiComboStatus = (
	isFullCombo: number,
	isAllBreake: number,
	isFullBell: number,
	techScoreMax?: number
): string => {
	if (techScoreMax && techScoreMax >= 1010000 && isAllBreake === 1) return "AB+"
	if (isAllBreake === 1 && isFullBell === 1) return "AB/FB"
	if (isAllBreake === 1) return "AB"
	if (isFullCombo === 1 && isFullBell === 1) return "FC/FB"
	if (isFullBell === 1) return "FB"
	if (isFullCombo === 1) return "FC"
	return ""
}

export function OngekiRating(level: number, score: number): number {
	const internalChartRating = level * 100

	// Return 0 if score is too low to earn any rating
	if (score < 970000) {
		return 0
	}

	if (score >= 1007500) {
		return internalChartRating + 200 // +2.00 for SSS+
	} else if (score >= 1000000) {
		return internalChartRating + 150 + Math.floor((score - 1000000) / 150) // +1.50 for SSS, then +0.01 per 150 points
	} else if (score >= 990000) {
		return internalChartRating + 100 + Math.floor((score - 990000) / 200) // +1.00 for SS, then +0.01 per 200 points
	} else if (score >= 970000) {
		return internalChartRating + Math.floor((score - 970000) / 200) // ±0 at 970000, then +0.01 per 200 points
	}

	return 0 // Fallback return 0
}

export function OngekiGekForceRating(
	level: number,
	score: number,
	isFullCombo: number,
	isAllBreake: number,
	isFullBell: number
): number {
	// Using integer arithmetic to avoid floating point precision issues
	const chartConstant = Math.floor(level * 1000)
	const fullCombo = isFullCombo === 1
	const allBreake = isAllBreake === 1
	const fullBell = isFullBell === 1

	let baseRating = 0

	// If score <= 500000, base rating is 0
	if (score <= 500000) {
		return 0
	}

	// For 500000 < score <= 800000
	if (score > 500000 && score <= 800000) {
		baseRating = ((chartConstant - 6000) * (score - 500000)) / 300000
		if (baseRating < 0) {
			return 0
		}
		return baseRating
	}

	// For score > 800000, calculate technical score bonus using linear interpolation
	let techScoreBonus = 0

	if (score >= 1010000) {
		techScoreBonus = 2000 // 2.0 * 1000
	} else if (score >= 1007500) {
		// Linear interpolation between 1007500 (1.75) and 1010000 (2.0)
		techScoreBonus = 1750 + Math.floor((250 * (score - 1007500)) / 2500)
	} else if (score >= 1000000) {
		// Linear interpolation between 1000000 (1.25) and 1007500 (1.75)
		techScoreBonus = 1250 + Math.floor((500 * (score - 1000000)) / 7500)
	} else if (score >= 990000) {
		// Linear interpolation between 990000 (0.75) and 1000000 (1.25)
		techScoreBonus = 750 + Math.floor((500 * (score - 990000)) / 10000)
	} else if (score >= 970000) {
		// Linear interpolation between 970000 (0) and 990000 (0.75)
		techScoreBonus = Math.floor((750 * (score - 970000)) / 20000)
	} else if (score >= 900000) {
		// Linear interpolation between 900000 (-4) and 970000 (0)
		techScoreBonus = -4000 + Math.floor((4000 * (score - 900000)) / 70000)
	} else {
		// Linear interpolation between 800000 (-6) and 900000 (-4)
		techScoreBonus = -6000 + Math.floor((2000 * (score - 800000)) / 100000)
	}

	// Calculate technical rank bonus
	let techRankBonus = 0
	if (score >= 1007500) {
		techRankBonus = 300 // SSS+ = 0.3 * 1000
	} else if (score >= 1000000) {
		techRankBonus = 200 // SSS = 0.2 * 1000
	} else if (score >= 990000) {
		techRankBonus = 100 // SS = 0.1 * 1000
	}
	// S and below = 0

	// Calculate clear badge bonuses
	let clearBadgeBonus = 0
	// Note: All Break+ requires score = 1010000, all breaks, all bells caught, no damage
	// Since we don't have damage info, we'll check for score = 1010000 with all breaks
	if (score === 1010000 && allBreake) {
		clearBadgeBonus = 350 // All Break+ = 0.35 * 1000
	} else if (allBreake) {
		clearBadgeBonus = 300 // All Break = 0.3 * 1000
	} else if (fullCombo) {
		clearBadgeBonus = 100 // Full Combo = 0.1 * 1000
	}

	if (fullBell) {
		clearBadgeBonus += 50 // Full Bell = 0.05 * 1000 (can stack with other badges)
	}

	// Base rating = Chart Constant + Technical score bonus + Technical rank bonus + Clear badge bonuses
	baseRating = chartConstant + techScoreBonus + techRankBonus + clearBadgeBonus

	// Return base rating (already in integer form, caller will divide by 1000)
	return baseRating
}
