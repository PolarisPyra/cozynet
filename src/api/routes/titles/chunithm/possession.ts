import { Hono } from "hono"
import type { RowDataPacket } from "mysql2"

import { db } from "@/api/db"
import { rethrowWithMessage } from "@/api/utils/error"
import { DB } from "@/shared/types"

const ChunithmPossessionRoutes = new Hono()
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

			const [playlogResults] = await db.execute<RowDataPacket[]>(
				`
					SELECT
						ul.musicId,
						m.level,
						m.chartId,
						MAX(ul.isClear) as isClear
					FROM chuni_score_playlog ul
					INNER JOIN chuni_static_music m 
						ON ul.musicId = m.songId
						AND ul.level = m.chartId
						AND m.version = ?
					WHERE ul.user = ?
					GROUP BY ul.musicId, m.level, m.chartId
					ORDER BY MAX(ul.userPlayDate) DESC
				`,
				[version, userId]
			)

			return c.json({
				profile: profileResults[0],
				playlog: playlogResults
			})
		} catch (error) {
			throw rethrowWithMessage("Failed to get possession data", error)
		}
	})
	.get("playlog", async c => {
		try {
			const { userId, versions } = c.payload
			const version = versions.chunithm_version

			const [results] = await db.execute<RowDataPacket[]>(
				`
					SELECT
						ul.musicId,
						m.level,
						m.chartId,
						MAX(ul.isClear) as isClear
					FROM chuni_score_playlog ul
					INNER JOIN chuni_static_music m 
						ON ul.musicId = m.songId
						AND ul.level = m.chartId
						AND m.version = ?
					WHERE ul.user = ?
					GROUP BY ul.musicId, m.level, m.chartId
					ORDER BY MAX(ul.userPlayDate) DESC
				`,
				[version, userId]
			)

			return c.json(results)
		} catch (error) {
			throw rethrowWithMessage("Failed to get possession playlog", error)
		}
	})

export { ChunithmPossessionRoutes }
