import { DB } from "./db"

export type ChunithmPlaylog = DB.ChuniScorePlaylog & {
	chartId?: number | null
	jacketPath?: string | null
	artist?: string | null
	genre?: string | null
	categoryName?: string | null
	title?: string | null
	level?: number | null
	songVersion?: number
	skillName?: string | null
	isImported?: number | null
}

export type OngekiPlaylog = DB.OngekiScorePlaylog & {
	chartId: number | null
	jacketPath: string | null
	artist: string | null
	genre: string | null
	title: string | null
	level: number | null
	noteCount: number | null
	platinumScore: number | null
	platinumScoreMax: number | null
	platinumScoreStar: number | null
	isTechNewRecord?: number | null
	isBattleNewRecord?: number | null
	earliest_version?: number
	scoreVersion?: number | null
	isImported?: number | null
}

export type Mai2Playlog = DB.Mai2Playlog & {
	title: string | null
	difficulty: number | null
	genre: string | null
	artist: string | null
	jacketPath: string | null
	songVersion: number
}

export type PopnPlaylog = DB.PopnPlaylog &
	Record<string, unknown> & {
		title: string | null
		artist: string | null
		genre: string | null
		category: string | null
		difficulty: number | null
		chartId: number | null
	}

export type ChunithmStaticMusic = DB.ChuniStaticMusic & {
	charts: Array<{ chartId: number | null; level: number | null }>
}

export type OngekiStaticMusic = DB.OngekiStaticMusic & {
	charts: Array<{ chartId: number | null; level: number | null }>
}

export type Mai2StaticMusic = DB.Mai2StaticMusic & {
	charts: Array<{ chartId: number | null; difficulty: number | null; level: number | null }>
}

export type PopnStaticMusic = DB.PopnStaticMusic & Record<string, unknown>

export type ChunithmRating = DB.ChuniProfileRating & {
	score: number
	level: number
	title: string
	artist: string
	genre: string
	chartId: number
	jacketPath: string
	isFullCombo: number
	isAllJustice: number
	fullChain: number
	fullChainKind: number
	isClear: number
	skillId?: number
	userPlayDate?: string
	isNewRecord?: number
}

export type MaimaiRating = {
	musicId: number
	level: number
	version: number
	achievement: number
	deluxscoreMax: number | null
	comboStatus: number | null
	syncStatus: number | null
	title: string
	artist: string
	genre: string
	difficulty: number
	jacketPath: string
	userPlayDate: string | null
	rating: number
}

export type OngekiRating = DB.OngekiProfileRating & {
	score: number
	level: number
	title: string
	artist: string
	genre: string
	chartId: number
	jacketPath?: string
	isFullBell?: number
	isFullCombo?: number
	noteCount: number
	platinumScoreStar?: number
	platinumScoreMax?: number
	isAllBreake?: number
	userPlayDate?: string
	isTechNewRecord?: number
	isBattleNewRecord?: number
}

export type ChunithmLeaderboard = DB.ChuniProfileData & {
	username: string | null
	title: string | null
	jacketPath: string | null
}

export type OngekiLeaderboard = DB.OngekiProfileData & {
	username: string | null
	title: string | null
	jacketPath: string | null
}

export type ChunithmFavorite = DB.ChuniItemFavorite & {
	title: string | null
	jacketPath: string | null
	artist: string | null
	genre: string | null
	level: number | null
	chartId: number | null
}

export type ChunithmRival = DB.AimeUser & {
	isRival?: boolean
	playerRating?: number | null
}

export type Playlog = ChunithmPlaylog | OngekiPlaylog | Mai2Playlog

export type StaticMusic = ChunithmStaticMusic | OngekiStaticMusic | Mai2StaticMusic

export type Rating = ChunithmRating | OngekiRating

export type Leaderboard = ChunithmLeaderboard | OngekiLeaderboard
