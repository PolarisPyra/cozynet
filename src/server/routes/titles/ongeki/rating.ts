import { Hono } from "hono"
import type { RowDataPacket } from "mysql2"

import { db } from "@/server/db"
import { rethrowWithMessage } from "@/server/utils/error"
import { DB } from "@/app/shared/types"

type ExtendedOngekiProfileRating = DB.OngekiProfileRating & {
	score: number
	level: number
	title: string
	artist: string
	genre: string
	chartId: number
	jacketPath: string
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

const UserRatingFramesRoutes = new Hono()
	.get("user_rating_base_hot_list", async c => {
		try {
			const { userId, versions } = c.payload
			const version = versions.ongeki_version

			const [results] = await db.execute<(ExtendedOngekiProfileRating & RowDataPacket)[]>(
				`SELECT
          r.musicId,
          b.techScoreMax,
          b.platinumScoreMax,
          r.difficultId,
          r.version,
          r.type,
          r.index,
          b.isFullBell,
          b.isFullCombo,
          b.isAllBreake,
          m.title,
          m.artist,
          m.level,
          m.genre,
          m.chartId,
          m.noteCount,
          m.jacketPath,
          (SELECT userPlayDate
           FROM ongeki_score_playlog osp
           WHERE osp.musicId = r.musicId
           AND osp.level = r.difficultId
           AND osp.user = r.user
           AND osp.techScore = b.techScoreMax
           ORDER BY osp.userPlayDate DESC
           LIMIT 1) as userPlayDate,
          (SELECT isTechNewRecord
           FROM ongeki_score_playlog osp
           WHERE osp.musicId = r.musicId
           AND osp.level = r.difficultId
           AND osp.user = r.user
           AND osp.techScore = b.techScoreMax
           ORDER BY osp.userPlayDate DESC
           LIMIT 1) as isTechNewRecord,
          (SELECT isBattleNewRecord
           FROM ongeki_score_playlog osp
           WHERE osp.musicId = r.musicId
           AND osp.level = r.difficultId
           AND osp.user = r.user
           AND osp.techScore = b.techScoreMax
           ORDER BY osp.userPlayDate DESC
           LIMIT 1) as isBattleNewRecord
        FROM ongeki_profile_rating r
        JOIN ongeki_score_best b
          ON r.musicId = b.musicId
          AND r.difficultId = b.level
          AND b.user = r.user
        JOIN ongeki_static_music m
          ON r.musicId = m.songId
          AND r.difficultId = m.chartId
          AND r.version = m.version
        WHERE r.user = ?
          AND r.type = 'userRatingBaseHotList'
          AND r.version = ?`,
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
			const version = versions.ongeki_version

			const [results] = await db.execute<(ExtendedOngekiProfileRating & RowDataPacket)[]>(
				`SELECT
         r.musicId,
          b.techScoreMax,
          b.platinumScoreMax,
          r.difficultId,
          r.version,
          r.type,
          r.index,
          b.isFullBell,
          b.isFullCombo,
          b.isAllBreake,
          m.title,
          m.artist,
          m.level,
          m.genre,
          m.chartId,
          m.noteCount,
          m.jacketPath,
          (SELECT userPlayDate
           FROM ongeki_score_playlog osp
           WHERE osp.musicId = r.musicId
           AND osp.level = r.difficultId
           AND osp.user = r.user
           AND osp.techScore = b.techScoreMax
           ORDER BY osp.userPlayDate DESC
           LIMIT 1) as userPlayDate,
          (SELECT isTechNewRecord
           FROM ongeki_score_playlog osp
           WHERE osp.musicId = r.musicId
           AND osp.level = r.difficultId
           AND osp.user = r.user
           AND osp.techScore = b.techScoreMax
           ORDER BY osp.userPlayDate DESC
           LIMIT 1) as isTechNewRecord,
          (SELECT isBattleNewRecord
           FROM ongeki_score_playlog osp
           WHERE osp.musicId = r.musicId
           AND osp.level = r.difficultId
           AND osp.user = r.user
           AND osp.techScore = b.techScoreMax
           ORDER BY osp.userPlayDate DESC
           LIMIT 1) as isBattleNewRecord
        FROM ongeki_profile_rating r
        JOIN ongeki_score_best b
          ON r.musicId = b.musicId
          AND r.difficultId = b.level
          AND b.user = r.user
        JOIN ongeki_static_music m
          ON r.musicId = m.songId
          AND r.difficultId = m.chartId
          AND r.version = m.version
        WHERE r.user = ?
          AND r.type = 'userRatingBaseBestList'
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
			const version = versions.ongeki_version

			const [results] = await db.execute<(ExtendedOngekiProfileRating & RowDataPacket)[]>(
				`SELECT
          r.musicId,
          b.techScoreMax,
          b.platinumScoreMax,
          r.difficultId,
          r.version,
          r.type,
          r.index,
          b.isFullBell,
          b.isFullCombo,
          b.isAllBreake,
          m.title,
          m.artist,
          m.level,
          m.genre,
          m.chartId,
          m.noteCount,
          m.jacketPath,
          (SELECT userPlayDate
           FROM ongeki_score_playlog osp
           WHERE osp.musicId = r.musicId
           AND osp.level = r.difficultId
           AND osp.user = r.user
           AND osp.techScore = b.techScoreMax
           ORDER BY osp.userPlayDate DESC
           LIMIT 1) as userPlayDate,
          (SELECT isTechNewRecord
           FROM ongeki_score_playlog osp
           WHERE osp.musicId = r.musicId
           AND osp.level = r.difficultId
           AND osp.user = r.user
           AND osp.techScore = b.techScoreMax
           ORDER BY osp.userPlayDate DESC
           LIMIT 1) as isTechNewRecord,
          (SELECT isBattleNewRecord
           FROM ongeki_score_playlog osp
           WHERE osp.musicId = r.musicId
           AND osp.level = r.difficultId
           AND osp.user = r.user
           AND osp.techScore = b.techScoreMax
           ORDER BY osp.userPlayDate DESC
           LIMIT 1) as isBattleNewRecord
        FROM ongeki_profile_rating r
        JOIN ongeki_score_best b
          ON r.musicId = b.musicId
          AND r.difficultId = b.level
          AND b.user = r.user
        JOIN ongeki_static_music m
          ON r.musicId = m.songId
          AND r.difficultId = m.chartId
          AND r.version = m.version
        WHERE r.user = ?
          AND r.type = 'userRatingBaseBestNewList'
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
			const version = versions.ongeki_version

			const [results] = await db.execute<(ExtendedOngekiProfileRating & RowDataPacket)[]>(
				`SELECT
          r.musicId,
          b.techScoreMax,
          b.platinumScoreMax,
          r.difficultId,
          r.version,
          r.type,
          r.index,
          b.isFullBell,
          b.isFullCombo,
          b.isAllBreake,
          m.title,
          m.artist,
          m.level,
          m.genre,
          m.chartId,
          m.noteCount,
          m.jacketPath,
          (SELECT userPlayDate
           FROM ongeki_score_playlog osp
           WHERE osp.musicId = r.musicId
           AND osp.level = r.difficultId
           AND osp.user = r.user
           AND osp.techScore = b.techScoreMax
           ORDER BY osp.userPlayDate DESC
           LIMIT 1) as userPlayDate,
          (SELECT isTechNewRecord
           FROM ongeki_score_playlog osp
           WHERE osp.musicId = r.musicId
           AND osp.level = r.difficultId
           AND osp.user = r.user
           AND osp.techScore = b.techScoreMax
           ORDER BY osp.userPlayDate DESC
           LIMIT 1) as isTechNewRecord,
          (SELECT isBattleNewRecord
           FROM ongeki_score_playlog osp
           WHERE osp.musicId = r.musicId
           AND osp.level = r.difficultId
           AND osp.user = r.user
           AND osp.techScore = b.techScoreMax
           ORDER BY osp.userPlayDate DESC
           LIMIT 1) as isBattleNewRecord
        FROM ongeki_profile_rating r
        JOIN ongeki_score_best b
          ON r.musicId = b.musicId
          AND r.difficultId = b.level
          AND b.user = r.user
        JOIN ongeki_static_music m
          ON r.musicId = m.songId
          AND r.difficultId = m.chartId
          AND r.version = m.version
        WHERE r.user = ?
          AND r.type = 'userRatingBaseNextList'
          AND r.version = ?
        ORDER BY r.index`,
				[userId, version]
			)

			return c.json(results)
		} catch (error) {
			throw rethrowWithMessage("Failed to get rating base", error)
		}
	})

	.get("playerRating", async c => {
		try {
			const { userId, versions } = c.payload
			const version = versions.ongeki_version

			const [results] = await db.execute<(DB.OngekiProfileData & RowDataPacket)[]>(
				`SELECT playerRating, highestRating
        FROM ongeki_profile_data
        WHERE user = ?
        AND version = ?`,
				[userId, version]
			)

			return c.json(results)
		} catch (error) {
			throw rethrowWithMessage("Failed to get player rating", error)
		}
	})

export { UserRatingFramesRoutes as OngekiRatingRoutes }
