import { Hono } from "hono";
import type { RowDataPacket } from "mysql2";

import { db } from "@/api/db";
import { rethrowWithMessage } from "@/api/utils/error";
import { DB } from "@/shared/types";

const ChunithmScorePlaylog = new Hono().get("playlog", async (c) => {
	try {
		const { userId } = c.payload;

		const [results] = await db.execute<(DB.ChuniScorePlaylog & RowDataPacket)[]>(
			`WITH song_versions AS (
				SELECT songId, chartId, MIN(version) as version
				FROM chuni_static_music
				GROUP BY songId, chartId
			),
			user_logs AS (
				SELECT 
					id, maxCombo, isFullCombo, userPlayDate, playerRating, isAllJustice,
					score, judgeHeaven, judgeGuilty, judgeJustice, judgeAttack, judgeCritical,
					isClear, romVersion, skillId, isNewRecord, fullChainKind,
					musicId, level
				FROM chuni_score_playlog
				WHERE user = ?
			)
			SELECT
				ul.id,
				ul.maxCombo,
				ul.isFullCombo,
				ul.userPlayDate,
				ul.playerRating,
				ul.isAllJustice,
				ul.score,
				ul.judgeHeaven,
				ul.judgeGuilty,
				ul.judgeJustice,
				ul.judgeAttack,
				ul.judgeCritical,
				ul.isClear,
				ul.romVersion,
				ul.skillId,
				ul.isNewRecord,
				ul.fullChainKind,
				music.chartId,  
				music.title,
				music.level,
				music.genre,
				music.jacketPath,
				music.artist,
				song_versions.version as songVersion,
				skills.name as skillName,
				skills.categoryName
			FROM
				user_logs ul
				INNER JOIN song_versions ON ul.musicId = song_versions.songId 
					AND ul.level = song_versions.chartId
				INNER JOIN chuni_static_music music ON ul.musicId = music.songId
					AND ul.level = music.chartId
					AND music.version = song_versions.version
				LEFT JOIN daphnis_static_skill skills ON ul.skillId = skills.skillId
					AND skills.version = song_versions.version
			ORDER BY
				ul.userPlayDate DESC
			`,
			[userId]
		);

		return c.json(results);
	} catch (error) {
		throw rethrowWithMessage("Failed to get static music", error);
	}
});

export { ChunithmScorePlaylog };
