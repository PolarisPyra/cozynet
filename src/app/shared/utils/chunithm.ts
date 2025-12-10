import { DateTime } from "luxon"

import { TrophyRareType } from "./enums"

/**
 * VERSION CONSTANTS
 * Mapping of version IDs to version names
 */
export const ChunithmVersions: Record<number, string> = {
	0: "CHUNITHM",
	1: "CHUNITHM PLUS",
	2: "AIR",
	3: "AIR PLUS",
	4: "STAR",
	5: "STAR PLUS",
	6: "AMAZON",
	7: "AMAZON PLUS",
	8: "CRYSTAL",
	9: "CRYSTAL PLUS",
	10: "PARADISE / LOST",
	11: "NEW",
	12: "NEW PLUS",
	13: "SUN",
	14: "SUN PLUS",
	15: "LUMINOUS",
	16: "LUMINOUS PLUS",
	17: "VERSE",
	18: "X-VERSE",
	19: "X-VERSE-X"
}

export const enum ChunithmAvatarCategory {
	WEAR = 1,
	HEAD = 2,
	FACE = 3,
	SKIN = 4,
	ITEM = 5,
	FRONT = 6,
	BACK = 7
}

export enum ChunithmDifficulty {
	Basic = 0,
	Advanced = 1,
	Expert = 2,
	Master = 3,
	Ultima = 4,
	WorldsEnd = 5
}

export enum ChunithmGradeLevel {
	SSSPlus = "SSS+",
	SSS = "SSS",
	SSPlus = "SS+",
	SS = "SS",
	SPlus = "S+",
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

export enum ChunithmClearStatus {
	Failed = "Failed",
	Clear = "Clear"
}

export enum ChunithmComboStatus {
	AJC = "AJC",
	AJ = "AJ",
	FC = "FC",
	None = ""
}

/**
 * IMMUTABLE LOOKUP TABLES
 * Using as const for type inference
 */

const DIFFICULTY_NAMES = {
	[ChunithmDifficulty.Basic]: "Basic",
	[ChunithmDifficulty.Advanced]: "Advanced",
	[ChunithmDifficulty.Expert]: "Expert",
	[ChunithmDifficulty.Master]: "Master",
	[ChunithmDifficulty.Ultima]: "Ultima",
	[ChunithmDifficulty.WorldsEnd]: "Worlds End"
} as const

const DIFFICULTY_COLORS = {
	[ChunithmDifficulty.Basic]: "border-green-600 text-primary",
	[ChunithmDifficulty.Advanced]: "border-orange-500 text-primary",
	[ChunithmDifficulty.Expert]: "border-red-600 text-primary",
	[ChunithmDifficulty.Master]: "border-purple-600 text-primary",
	[ChunithmDifficulty.Ultima]:
		"text-primary border-2 border-black border-t-red-500 border-r-red-900 border-b-red-500 border-l-red-900",
	[ChunithmDifficulty.WorldsEnd]:
		"text-primary border-red-500 border-t-red-500 border-r-orange-500 border-b-yellow-500 border-l-green-500"
} as const

const SCORE_GRADE_THRESHOLDS = [
	{ threshold: 1009000, grade: ChunithmGradeLevel.SSSPlus },
	{ threshold: 1007500, grade: ChunithmGradeLevel.SSS },
	{ threshold: 1005000, grade: ChunithmGradeLevel.SSPlus },
	{ threshold: 1000000, grade: ChunithmGradeLevel.SS },
	{ threshold: 990000, grade: ChunithmGradeLevel.SPlus },
	{ threshold: 975000, grade: ChunithmGradeLevel.S },
	{ threshold: 950000, grade: ChunithmGradeLevel.AAA },
	{ threshold: 925000, grade: ChunithmGradeLevel.AA },
	{ threshold: 900000, grade: ChunithmGradeLevel.A },
	{ threshold: 800000, grade: ChunithmGradeLevel.BBB },
	{ threshold: 700000, grade: ChunithmGradeLevel.BB },
	{ threshold: 600000, grade: ChunithmGradeLevel.B },
	{ threshold: 500000, grade: ChunithmGradeLevel.C }
] as const

const ROM_VERSION_MAPPING = [
	{ versionNum: 24000, versionId: 18, name: "X_VERSE" },
	{ versionNum: 23000, versionId: 17, name: "VERSE" },
	{ versionNum: 22500, versionId: 16, name: "LUMINOUS_PLUS" },
	{ versionNum: 22000, versionId: 15, name: "LUMINOUS" },
	{ versionNum: 21500, versionId: 14, name: "SUN_PLUS" },
	{ versionNum: 21000, versionId: 13, name: "SUN" },
	{ versionNum: 20500, versionId: 12, name: "NEW_PLUS" },
	{ versionNum: 20000, versionId: 11, name: "NEW" },
	{ versionNum: 15000, versionId: 10, name: "PARADISE" },
	{ versionNum: 14500, versionId: 9, name: "CRYSTAL_PLUS" },
	{ versionNum: 14000, versionId: 8, name: "CRYSTAL" },
	{ versionNum: 13500, versionId: 7, name: "AMAZON_PLUS" },
	{ versionNum: 13000, versionId: 6, name: "AMAZON" },
	{ versionNum: 12500, versionId: 5, name: "STAR_PLUS" },
	{ versionNum: 12000, versionId: 4, name: "STAR" },
	{ versionNum: 11500, versionId: 3, name: "AIR_PLUS" },
	{ versionNum: 11000, versionId: 2, name: "AIR" },
	{ versionNum: 10500, versionId: 1, name: "PLUS" }
] as const

/**
 * ADAPTER FUNCTIONS
 * Pure functions that transform domain data
 */

export const getChunithmGrade = (score: number): ChunithmGradeLevel => {
	const matchingGrade = SCORE_GRADE_THRESHOLDS.find(({ threshold }) => score >= threshold)
	return matchingGrade?.grade ?? ChunithmGradeLevel.D
}

export const getChunithmGradeFromRank = (scoreRank: number): string => {
	if (scoreRank === 0) return "D"
	if (scoreRank === 1) return "C"
	if (scoreRank === 2) return "B"
	if (scoreRank === 3) return "BB"
	if (scoreRank === 4) return "BBB"
	if (scoreRank === 5) return "A"
	if (scoreRank === 6) return "AA"
	if (scoreRank === 7) return "AAA"
	if (scoreRank === 8) return "S"
	if (scoreRank === 9) return "S+"
	if (scoreRank === 10) return "SS"
	if (scoreRank === 11) return "SS+"
	if (scoreRank === 12) return "SSS"
	if (scoreRank > 12) return "SSS+"
	return "D"
}

export const getDifficultyFromChunithmChart = (chartId: number): string => {
	return DIFFICULTY_NAMES[chartId as ChunithmDifficulty] ?? "Unknown"
}

export const chunithmBadgeColors = (chartId?: number): string => {
	return DIFFICULTY_COLORS[chartId as ChunithmDifficulty] ?? "border-gray-700 text-gray-700"
}

export const getChunithmClearStatus = (isClear: number): ChunithmClearStatus => {
	return isClear === 1 ? ChunithmClearStatus.Clear : ChunithmClearStatus.Failed
}

export const getChunithmComboStatus = (
	isFullCombo: number,
	isAllJustice: number,
	score?: number
): ChunithmComboStatus => {
	if (score && score >= 1010000 && isAllJustice === 1) return ChunithmComboStatus.AJC
	if (isAllJustice === 1) return ChunithmComboStatus.AJ
	if (isFullCombo === 1) return ChunithmComboStatus.FC
	return ChunithmComboStatus.None
}

export const convertRomVersionToVersion = (romVersion: string | null | undefined): number => {
	if (!romVersion) return 0

	const versionNum = Number(romVersion.replace(/\./g, ""))
	const matching = ROM_VERSION_MAPPING.find(({ versionNum: num }) => versionNum >= num)

	return matching?.versionId ?? 0
}

/**
 * CALCULATION FUNCTIONS
 * Pure functions for business logic
 */

export const calculateChunithmRating = (level: number, score: number): number => {
	const chartConstant = level * 100

	if (score >= 1009000) return chartConstant + 215
	if (score >= 1007500) return chartConstant + 200 + Math.floor((score - 1007500) / 100)
	if (score >= 1005000) return chartConstant + 150 + Math.floor((score - 1005000) / 50)
	if (score >= 1000000) return chartConstant + 100 + Math.floor((score - 1000000) / 100)
	if (score >= 990000) return chartConstant + Math.floor((score - 990000) / 250)
	if (score >= 975000) return chartConstant + Math.floor((score - 975000) / 250)
	if (score >= 925000) {
		return chartConstant - 300 + Math.floor(((score - 925000) * -200) / 25000)
	}
	if (score >= 900000) {
		return chartConstant - 500 + Math.floor(((score - 900000) * 250) / 100000)
	}
	if (score >= 800000) {
		const bbb = (chartConstant - 500) / 2
		const progress = (score - 800000) / 100000
		return Math.floor(bbb + (chartConstant - 500 - bbb) * progress)
	}

	return 0
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

export const formatSqlDateToLocalParts = (sqlDate: string | null | undefined): DateParts => {
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
 * Convert CHUNITHM level to number of stars
 * Formula: (level + 1) / 2
 * Examples: 1 = 1 star, 3 = 2 stars, 5 = 3 stars
 */
export const levelToStars = (level: number | null | undefined): number => {
	if (level == null || !Number.isFinite(level)) return 0
	return Math.floor((level + 1) / 2)
}

/**
 * TROPHY BACKGROUND CONSTANTS
 * Honor background images for different trophy rare types
 */
export const honorBackgrounds: Record<TrophyRareType, string> = {
	[TrophyRareType.Normal]: `honor_bg_normal.webp`,
	[TrophyRareType.Bronze]: `honor_bg_bronze.webp`,
	[TrophyRareType.Silver]: `honor_bg_silver.webp`,
	[TrophyRareType.Gold]: `honor_bg_gold.webp`,
	[TrophyRareType.Gold2]: `honor_bg_gold.webp`,
	[TrophyRareType.Platinum]: `honor_bg_platina.webp`,
	[TrophyRareType.Platinum2]: `honor_bg_platina.webp`,
	[TrophyRareType.Rainbow]: `honor_bg_rainbow.webp`,
	[TrophyRareType.Staff]: `honor_bg_staff.webp`,
	[TrophyRareType.Ongeki]: `honor_bg_ongeki.webp`,
	[TrophyRareType.Maimai]: `honor_bg_maimai.webp`,
	[TrophyRareType.Duals]: `honor_bg_platina.webp`,
	[TrophyRareType.Idori]: `honor_bg_platina.webp`,
	[TrophyRareType.Pheonix_g]: `honor_bg_phoenix_g.webp`,
	[TrophyRareType.Pheonix_p]: `honor_bg_phoenix_p.webp`,
	[TrophyRareType.Pheonix_r]: `honor_bg_phoenix_r.webp`,
	[TrophyRareType.Lamp]: ``,
	[TrophyRareType.Lamp2]: ``,
	[TrophyRareType.Lamp3]: ``,
	[TrophyRareType.Kop]: ``,
	[TrophyRareType.Kop2]: ``
}
