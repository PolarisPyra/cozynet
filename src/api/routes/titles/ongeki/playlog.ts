import { Hono } from "hono";
import type { RowDataPacket } from "mysql2";

import { db } from "@/api/db";
import { rethrowWithMessage } from "@/api/utils/error";

const OngekiProfilePlaylog = new Hono().get("playlog", async (c) => {
	try {
		const { userId, versions } = c.payload;
		const version = versions.ongeki_version;

		const [results] = await db.execute<RowDataPacket[]>(
			`
                SELECT 
                    csp.id,
                    csp.userPlayDate,
                    csp.maxCombo,
                    csp.isFullCombo,
                    csp.platinumScore,
                    csp.platinumScoreMax, 
                    csp.platinumScoreStar,
                    csp.playerRating,
                    csp.isAllBreak,
                    csp.isFullBell,
                    csp.techScore,
                    csp.battleScore,
                    csp.judgeMiss,
                    csp.judgeHit,
                    csp.judgeBreak,
                    csp.judgeCriticalBreak,
                    csp.clearStatus,
                    csp.cardId1,
                    csp.isTechNewRecord,
                    csp.isBattleNewRecord,
                    csm.chartId,  
                    csm.title, 
                    csm.level, 
                    csm.genre, 
                    csm.jacketPath,
                    csm.noteCount,
                    csm.artist
                FROM 
                    ongeki_score_playlog csp
                JOIN ongeki_profile_data d ON csp.user = d.user
                JOIN ongeki_static_music csm 
                    ON csp.musicId = csm.songId 
                    AND csp.level = csm.chartId 
                    AND csm.version = ?
                JOIN aime_card a ON d.user = a.user
                WHERE 
                    a.user = ?
                    AND d.version = ?
                ORDER BY 
                    csp.userPlayDate DESC;
                    `,
			[version, userId, version]
		);
		return c.json(results);
	} catch (error) {
		throw rethrowWithMessage("Failed to fetch ongeki playlog", error);
	}
});

export { OngekiProfilePlaylog };
