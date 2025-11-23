import { Hono } from "hono"
import type { RowDataPacket } from "mysql2"

import { DB } from "@/app/shared/types"
import { db } from "@/server/db"
import { rethrowWithMessage } from "@/server/utils/error"

// includes joined tables
type ExtendedMai2ProfileRating = {
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
	difficulty: number | null
	jacketPath: string
	userPlayDate: string | null
}

const UserRatingFramesRoutes = new Hono()
	.get("user_rating_base_list", async c => {
		try {
			const { userId, versions } = c.payload
			const version = versions.maimaidx_version

			// Get rating list from mai2_profile_rating
			const [ratingData] = await db.execute<(DB.Mai2ProfileRating & RowDataPacket)[]>(
				`SELECT ratingList
				FROM mai2_profile_rating
				WHERE user = ?
				AND version = ?`,
				[userId, version]
			)

			if (!ratingData.length || !ratingData[0].ratingList) {
				return c.json([])
			}

			// Parse comma-separated rating list: "musicId:level:romVersion:achievement"
			const ratingList = ratingData[0].ratingList.split(",")
			const ratingPairs: Array<{ musicId: number; level: number; achievement: number }> = []

			for (const record of ratingList) {
				if (!record) continue
				const [musicIdStr, levelStr, , achievementStr] = record.split(":")
				const musicId = Number(musicIdStr)
				const level = Number(levelStr)
				const achievement = Number(achievementStr)

				if (!musicId || !level || !achievement) continue

				ratingPairs.push({ musicId, level, achievement })
			}

			if (ratingPairs.length === 0) {
				return c.json([])
			}

			// Build WHERE clause for music info
			const musicConditions = ratingPairs.map(() => "(songId = ? AND chartId = ?)").join(" OR ")
			const musicParams = ratingPairs.flatMap(p => [p.musicId, p.level])

			// Get all music info in one query
			const [musicInfo] = await db.execute<(DB.Mai2StaticMusic & RowDataPacket)[]>(
				`SELECT songId, title, artist, genre, difficulty, level, jacketPath, version, chartId
				FROM mai2_static_music
				WHERE (${musicConditions})
				AND version = (
					SELECT MIN(version)
					FROM mai2_static_music m2
					WHERE m2.songId = mai2_static_music.songId
					AND m2.chartId = mai2_static_music.chartId
				)`,
				musicParams
			)

			// Build maps for quick lookup
			const musicMap = new Map<string, DB.Mai2StaticMusic>()
			for (const music of musicInfo) {
				const key = `${music.songId}:${music.chartId}`
				if (!musicMap.has(key)) {
					musicMap.set(key, music)
				}
			}

			// Build WHERE clause for best scores
			const bestScoreConditions = ratingPairs.map(() => "(musicId = ? AND level = ?)").join(" OR ")
			const bestScoreParams = ratingPairs.flatMap(p => [p.musicId, p.level])

			// Get all best score info in one query
			const [bestScores] = await db.execute<(DB.Mai2ScoreBest & RowDataPacket)[]>(
				`SELECT musicId, level, deluxscoreMax, comboStatus, syncStatus
				FROM mai2_score_best
				WHERE user = ?
				AND (${bestScoreConditions})`,
				[userId, ...bestScoreParams]
			)

			// Build map for best scores
			const bestScoreMap = new Map<string, DB.Mai2ScoreBest>()
			for (const score of bestScores) {
				const key = `${score.musicId}:${score.level}`
				bestScoreMap.set(key, score)
			}

			// Build WHERE clause for playlog dates
			const playlogConditions = ratingPairs.map(() => "(musicId = ? AND level = ? AND achievement = ?)").join(" OR ")
			const playlogParams = ratingPairs.flatMap(p => [p.musicId, p.level, p.achievement])

			// Get playlog dates using window function for latest date per music/level/achievement
			const [playlogs] = await db.execute<(DB.Mai2Playlog & RowDataPacket & { rn: number })[]>(
				`SELECT
					musicId,
					level,
					achievement,
					userPlayDate,
					ROW_NUMBER() OVER (PARTITION BY musicId, level, achievement ORDER BY userPlayDate DESC) as rn
				FROM mai2_playlog
				WHERE user = ?
				AND (${playlogConditions})`,
				[userId, ...playlogParams]
			)

			// Build map for playlog dates (only latest)
			const playlogMap = new Map<string, string>()
			for (const playlog of playlogs) {
				if (playlog.rn === 1) {
					const key = `${playlog.musicId}:${playlog.level}:${playlog.achievement}`
					if (playlog.userPlayDate) {
						playlogMap.set(key, playlog.userPlayDate)
					}
				}
			}

			// Build results array maintaining order from ratingPairs
			const results: ExtendedMai2ProfileRating[] = []
			for (const pair of ratingPairs) {
				const musicKey = `${pair.musicId}:${pair.level}`
				const music = musicMap.get(musicKey)
				if (!music) continue

				const bestScore = bestScoreMap.get(musicKey)
				const playlogKey = `${pair.musicId}:${pair.level}:${pair.achievement}`
				const userPlayDate = playlogMap.get(playlogKey) ?? null

				results.push({
					musicId: pair.musicId,
					level: pair.level,
					version: music.version,
					achievement: pair.achievement,
					deluxscoreMax: bestScore?.deluxscoreMax ?? null,
					comboStatus: bestScore?.comboStatus ?? null,
					syncStatus: bestScore?.syncStatus ?? null,
					title: music.title ?? "",
					artist: music.artist ?? "",
					genre: music.genre ?? "",
					difficulty: music.difficulty ?? null,
					jacketPath: music.jacketPath ?? "",
					userPlayDate
				})
			}

			return c.json(results)
		} catch (error) {
			throw rethrowWithMessage("Failed to get rating base", error)
		}
	})
	.get("user_rating_new_list", async c => {
		try {
			const { userId, versions } = c.payload
			const version = versions.maimaidx_version

			// Get new rating list from mai2_profile_rating
			const [ratingData] = await db.execute<(DB.Mai2ProfileRating & RowDataPacket)[]>(
				`SELECT newRatingList
				FROM mai2_profile_rating
				WHERE user = ?
				AND version = ?`,
				[userId, version]
			)

			if (!ratingData.length || !ratingData[0].newRatingList) {
				return c.json([])
			}

			// Parse comma-separated rating list: "musicId:level:romVersion:achievement"
			const ratingList = ratingData[0].newRatingList.split(",")
			const ratingPairs: Array<{ musicId: number; level: number; achievement: number }> = []

			for (const record of ratingList) {
				if (!record) continue
				const [musicIdStr, levelStr, , achievementStr] = record.split(":")
				const musicId = Number(musicIdStr)
				const level = Number(levelStr)
				const achievement = Number(achievementStr)

				if (!musicId || !level || !achievement) continue

				ratingPairs.push({ musicId, level, achievement })
			}

			if (ratingPairs.length === 0) {
				return c.json([])
			}

			// Build WHERE clause for music info
			const musicConditions = ratingPairs.map(() => "(songId = ? AND chartId = ?)").join(" OR ")
			const musicParams = ratingPairs.flatMap(p => [p.musicId, p.level])

			// Get all music info in one query
			const [musicInfo] = await db.execute<(DB.Mai2StaticMusic & RowDataPacket)[]>(
				`SELECT songId, title, artist, genre, difficulty, level, jacketPath, version, chartId
				FROM mai2_static_music
				WHERE (${musicConditions})
				AND version = (
					SELECT MIN(version)
					FROM mai2_static_music m2
					WHERE m2.songId = mai2_static_music.songId
					AND m2.chartId = mai2_static_music.chartId
				)`,
				musicParams
			)

			// Build maps for quick lookup
			const musicMap = new Map<string, DB.Mai2StaticMusic>()
			for (const music of musicInfo) {
				const key = `${music.songId}:${music.chartId}`
				if (!musicMap.has(key)) {
					musicMap.set(key, music)
				}
			}

			// Build WHERE clause for best scores
			const bestScoreConditions = ratingPairs.map(() => "(musicId = ? AND level = ?)").join(" OR ")
			const bestScoreParams = ratingPairs.flatMap(p => [p.musicId, p.level])

			// Get all best score info in one query
			const [bestScores] = await db.execute<(DB.Mai2ScoreBest & RowDataPacket)[]>(
				`SELECT musicId, level, deluxscoreMax, comboStatus, syncStatus
				FROM mai2_score_best
				WHERE user = ?
				AND (${bestScoreConditions})`,
				[userId, ...bestScoreParams]
			)

			// Build map for best scores
			const bestScoreMap = new Map<string, DB.Mai2ScoreBest>()
			for (const score of bestScores) {
				const key = `${score.musicId}:${score.level}`
				bestScoreMap.set(key, score)
			}

			// Build WHERE clause for playlog dates
			const playlogConditions = ratingPairs.map(() => "(musicId = ? AND level = ? AND achievement = ?)").join(" OR ")
			const playlogParams = ratingPairs.flatMap(p => [p.musicId, p.level, p.achievement])

			// Get playlog dates using window function for latest date per music/level/achievement
			const [playlogs] = await db.execute<(DB.Mai2Playlog & RowDataPacket & { rn: number })[]>(
				`SELECT
					musicId,
					level,
					achievement,
					userPlayDate,
					ROW_NUMBER() OVER (PARTITION BY musicId, level, achievement ORDER BY userPlayDate DESC) as rn
				FROM mai2_playlog
				WHERE user = ?
				AND (${playlogConditions})`,
				[userId, ...playlogParams]
			)

			// Build map for playlog dates (only latest)
			const playlogMap = new Map<string, string>()
			for (const playlog of playlogs) {
				if (playlog.rn === 1) {
					const key = `${playlog.musicId}:${playlog.level}:${playlog.achievement}`
					if (playlog.userPlayDate) {
						playlogMap.set(key, playlog.userPlayDate)
					}
				}
			}

			// Build results array maintaining order from ratingPairs
			const results: ExtendedMai2ProfileRating[] = []
			for (const pair of ratingPairs) {
				const musicKey = `${pair.musicId}:${pair.level}`
				const music = musicMap.get(musicKey)
				if (!music) continue

				const bestScore = bestScoreMap.get(musicKey)
				const playlogKey = `${pair.musicId}:${pair.level}:${pair.achievement}`
				const userPlayDate = playlogMap.get(playlogKey) ?? null

				results.push({
					musicId: pair.musicId,
					level: pair.level,
					version: music.version,
					achievement: pair.achievement,
					deluxscoreMax: bestScore?.deluxscoreMax ?? null,
					comboStatus: bestScore?.comboStatus ?? null,
					syncStatus: bestScore?.syncStatus ?? null,
					title: music.title ?? "",
					artist: music.artist ?? "",
					genre: music.genre ?? "",
					difficulty: music.difficulty ?? null,
					jacketPath: music.jacketPath ?? "",
					userPlayDate
				})
			}

			return c.json(results)
		} catch (error) {
			throw rethrowWithMessage("Failed to get rating base", error)
		}
	})
	.get("playerRating", async c => {
		try {
			const { userId, versions } = c.payload
			const version = versions.maimaidx_version

			const [results] = await db.execute<(DB.Mai2ProfileDetail & RowDataPacket)[]>(
				`SELECT playerRating, highestRating
				FROM mai2_profile_detail
				WHERE user = ?
				AND version = ?`,
				[userId, version]
			)

			return c.json(results)
		} catch (error) {
			throw rethrowWithMessage("Failed to get player rating", error)
		}
	})

export { UserRatingFramesRoutes as MaimaiDXRatingRoutes }
