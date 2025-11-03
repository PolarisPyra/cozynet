import { DateTime } from "luxon"

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
