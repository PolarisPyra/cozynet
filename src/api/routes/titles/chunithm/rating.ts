import { Hono } from "hono"
import type { RowDataPacket } from "mysql2"

import { db } from "@/api/db"
import { rethrowWithMessage } from "@/api/utils/error"
import { DB } from "@/shared/types"

// includes joined tables
type ExtendedChuniProfileRating = DB.ChuniProfileRating & {
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

const UserRatingFramesRoutes = new Hono()
	.get("user_rating_base_hot_list", async c => {
		try {
			const { userId, versions } = c.payload
			const version = versions.chunithm_version

			const [results] = await db.execute<(ExtendedChuniProfileRating & RowDataPacket)[]>(
				`SELECT 
					r.musicId,
					r.difficultId,
					r.version,
					r.type,
					r.index,
					r.score,
					b.isFullCombo,
					b.isAllJustice,
					b.fullChain,
					m.title,
					m.artist,
					m.level,
					m.genre,
					m.chartId,
					m.jacketPath,
					csp.userPlayDate,
					csp.fullChainKind,
					csp.isClear,
					csp.skillId,
					csp.isNewRecord
				FROM chuni_profile_rating r
				JOIN chuni_score_best b 
					ON r.musicId = b.musicId 
					AND r.difficultId = b.level
					AND b.user = r.user
				JOIN chuni_static_music m
					ON r.musicId = m.songId
					AND r.difficultId = m.chartId
					AND r.version = m.version
				LEFT JOIN (
					SELECT 
						musicId,
						level,
						user,
						score,
						userPlayDate,
						fullChainKind,
						isClear,
						skillId,
						isNewRecord,
						ROW_NUMBER() OVER (PARTITION BY musicId, level, user, score ORDER BY userPlayDate DESC) as rn
					FROM chuni_score_playlog
				) csp ON csp.musicId = r.musicId 
					AND csp.level = r.difficultId 
					AND csp.user = r.user
					AND csp.score = r.score 
					AND csp.rn = 1
				WHERE r.user = ?
					AND r.type = 'userRatingBaseHotList'
					AND r.version = ?
				ORDER BY r.index`,
				[userId, version]
			)

			return c.json(results)
		} catch (error) {
			throw rethrowWithMessage("Failed to get rating base", error)
		}
	})
	.get("user_rating_base_list", async c => {
		try {
			const { userId, versions } = c.payload
			const version = versions.chunithm_version

			const [results] = await db.execute<(ExtendedChuniProfileRating & RowDataPacket)[]>(
				`SELECT 
					r.musicId,
					r.difficultId,
					r.version,
					r.type,
					r.index,
					r.score,
					b.isFullCombo,
					b.isAllJustice,
					b.fullChain,
					m.title,
					m.artist,
					m.level,
					m.genre,
					m.chartId,
					m.jacketPath,
					csp.userPlayDate,
					csp.fullChainKind,
					csp.isClear,
					csp.skillId,
					csp.isNewRecord
				FROM chuni_profile_rating r
				JOIN chuni_score_best b 
					ON r.musicId = b.musicId 
					AND r.difficultId = b.level
					AND b.user = r.user
				JOIN chuni_static_music m
					ON r.musicId = m.songId
					AND r.difficultId = m.chartId
					AND r.version = m.version
				LEFT JOIN (
					SELECT 
						musicId,
						level,
						user,
						score,
						userPlayDate,
						fullChainKind,
						isClear,
						skillId,
						isNewRecord,
						ROW_NUMBER() OVER (PARTITION BY musicId, level, user, score ORDER BY userPlayDate DESC) as rn
					FROM chuni_score_playlog
				) csp ON csp.musicId = r.musicId 
					AND csp.level = r.difficultId 
					AND csp.user = r.user
					AND csp.score = r.score 
					AND csp.rn = 1
				WHERE r.user = ?
					AND r.type = 'userRatingBaseList'
					AND r.version = ?
				ORDER BY r.index`,
				[userId, version]
			)
			return c.json(results)
		} catch (error) {
			throw rethrowWithMessage("Failed to get rating base", error)
		}
	})
	.get("/user_rating_base_new_list", async c => {
		try {
			const { userId, versions } = c.payload
			const version = versions.chunithm_version

			const [results] = await db.execute<(ExtendedChuniProfileRating & RowDataPacket)[]>(
				`SELECT 
					r.musicId,
					r.score,
					r.difficultId,
					r.version,
					r.type,
					r.index,
					b.isFullCombo,
					b.isAllJustice,
					b.fullChain,
					m.title,
					m.artist,
					m.level,
					m.genre,
					m.chartId,
					m.jacketPath,
					csp.userPlayDate,
					csp.fullChainKind,
					csp.isClear,
					csp.skillId,
					csp.isNewRecord
				FROM chuni_profile_rating r
				JOIN chuni_score_best b 
					ON r.musicId = b.musicId 
					AND r.difficultId = b.level
					AND b.user = r.user
				JOIN chuni_static_music m
					ON r.musicId = m.songId
					AND r.difficultId = m.chartId
					AND r.version = m.version
				LEFT JOIN (
					SELECT 
						musicId,
						level,
						user,
						score,
						userPlayDate,
						fullChainKind,
						isClear,
						skillId,
						isNewRecord,
						ROW_NUMBER() OVER (PARTITION BY musicId, level, user, score ORDER BY userPlayDate DESC) as rn
					FROM chuni_score_playlog
				) csp ON csp.musicId = r.musicId 
					AND csp.level = r.difficultId 
					AND csp.user = r.user
					AND csp.score = r.score 
					AND csp.rn = 1
				WHERE r.user = ?
					AND r.type = 'userRatingBaseNewList'
					AND r.version = ?
				ORDER BY r.index`,
				[userId, version]
			)

			return c.json(results)
		} catch (error) {
			throw rethrowWithMessage("Failed to get rating base", error)
		}
	})
	.get("user_rating_base_next_list", async c => {
		try {
			const { userId, versions } = c.payload
			const version = versions.chunithm_version

			const typeFilter = Number(version) >= 17 ? "userRatingBaseNewNextList" : "userRatingBaseNextList"

			const [results] = await db.execute<(ExtendedChuniProfileRating & RowDataPacket)[]>(
				`SELECT 
					r.musicId,
					r.score,
					r.difficultId,
					r.version,
					r.type,
					r.index,
					b.isFullCombo,
					b.isAllJustice,
					m.title,
					m.artist,
					m.level,
					m.genre,
					m.chartId,
					m.jacketPath,
					csp.userPlayDate,
					csp.fullChainKind,
					csp.isClear,
					csp.skillId,
					b.fullChain,
					csp.isNewRecord
				FROM chuni_profile_rating r
				JOIN chuni_score_best b 
					ON r.musicId = b.musicId 
					AND r.difficultId = b.level
					AND b.user = r.user
				JOIN chuni_static_music m
					ON r.musicId = m.songId
					AND r.difficultId = m.chartId
					AND r.version = m.version
				LEFT JOIN (
					SELECT 
						musicId,
						level,
						user,
						score,
						userPlayDate,
						fullChainKind,
						isClear,
						skillId,
						isNewRecord,
						ROW_NUMBER() OVER (PARTITION BY musicId, level, user, score ORDER BY userPlayDate DESC) as rn
					FROM chuni_score_playlog
				) csp ON csp.musicId = r.musicId 
					AND csp.level = r.difficultId 
					AND csp.user = r.user
					AND csp.score = r.score 
					AND csp.rn = 1
				WHERE r.user = ?
					AND r.type = ?
					AND r.version = ?
				ORDER BY r.index`,
				[userId, typeFilter, version]
			)

			return c.json(results)
		} catch (error) {
			throw rethrowWithMessage("Failed to get rating base", error)
		}
	})

	.get("playerRating", async c => {
		try {
			const { userId, versions } = c.payload
			const version = versions.chunithm_version

			const [results] = await db.execute<(DB.ChuniProfileData & RowDataPacket)[]>(
				`SELECT playerRating, highestRating
				FROM chuni_profile_data 
				WHERE user = ? 
				AND version = ?`,
				[userId, version]
			)

			return c.json(results)
		} catch (error) {
			throw rethrowWithMessage("Failed to get player rating", error)
		}
	})

export { UserRatingFramesRoutes }
