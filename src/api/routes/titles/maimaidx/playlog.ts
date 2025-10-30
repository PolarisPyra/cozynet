import { Hono } from "hono";
import type { RowDataPacket } from "mysql2";

import { db } from "@/api/db";
import { rethrowWithMessage } from "@/api/utils/error";
import { Mai2Playlog } from "@/shared/types";

const MaimaiDXPlaylogRoute = new Hono().get("playlog", async (c) => {
	try {
		const { userId, versions } = c.payload;
		const version = versions.maimaidx_version;

		const [results] = await db.execute<(Mai2Playlog & RowDataPacket)[]>(
			`WITH song_versions AS (
                -- Get the earliest version each song/chart combination appeared in
                SELECT 
                    songId, 
                    chartId, 
                    MIN(version) as version
                FROM mai2_static_music
                GROUP BY songId, chartId
            )
            SELECT
                mp.id,
                mp.musicId,
                mp.level,
                mp.maxCombo,
                mp.isClear,
                mp.userPlayDate,
                mp.achievement,
                mp.deluxscore,
                mp.comboStatus,
                mp.syncStatus,
                msm.title,
                msm.difficulty,
                msm.genre,
                msm.artist,
                sv.version as songVersion
            FROM mai2_playlog mp
            INNER JOIN mai2_profile_detail pd 
                ON mp.user = pd.user
            INNER JOIN song_versions sv 
                ON mp.musicId = sv.songId 
                AND mp.level = sv.chartId
            INNER JOIN mai2_static_music msm 
                ON mp.musicId = msm.songId
                AND mp.level = msm.chartId
                AND msm.version = sv.version
            WHERE mp.user = ? 
                AND pd.version = ?
            ORDER BY mp.userPlayDate DESC`,
			[userId, version]
		);
		return c.json(results);
	} catch (error) {
		throw rethrowWithMessage("Failed to get playlog", error);
	}
});

export { MaimaiDXPlaylogRoute };
