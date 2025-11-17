/**
 * DOMAIN TYPES & CONSTANTS
 * Pure, immutable data structures following Adapter Pattern
 */

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
