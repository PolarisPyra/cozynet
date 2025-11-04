import { Hono } from "hono"
import type { RowDataPacket } from "mysql2"

import { db } from "@/api/db"
import { rethrowWithMessage } from "@/api/utils/error"
import { DB } from "@/shared/types"

const ChunithmProfileRoutes = new Hono()
	.get("", async c => {
		try {
			const { userId, versions } = c.payload
			const version = versions.chunithm_version

			const [profileResults] = await db.execute<(DB.ChuniProfileData & RowDataPacket)[]>(
				`
					SELECT 
						cpd.*
					FROM chuni_profile_data cpd
					WHERE cpd.user = ? AND cpd.version = ?
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
			const { userId } = c.payload

			const [results] = await db.execute<(DB.ChuniScorePlaylog & RowDataPacket)[]>(
				`SELECT
					ul.id,
					ul.maxCombo,
					ul.isFullCombo,
					ul.userPlayDate,
					ul.playerRating,
					ul.musicId,
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
					sv.version as songVersion,
					ls.name as skillName,
					ls.categoryName
				FROM chuni_score_playlog ul
				INNER JOIN (
					SELECT songId, chartId, MIN(version) as version
					FROM chuni_static_music
					GROUP BY songId, chartId
				) sv ON ul.musicId = sv.songId AND ul.level = sv.chartId
				INNER JOIN chuni_static_music music 
					ON ul.musicId = music.songId
					AND ul.level = music.chartId
					AND music.version = sv.version
				LEFT JOIN (
					SELECT skillId, name, categoryName
					FROM (
						SELECT 
							skillId, 
							name, 
							categoryName,
							ROW_NUMBER() OVER (PARTITION BY skillId ORDER BY version DESC) as rn
						FROM daphnis_static_skill
						WHERE skillId IS NOT NULL
					) ranked
					WHERE rn = 1
				) ls ON ul.skillId = ls.skillId
				WHERE ul.user = ?
				ORDER BY ul.userPlayDate DESC
				`,
				[userId]
			)

			return c.json(results)
		} catch (error) {
			throw rethrowWithMessage("Failed to get playlog", error)
		}
	})

export { ChunithmProfileRoutes }
