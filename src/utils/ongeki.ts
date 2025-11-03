import { DateTime } from "luxon"

/**
 * DOMAIN TYPES & CONSTANTS
 * Pure, immutable data structures following Adapter Pattern
 */

export enum OngekiDifficulty {
	Basic = 0,
	Advanced = 1,
	Expert = 2,
	Master = 3,
	Lunatic = 10
}

export enum OngekiGradeLevel {
	SSSPlus = "SSSPLUS",
	SSS = "SSS",
	SS = "SS",
	S = "S",
	AAA = "AAA",
	AA = "AA",
	A = "A",
	BBB = "BBB",
	BB = "BB",
	B = "B",
	C = "C",
	D = "D"
}

export enum OngekiClearStatus {
	Won = "Won",
	Draw = "Draw",
	Loss = "Loss"
}

export enum OngekiComboStatus {
	ABPlus = "AB+",
	ABFullBell = "AB/FB",
	AB = "AB",
	FCFullBell = "FC/FB",
	FullBell = "FB",
	FullCombo = "FC",
	None = ""
}

/**
 * IMMUTABLE LOOKUP TABLES
 * Using as const for type inference
 */

const DIFFICULTY_NAMES = {
	[OngekiDifficulty.Basic]: "Basic",
	[OngekiDifficulty.Advanced]: "Advanced",
	[OngekiDifficulty.Expert]: "Expert",
	[OngekiDifficulty.Master]: "Master",
	[OngekiDifficulty.Lunatic]: "Lunatic"
} as const

const DIFFICULTY_BADGE_COLORS = {
	[OngekiDifficulty.Basic]: "border-green-600 text-primary",
	[OngekiDifficulty.Advanced]: "border-orange-500 text-primary",
	[OngekiDifficulty.Expert]: "border-red-600 text-primary",
	[OngekiDifficulty.Master]: "border-purple-600 text-primary",
	[OngekiDifficulty.Lunatic]: "border-black border-t-pink-500 border-r-pink-700 border-b-pink-500 border-l-pink-700"
} as const

const DIFFICULTY_TEXT_COLORS = {
	[OngekiDifficulty.Basic]: "text-green-600",
	[OngekiDifficulty.Advanced]: "text-orange-500",
	[OngekiDifficulty.Expert]: "text-red-600",
	[OngekiDifficulty.Master]: "text-purple-600",
	[OngekiDifficulty.Lunatic]: "text-pink-400"
} as const

const TECH_SCORE_GRADE_THRESHOLDS = [
	{ threshold: 1007500, grade: OngekiGradeLevel.SSSPlus },
	{ threshold: 1000000, grade: OngekiGradeLevel.SSS },
	{ threshold: 990000, grade: OngekiGradeLevel.SS },
	{ threshold: 970000, grade: OngekiGradeLevel.S },
	{ threshold: 940000, grade: OngekiGradeLevel.AAA },
	{ threshold: 900000, grade: OngekiGradeLevel.AA },
	{ threshold: 850000, grade: OngekiGradeLevel.A },
	{ threshold: 800000, grade: OngekiGradeLevel.BBB },
	{ threshold: 750000, grade: OngekiGradeLevel.BB },
	{ threshold: 700000, grade: OngekiGradeLevel.B },
	{ threshold: 500000, grade: OngekiGradeLevel.C }
] as const

/**
 * ADAPTER FUNCTIONS
 * Pure functions that transform domain data
 */

export const getDifficultyFromOngekiChart = (chartId: number): string => {
	return DIFFICULTY_NAMES[chartId as OngekiDifficulty] ?? "Unknown"
}

export const ongekiBadgeColors = (chartId?: number): string => {
	return DIFFICULTY_BADGE_COLORS[chartId as OngekiDifficulty] ?? "border-gray-700 text-primary"
}

export const ongekiTextColors = (chartId?: number): string => {
	return DIFFICULTY_TEXT_COLORS[chartId as OngekiDifficulty] ?? "text-foreground"
}

export const getOngekiGrade = (techScore: number): OngekiGradeLevel => {
	const matchingGrade = TECH_SCORE_GRADE_THRESHOLDS.find(({ threshold }) => techScore >= threshold)
	return matchingGrade?.grade ?? OngekiGradeLevel.D
}

export const getOngekiClearStatus = (clearStatus: number): OngekiClearStatus => {
	if (clearStatus === 2) return OngekiClearStatus.Won
	if (clearStatus === 1) return OngekiClearStatus.Draw
	return OngekiClearStatus.Loss
}

export const getOngekiComboStatus = (
	isFullCombo: number,
	isAllBreake: number,
	isFullBell: number,
	techScoreMax?: number
): OngekiComboStatus => {
	if (techScoreMax && techScoreMax >= 1010000 && isAllBreake === 1) return OngekiComboStatus.ABPlus
	if (isAllBreake === 1 && isFullBell === 1) return OngekiComboStatus.ABFullBell
	if (isAllBreake === 1) return OngekiComboStatus.AB
	if (isFullCombo === 1 && isFullBell === 1) return OngekiComboStatus.FCFullBell
	if (isFullBell === 1) return OngekiComboStatus.FullBell
	if (isFullCombo === 1) return OngekiComboStatus.FullCombo
	return OngekiComboStatus.None
}

/**
 * CALCULATION FUNCTIONS
 * Pure functions for business logic with integer arithmetic to avoid floating point issues
 */

export const calculateOngekiRating = (level: number, score: number): number => {
	const internalChartRating = level * 100

	if (score < 970000) return 0
	if (score >= 1007500) return internalChartRating + 200
	if (score >= 1000000) return internalChartRating + 150 + Math.floor((score - 1000000) / 150)
	if (score >= 990000) return internalChartRating + 100 + Math.floor((score - 990000) / 200)

	return internalChartRating + Math.floor((score - 970000) / 200)
}

/**
 * LEGACY COMPATIBILITY - Alias for calculateOngekiRating
 * @deprecated Use calculateOngekiRating instead
 */
export const OngekiRating = calculateOngekiRating

export const calculateOngekiGekForceRating = (
	level: number,
	score: number,
	isFullCombo: number,
	isAllBreake: number,
	isFullBell: number
): number => {
	const chartConstant = Math.floor(level * 1000)
	const fullCombo = isFullCombo === 1
	const allBreake = isAllBreake === 1
	const fullBell = isFullBell === 1

	if (score <= 500000) return 0

	if (score > 500000 && score <= 800000) {
		const baseRating = ((chartConstant - 6000) * (score - 500000)) / 300000
		return Math.max(0, baseRating)
	}

	const techScoreBonus = calculateTechScoreBonus(score)
	const techRankBonus = calculateTechRankBonus(score)
	const clearBadgeBonus = calculateClearBadgeBonus(score, allBreake, fullCombo, fullBell)

	return chartConstant + techScoreBonus + techRankBonus + clearBadgeBonus
}

/**
 * LEGACY COMPATIBILITY - Alias for calculateOngekiGekForceRating
 * @deprecated Use calculateOngekiGekForceRating instead
 */
export const OngekiGekForceRating = calculateOngekiGekForceRating

/**
 * PURE HELPER FUNCTIONS
 * Extracted calculation sub-steps for testability
 */

const calculateTechScoreBonus = (score: number): number => {
	if (score >= 1010000) return 2000
	if (score >= 1007500) return 1750 + Math.floor((250 * (score - 1007500)) / 2500)
	if (score >= 1000000) return 1250 + Math.floor((500 * (score - 1000000)) / 7500)
	if (score >= 990000) return 750 + Math.floor((500 * (score - 990000)) / 10000)
	if (score >= 970000) return Math.floor((750 * (score - 970000)) / 20000)
	if (score >= 900000) return -4000 + Math.floor((4000 * (score - 900000)) / 70000)

	return -6000 + Math.floor((2000 * (score - 800000)) / 100000)
}

const calculateTechRankBonus = (score: number): number => {
	if (score >= 1007500) return 300
	if (score >= 1000000) return 200
	if (score >= 990000) return 100

	return 0
}

const calculateClearBadgeBonus = (score: number, allBreake: boolean, fullCombo: boolean, fullBell: boolean): number => {
	let bonus = 0

	if (score === 1010000 && allBreake) {
		bonus = 350
	} else if (allBreake) {
		bonus = 300
	} else if (fullCombo) {
		bonus = 100
	}

	if (fullBell) bonus += 50

	return bonus
}

/**
 * DATE/TIME FORMATTERS
 * Pure functions for temporal transformations
 */

interface DateParts {
	date: string
	time: string
}

const DEFAULT_DATE_PARTS: DateParts = { date: "—", time: "—" }

/**
 * Converts Ongeki profile datetime string (SQL format) to local time and returns
 * formatted date and time parts.
 * Used for: firstPlayDate, lastPlayDate from profile data
 */
export const formatOngekiProfileDate = (sqlDate: string | null | undefined): DateParts => {
	if (!sqlDate) return DEFAULT_DATE_PARTS

	try {
		const dt = DateTime.fromSQL(sqlDate, { zone: "Asia/Tokyo" }).toLocal()

		if (!dt.isValid) return DEFAULT_DATE_PARTS

		return {
			date: dt.toFormat("MM/dd/yyyy"),
			time: dt.toFormat("h:mm a")
		}
	} catch {
		return DEFAULT_DATE_PARTS
	}
}

/**
 * Converts Ongeki score/playlog datetime string (ISO format) to local time and returns
 * formatted date and time parts.
 * Used for: userPlayDate from score playlog data
 */
export const formatOngekiScorePlaylogDate = (isoDate: string | null | undefined): DateParts => {
	if (!isoDate) return DEFAULT_DATE_PARTS

	try {
		const dt = DateTime.fromISO(isoDate.replace("Z", ""), { zone: "Asia/Tokyo" }).toLocal()

		if (!dt.isValid) return DEFAULT_DATE_PARTS

		return {
			date: dt.toFormat("MM/dd/yyyy"),
			time: dt.toFormat("h:mm a")
		}
	} catch {
		return DEFAULT_DATE_PARTS
	}
}

/**
 * CHART LEVEL FORMATTING
 * Pure functions for chart data transformation
 */

export interface OngekiChartData {
	chartId?: number | null
	level?: number | null
}

export interface FormattedOngekiLevel {
	value: string
}

export const formatOngekiLevel = (chart: OngekiChartData): FormattedOngekiLevel => {
	if (chart.level == null) return { value: "?" }
	return { value: Number.isFinite(chart.level) ? chart.level.toFixed(1) : "?" }
}
