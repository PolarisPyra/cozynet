import { Hono } from "hono"
import type { RowDataPacket } from "mysql2"

import { DB } from "@/app/shared/types"
import { db } from "@/server/db"
import { rethrowWithMessage } from "@/server/utils/error"

const OngekiProfileRoutes = new Hono()
	.get("", async c => {
		try {
			const { userId, versions } = c.payload
			const version = versions.ongeki_version

			const [profileResults] = await db.execute<(DB.OngekiProfileData & RowDataPacket)[]>(
				`
					SELECT
						opd.*
					FROM ongeki_profile_data opd
					WHERE opd.user = ? AND opd.version = ?
				`,
				[userId, version]
			)

			return c.json(profileResults[0] || null)
		} catch (error) {
			throw rethrowWithMessage("Failed to get profile data", error)
		}
	})
	.get("playlog", async c => {
		try {
			const { userId, versions } = c.payload
			const version = versions.ongeki_version

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
                    csp.musicId,
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
                    csm.artist,
                    ev.earliest_version as songVersion
                FROM
                    ongeki_score_playlog csp
                JOIN ongeki_profile_data d ON csp.user = d.user
                JOIN ongeki_static_music csm
                    ON csp.musicId = csm.songId
                    AND csp.level = csm.chartId
                    AND csm.version = ?
                INNER JOIN (
                    SELECT songId, chartId, MIN(version) as earliest_version
                    FROM ongeki_static_music
                    GROUP BY songId, chartId
                ) ev ON csm.songId = ev.songId AND csm.chartId = ev.chartId
                JOIN aime_card a ON d.user = a.user
                WHERE
                    a.user = ?
                    AND d.version = ?
                ORDER BY
                    csp.userPlayDate DESC;
                    `,
				[version, userId, version]
			)
			return c.json(results)
		} catch (error) {
			throw rethrowWithMessage("Failed to fetch ongeki playlog", error)
		}
	})

export { OngekiProfileRoutes }
