import { Hono } from "hono";
import type { RowDataPacket } from "mysql2";

import { db } from "@/api/db";
import { rethrowWithMessage } from "@/api/utils/error";
import { DB } from "@/shared/types";

type ExtendedOngekiProfileRating = DB.OngekiProfileRating & {
	score: number;
	level: number;
	title: string;
	artist: string;
	genre: string;
	chartId: number;
	jacketPath?: string;
	noteCount: number;
	isFullBell?: number;
	isFullCombo?: number;
	isAllBreake?: number;
	userPlayDate?: string;
	isTechNewRecord?: number;
	isBattleNewRecord?: number;
};

const NewUserRatingFramesRoutes = new Hono()
	.get("userNewRatingBaseBestList", async (c) => {
		try {
			const { userId, versions } = c.payload;
			const version = versions.ongeki_version;

			const [results] = await db.execute<(ExtendedOngekiProfileRating & RowDataPacket)[]>(
				`SELECT 
          r.musicId,
          b.techScoreMax,
          b.platinumScoreMax,
          b.platinumScoreStar,
          r.difficultId,
          r.version,
          r.type,
          r.index,
          b.isFullBell,
          b.isFullCombo,
          b.isAllBreake,
          m.title,
          m.artist,
          m.noteCount,
          m.level,
          m.genre,
          m.chartId,
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
          AND r.type = 'userNewRatingBaseBestList'
          AND r.version = ?`,
				[userId, version]
			);
			return c.json(results);
		} catch (error) {
			throw rethrowWithMessage("Failed to get rating base", error);
		}
	})
	.get("userNewRatingBasePScoreList", async (c) => {
		try {
			const { userId, versions } = c.payload;
			const version = versions.ongeki_version;

			const [results] = await db.execute<(ExtendedOngekiProfileRating & RowDataPacket)[]>(
				`SELECT 
          r.musicId,
          b.techScoreMax,
          b.platinumScoreMax,
          b.platinumScoreStar,
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
          AND r.type = 'userNewRatingBasePScoreList'
          AND r.version = ?
        ORDER BY r.index`,
				[userId, version]
			);

			return c.json(results);
		} catch (error) {
			throw rethrowWithMessage("Failed to get rating base", error);
		}
	})
	.get("userNewRatingBaseBestNewList", async (c) => {
		try {
			const { userId, versions } = c.payload;
			const version = versions.ongeki_version;

			const [results] = await db.execute<(ExtendedOngekiProfileRating & RowDataPacket)[]>(
				`SELECT 
          r.musicId,
          b.techScoreMax,
          b.platinumScoreMax,
          b.platinumScoreStar,
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
          AND r.type = 'userNewRatingBaseBestNewList'
          AND r.version = ?
        ORDER BY r.index`,
				[userId, version]
			);

			return c.json(results);
		} catch (error) {
			throw rethrowWithMessage("Failed to get rating base", error);
		}
	})
	.get("userNewRatingBaseNextBestList", async (c) => {
		try {
			const { userId, versions } = c.payload;
			const version = versions.ongeki_version;

			const [results] = await db.execute<(ExtendedOngekiProfileRating & RowDataPacket)[]>(
				`SELECT 
          r.musicId,
          b.techScoreMax,
          b.platinumScoreMax,
          b.platinumScoreStar,
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
          AND r.type = 'userNewRatingBaseNextBestList'
          AND r.version = ?
        ORDER BY r.index`,
				[userId, version]
			);

			return c.json(results);
		} catch (error) {
			throw rethrowWithMessage("Failed to get rating base", error);
		}
	})

	.get("newPlayerRating", async (c) => {
		try {
			const { userId, versions } = c.payload;
			const version = versions.ongeki_version;

			const [results] = await db.execute<(DB.OngekiProfileData & RowDataPacket)[]>(
				`SELECT newPlayerRating, newHighestRating
        FROM ongeki_profile_data 
        WHERE user = ? 
        AND version = ?`,
				[userId, version]
			);

			return c.json(results);
		} catch (error) {
			throw rethrowWithMessage("Failed to get player rating", error);
		}
	});

export { NewUserRatingFramesRoutes };
