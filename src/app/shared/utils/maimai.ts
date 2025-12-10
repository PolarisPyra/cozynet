/**
 * DOMAIN TYPES & CONSTANTS
 * Pure, immutable data structures following Adapter Pattern
 */

/**
 * VERSION CONSTANTS
 * Mapping of version IDs to version names
 */
export const MaimaiDxVersions: Record<number, string> = {
	0: "maimai",
	1: "maimai PLUS",
	2: "maimai GREEN",
	3: "maimai GREEN PLUS",
	4: "maimai ORANGE",
	5: "maimai ORANGE PLUS",
	6: "maimai PINK",
	7: "maimai PINK PLUS",
	8: "maimai MURASAKI",
	9: "maimai MURASAKI PLUS",
	10: "maimai MILK",
	11: "maimai MILK PLUS",
	12: "maimai FINALE",
	13: "maimai DX",
	14: "maimai DX PLUS",
	15: "maimai DX Splash",
	16: "maimai DX Splash PLUS",
	17: "maimai DX UNiVERSE",
	18: "maimai DX UNiVERSE PLUS",
	19: "maimai DX FESTiVAL",
	20: "maimai DX FESTiVAL PLUS",
	21: "maimai DX BUDDiES",
	22: "maimai DX BUDDiES PLUS",
	23: "maimai DX PRiSM",
	24: "maimai DX PRiSM PLUS",
	25: "maimai DX CIRCLE"
}

export enum MaimaiDxDifficulty {
	Basic = 0,
	Advanced = 1,
	Expert = 2,
	Master = 3,
	ReMaster = 4
}

export enum MaimaiDxGradeLevel {
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

export enum MaimaiDxComboStatus {
	FC = "FC",
	FCPlus = "FC+",
	AP = "AP",
	APPlus = "AP+",
	None = ""
}

export enum MaimaiDxSyncStatus {
	FS = "FS",
	FSPlus = "FS+",
	FDX = "FDX",
	FDXPlus = "FDX+",
	None = ""
}

/**
 * IMMUTABLE LOOKUP TABLES
 * Using as const for type inference
 */

const DIFFICULTY_NAMES = {
	[MaimaiDxDifficulty.Basic]: "Basic",
	[MaimaiDxDifficulty.Advanced]: "Advanced",
	[MaimaiDxDifficulty.Expert]: "Expert",
	[MaimaiDxDifficulty.Master]: "Master",
	[MaimaiDxDifficulty.ReMaster]: "Re:Master"
} as const

const DIFFICULTY_COLORS = {
	[MaimaiDxDifficulty.Basic]: "border border-green-600 text-primary",
	[MaimaiDxDifficulty.Advanced]: "border border-orange-500 text-primary",
	[MaimaiDxDifficulty.Expert]: "border border-red-600 text-primary",
	[MaimaiDxDifficulty.Master]: "border border-purple-600 text-primary",
	[MaimaiDxDifficulty.ReMaster]: "border border-pink-600 text-primary"
} as const

const ACHIEVEMENT_GRADE_THRESHOLDS = [
	{ threshold: 100_5000, grade: MaimaiDxGradeLevel.SSSPlus },
	{ threshold: 100_0000, grade: MaimaiDxGradeLevel.SSS },
	{ threshold: 99_5000, grade: MaimaiDxGradeLevel.SSPlus },
	{ threshold: 99_0000, grade: MaimaiDxGradeLevel.SS },
	{ threshold: 98_0000, grade: MaimaiDxGradeLevel.SPlus },
	{ threshold: 97_0000, grade: MaimaiDxGradeLevel.S },
	{ threshold: 94_0000, grade: MaimaiDxGradeLevel.AAA },
	{ threshold: 90_0000, grade: MaimaiDxGradeLevel.AA },
	{ threshold: 80_0000, grade: MaimaiDxGradeLevel.A },
	{ threshold: 75_0000, grade: MaimaiDxGradeLevel.BBB },
	{ threshold: 70_0000, grade: MaimaiDxGradeLevel.BB },
	{ threshold: 60_0000, grade: MaimaiDxGradeLevel.B },
	{ threshold: 50_0000, grade: MaimaiDxGradeLevel.C }
] as const

const COMBO_STATUS_MAP = {
	1: MaimaiDxComboStatus.FC,
	2: MaimaiDxComboStatus.FCPlus,
	3: MaimaiDxComboStatus.AP,
	4: MaimaiDxComboStatus.APPlus
} as const

const SYNC_STATUS_MAP = {
	1: MaimaiDxSyncStatus.FS,
	2: MaimaiDxSyncStatus.FSPlus,
	3: MaimaiDxSyncStatus.FDX,
	4: MaimaiDxSyncStatus.FDXPlus
} as const

/**
 * ADAPTER FUNCTIONS
 * Pure functions that transform domain data
 */

export const getDifficultyFromMaimaiDxChart = (chartId: number): string => {
	return DIFFICULTY_NAMES[chartId as MaimaiDxDifficulty] ?? "Unknown"
}

export const maimaiDxBadgeColors = (chartId?: number): string => {
	return DIFFICULTY_COLORS[chartId as MaimaiDxDifficulty] ?? "border border-gray-700 text-primary"
}

export const getMaimaiDxGrade = (achievement: number): MaimaiDxGradeLevel => {
	const matchingGrade = ACHIEVEMENT_GRADE_THRESHOLDS.find(({ threshold }) => achievement >= threshold)
	return matchingGrade?.grade ?? MaimaiDxGradeLevel.D
}

export const getMaimaiDxComboStatus = (comboStatus?: number): MaimaiDxComboStatus => {
	if (!comboStatus) return MaimaiDxComboStatus.None
	return COMBO_STATUS_MAP[comboStatus as keyof typeof COMBO_STATUS_MAP] ?? MaimaiDxComboStatus.None
}

export const getMaimaiDxSyncStatus = (syncStatus?: number): MaimaiDxSyncStatus => {
	if (!syncStatus) return MaimaiDxSyncStatus.None
	return SYNC_STATUS_MAP[syncStatus as keyof typeof SYNC_STATUS_MAP] ?? MaimaiDxSyncStatus.None
}

/**
 * FORMATTING FUNCTIONS
 * Pure functions for data transformation
 */

export const formatMaimaiDxAchievement = (achievement: number): string => {
	return (achievement / 10000).toFixed(4) + "%"
}

export interface MaimaiChartData {
	chartId?: number | null
	difficulty?: number | null
}

export interface FormattedMaimaiLevel {
	value: string
	isUtage: boolean
}

export const formatMaimaiLevel = (chart: MaimaiChartData, isUtage: boolean): FormattedMaimaiLevel => {
	if (typeof chart.difficulty !== "number") {
		return { value: "?", isUtage }
	}

	const baseLevel = Math.floor(chart.difficulty)
	const decimalPart = (chart.difficulty * 10) % 10

	if (isUtage) {
		const isPlus = decimalPart >= 6
		return { value: isPlus ? `${baseLevel}+ ?` : `${baseLevel} ?`, isUtage }
	}

	return { value: chart.difficulty.toFixed(1), isUtage }
}

/**
 * CALCULATION FUNCTIONS
 * Pure functions for business logic
 */

/**
 * Calculates maimai rating from level and achievement (score)
 *
 * @param level - Chart level (e.g., 14.0 = 140)
 * @param achievement - Achievement score (e.g., 1007500 for 100.7500%)
 * @returns Rating value as integer
 */
export const calculateMaimaiRating = (level: number, achievement: number): number => {
	const records: Array<{ achievement: number; offset: number }> = [
		{ achievement: 0, offset: 0 },
		{ achievement: 100000, offset: 16 },
		{ achievement: 200000, offset: 32 },
		{ achievement: 300000, offset: 48 },
		{ achievement: 400000, offset: 64 },
		{ achievement: 500000, offset: 80 },
		{ achievement: 600000, offset: 96 },
		{ achievement: 700000, offset: 112 },
		{ achievement: 750000, offset: 120 },
		{ achievement: 799999, offset: 128 },
		{ achievement: 800000, offset: 136 },
		{ achievement: 900000, offset: 152 },
		{ achievement: 940000, offset: 168 },
		{ achievement: 969999, offset: 176 },
		{ achievement: 970000, offset: 200 },
		{ achievement: 980000, offset: 203 },
		{ achievement: 989999, offset: 206 },
		{ achievement: 990000, offset: 208 },
		{ achievement: 995000, offset: 211 },
		{ achievement: 999999, offset: 214 },
		{ achievement: 1000000, offset: 216 },
		{ achievement: 1004999, offset: 222 },
		{ achievement: 1005000, offset: 224 }
	]

	let offset = 0
	const clampedAchievement = Math.min(achievement, records[22].achievement)

	for (let i = 22; i >= 0; i--) {
		if (records[i].achievement <= clampedAchievement) {
			offset = records[i].offset
			break
		}
	}

	const scoreRate = level
	return Math.floor((scoreRate * clampedAchievement * offset) / 100000000)
}
