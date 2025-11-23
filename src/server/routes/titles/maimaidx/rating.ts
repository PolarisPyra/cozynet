import { Hono } from "hono"
import type { RowDataPacket } from "mysql2"

import { DB } from "@/app/shared/types"
import { db } from "@/server/db"
import { rethrowWithMessage } from "@/server/utils/error"

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
	type: string
	index: number
}

const UserRatingFramesRoutes = new Hono()
	.get("user_rating_base_list", async c => {
		try {
			const { userId, versions } = c.payload
			const version = versions.maimaidx_version

			const [results] = await db.execute<(ExtendedMai2ProfileRating & RowDataPacket)[]>(
				`SELECT
					r.musicId,
					r.level,
					r.version,
					r.type,
					r.index,
					r.achievement,
					b.deluxscoreMax,
					b.comboStatus,
					b.syncStatus,
					m.title,
					m.artist,
					m.genre,
					m.difficulty,
					m.jacketPath,
					mp.userPlayDate
				FROM mai2_profile_rating r
				JOIN mai2_static_music m
					ON r.musicId = m.songId
					AND r.level = m.chartId
					AND m.version = (
						SELECT MIN(version)
						FROM mai2_static_music m2
						WHERE m2.songId = m.songId
						AND m2.chartId = m.chartId
					)
				LEFT JOIN mai2_score_best b
					ON r.musicId = b.musicId
					AND r.level = b.level
					AND b.user = r.user
				LEFT JOIN (
					SELECT
						musicId,
						level,
						achievement,
						userPlayDate,
						ROW_NUMBER() OVER (PARTITION BY musicId, level, achievement ORDER BY userPlayDate DESC) as rn
					FROM mai2_playlog
					WHERE user = ?
				) mp ON r.musicId = mp.musicId
					AND r.level = mp.level
					AND r.achievement = mp.achievement
					AND mp.rn = 1
				WHERE r.user = ?
					AND r.type = 'ratingList'
					AND r.version = ?
				ORDER BY r.index`,
				[userId, userId, version]
			)

			return c.json(results)
		} catch (error) {
			throw rethrowWithMessage("Failed to get rating base", error)
		}
	})
	.get("user_rating_new_list", async c => {
		try {
			const { userId, versions } = c.payload
			const version = versions.maimaidx_version

			const [results] = await db.execute<(ExtendedMai2ProfileRating & RowDataPacket)[]>(
				`SELECT
					r.musicId,
					r.level,
					r.version,
					r.type,
					r.index,
					r.achievement,
					b.deluxscoreMax,
					b.comboStatus,
					b.syncStatus,
					m.title,
					m.artist,
					m.genre,
					m.difficulty,
					m.jacketPath,
					mp.userPlayDate
				FROM mai2_profile_rating r
				JOIN mai2_static_music m
					ON r.musicId = m.songId
					AND r.level = m.chartId
					AND m.version = (
						SELECT MIN(version)
						FROM mai2_static_music m2
						WHERE m2.songId = m.songId
						AND m2.chartId = m.chartId
					)
				LEFT JOIN mai2_score_best b
					ON r.musicId = b.musicId
					AND r.level = b.level
					AND b.user = r.user
				LEFT JOIN (
					SELECT
						musicId,
						level,
						achievement,
						userPlayDate,
						ROW_NUMBER() OVER (PARTITION BY musicId, level, achievement ORDER BY userPlayDate DESC) as rn
					FROM mai2_playlog
					WHERE user = ?
				) mp ON r.musicId = mp.musicId
					AND r.level = mp.level
					AND r.achievement = mp.achievement
					AND mp.rn = 1
				WHERE r.user = ?
					AND r.type = 'newRatingList'
					AND r.version = ?
				ORDER BY r.index`,
				[userId, userId, version]
			)

			return c.json(results)
		} catch (error) {
			throw rethrowWithMessage("Failed to get rating new list", error)
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

export { UserRatingFramesRoutes }
