import { DateTime } from "luxon"

// ===================================
// CHUNITHM UTILITIES
// ===================================

export const getChunithmGrade = (score: number) => {
	if (score >= 1009000) return "SSS+"
	if (score >= 1007500 && score <= 1008999) return "SSS"
	if (score >= 1005000 && score <= 1007499) return "SS+"
	if (score >= 1000000 && score <= 1004999) return "SS"
	if (score >= 990000 && score <= 999999) return "S+"
	if (score >= 975000 && score <= 990000) return "S"
	if (score >= 950000 && score <= 974999) return "AAA"
	if (score >= 925000 && score <= 949999) return "AA"
	if (score >= 900000 && score <= 924999) return "A"
	if (score >= 800000 && score <= 899999) return "BBB"
	if (score >= 700000 && score <= 799999) return "BB"
	if (score >= 600000 && score <= 699999) return "B"
	if (score >= 500000 && score <= 599999) return "C"
	if (score < 500000) return "D"
	return ""
}

export const chunithmBadgeColors = (chartId?: number) => {
	const diff = String(getDifficultyFromChunithmChart(chartId ?? 0))
	switch (diff) {
		case "Basic":
			return "border-green-600 text-primary"
		case "Advanced":
			return "border-orange-500 text-primary"
		case "Expert":
			return "border-red-600 text-primary"
		case "Master":
			return "border-purple-600 text-primary"
		case "Ultima":
			return "text-primary border-2 border-black border-t-red-500 border-r-red-900 border-b-red-500 border-l-red-900"
		case "Worlds End":
			return "text-primary border-red-500 border-t-red-500 border-r-orange-500 border-b-yellow-500 border-l-green-500"
		default:
			return "border-gray-700 text-gray-700"
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

export const getDifficultyFromChunithmChart = (chartId: number) => {
	switch (chartId) {
		case 0:
			return "Basic"
		case 1:
			return "Advanced"
		case 2:
			return "Expert"
		case 3:
			return "Master"
		case 4:
			return "Ultima"
		case 5:
			return "Worlds End"
		default:
			return "Unknown"
	}
}

export const getChunithmClearStatus = (isClear: number): string => {
	if (isClear === 0) return "Failed"
	if (isClear === 1) return "Clear"
	return ""
}

export const getChunithmComboStatus = (isFullCombo: number, isAllJustice: number, score?: number): string => {
	if (score && score >= 1010000 && isAllJustice === 1) return "AJC"
	if (isAllJustice === 1) return "AJ"
	if (isFullCombo === 1) return "FC"
	return ""
}

export function ChunitmRating(level: number, score: number): number {
	const chartConstant = level * 100

	if (score >= 1009000) {
		// SSS+: Chart constant +2.15 (capped, no further increase)
		return chartConstant + 215
	} else if (score >= 1007500) {
		// SSS: Chart constant +2.0, +0.01 per 100 points
		return chartConstant + 200 + Math.floor((score - 1007500) / 100)
	} else if (score >= 1005000) {
		// SS+: Chart constant +1.5, +0.1 per 500 points = +0.01 per 50 points
		return chartConstant + 150 + Math.floor((score - 1005000) / 50)
	} else if (score >= 1000000) {
		// SS: Chart constant +1.0, +0.1 per 1000 points = +0.01 per 100 points
		return chartConstant + 100 + Math.floor((score - 1000000) / 100)
	} else if (score >= 990000) {
		// S+: Chart constant +0, +0.1 per 2500 points = +0.01 per 250 points
		// At 990000: 0, interpolate to 1000000 where it should be +100
		// So from 990000-999999: +0.1 per 2500 points
		return chartConstant + Math.floor((score - 990000) / 250)
	} else if (score >= 975000) {
		// S: Chart constant +0, +0.1 per 2500 points = +0.01 per 250 points
		return chartConstant + Math.floor((score - 975000) / 250)
	} else if (score >= 925000) {
		// AA: Chart constant -3.0, linear interpolation to A at 900000
		// From 925000 (-3.0) to 900000 (-5.0): difference of -2.0 over 25000 points
		return chartConstant - 300 + Math.floor(((score - 925000) * -200) / 25000)
	} else if (score >= 900000) {
		// A: Chart constant -5.0, linear interpolation to BBB at 800000
		// From 900000 (-5.0) to 800000 (-5.0/2 = -2.5): difference of +2.5 over 100000 points
		return chartConstant - 500 + Math.floor(((score - 900000) * 250) / 100000)
	} else if (score >= 800000) {
		// BBB: (Chart constant -5.0)/2, linear interpolation from A at 900000
		const bbb = (chartConstant - 500) / 2
		// At 800000, rating is (Chart constant -5.0)/2
		// At 900000, rating is Chart constant -5.0
		// Linear interpolation from 800000 to 900000
		const progress = (score - 800000) / 100000
		return Math.floor(bbb + (chartConstant - 500 - bbb) * progress)
	} else {
		// C and below: 0
		return 0
	}
}

/**
 * Converts Chunithm romVersion string to version number
 * @param romVersion - Version string like "2.40.00" or null
 * @returns Version number (0-18) or 0 if null/invalid
 */
export const convertRomVersionToVersion = (romVersion: string | null | undefined): number => {
	if (!romVersion) return 0

	// Remove dots and convert to number (e.g., "2.40.00" -> 24000)
	const versionNum = Number(romVersion.replace(/\./g, ""))

	if (versionNum >= 24000) return 18 // X_VERSE
	if (versionNum >= 23000) return 17 // VERSE
	if (versionNum >= 22500) return 16 // LUMINOUS_PLUS
	if (versionNum >= 22000) return 15 // LUMINOUS
	if (versionNum >= 21500) return 14 // SUN_PLUS
	if (versionNum >= 21000) return 13 // SUN
	if (versionNum >= 20500) return 12 // NEW_PLUS
	if (versionNum >= 20000) return 11 // NEW
	if (versionNum >= 15000) return 10 // PARADISE
	if (versionNum >= 14500) return 9 // CRYSTAL_PLUS
	if (versionNum >= 14000) return 8 // CRYSTAL
	if (versionNum >= 13500) return 7 // AMAZON_PLUS
	if (versionNum >= 13000) return 6 // AMAZON
	if (versionNum >= 12500) return 5 // STAR_PLUS
	if (versionNum >= 12000) return 4 // STAR
	if (versionNum >= 11500) return 3 // AIR_PLUS
	if (versionNum >= 11000) return 2 // AIR
	if (versionNum >= 10500) return 1 // PLUS
	return 0 // CHUNITHM
}

// ===================================
// ONGEKI UTILITIES
// ===================================

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

// ===================================
// MAIMAI DX UTILITIES
// ===================================

export const getMaimaiDxGrade = (achievement: number): string => {
	// Achievement is stored as integer (e.g., 100_5000 for 100.5000%)
	if (achievement >= 100_5000) return "SSS+"
	if (achievement >= 100_0000) return "SSS"
	if (achievement >= 99_5000) return "SS+"
	if (achievement >= 99_0000) return "SS"
	if (achievement >= 98_0000) return "S+"
	if (achievement >= 97_0000) return "S"
	if (achievement >= 94_0000) return "AAA"
	if (achievement >= 90_0000) return "AA"
	if (achievement >= 80_0000) return "A"
	if (achievement >= 75_0000) return "BBB"
	if (achievement >= 70_0000) return "BB"
	if (achievement >= 60_0000) return "B"
	if (achievement >= 50_0000) return "C"
	return "D"
}

export const formatMaimaiDxAchievement = (achievement: number): string => {
	return (achievement / 10000).toFixed(4) + "%"
}

export const maimaiDxBadgeColors = (chartId?: number) => {
	const diff = String(getDifficultyFromMaimaiDxChart(chartId ?? 0))
	switch (diff) {
		case "Basic":
			return "border border-green-600 text-primary"
		case "Advanced":
			return "border border-orange-500 text-primary"
		case "Expert":
			return "border border-red-600 text-primary"
		case "Master":
			return "border border-purple-600 text-primary"
		case "Re:Master":
			return "border border-pink-600 text-primary"
		default:
			return "border border-gray-700 text-primary"
	}
}

export const getDifficultyFromMaimaiDxChart = (chartId: number) => {
	switch (chartId) {
		case 0:
			return "Basic"
		case 1:
			return "Advanced"
		case 2:
			return "Expert"
		case 3:
			return "Master"
		case 4:
			return "Re:Master"
		default:
			return "Unknown"
	}
}

export const getMaimaiDxComboStatus = (comboStatus?: number): string => {
	switch (comboStatus) {
		case 1:
			return "FC"
		case 2:
			return "FC+"
		case 3:
			return "AP"
		case 4:
			return "AP+"
		default:
			return ""
	}
}

export const getMaimaiDxSyncStatus = (syncStatus?: number): string => {
	switch (syncStatus) {
		case 1:
			return "FS"
		case 2:
			return "FS+"
		case 3:
			return "FDX"
		case 4:
			return "FDX+"
		default:
			return ""
	}
}

// ===================================
// DATE/TIME UTILITIES
// ===================================

/**
 * Converts a SQL datetime string (assumed Asia/Tokyo) to local time and returns
 * formatted date and time parts suitable for badge display.
 */
export const formatSqlDateToLocalParts = (sqlDate: string | null | undefined): { date: string; time: string } => {
	if (!sqlDate) return { date: "—", time: "—" }

	try {
		const dt = DateTime.fromSQL(sqlDate, { zone: "Asia/Tokyo" }).toLocal()
		return {
			date: dt.toFormat("MM/dd/yyyy"),
			time: dt.toFormat("h:mm a")
		}
	} catch {
		return { date: "—", time: "—" }
	}
}

/**
 * Converts an ISO datetime string (often ending with Z) assumed Asia/Tokyo source
 * time to local time and returns formatted date/time parts.
 */
export const formatIsoDateToLocalParts = (isoDate: string | null | undefined): { date: string; time: string } => {
	if (!isoDate) return { date: "—", time: "—" }
	try {
		const dt = DateTime.fromISO(isoDate.replace("Z", ""), { zone: "Asia/Tokyo" }).toLocal()
		return {
			date: dt.toFormat("MM/dd/yyyy"),
			time: dt.toFormat("h:mm a")
		}
	} catch {
		return { date: "—", time: "—" }
	}
}
