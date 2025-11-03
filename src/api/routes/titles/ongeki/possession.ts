import { Hono } from "hono"
import type { RowDataPacket } from "mysql2"

import { db } from "@/api/db"
import { rethrowWithMessage } from "@/api/utils/error"
import { DB } from "@/shared/types"

const OngekiPossessionRoutes = new Hono()
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

			const [playlogResults] = await db.execute<RowDataPacket[]>(
				`
					SELECT
						osp.musicId,
						osm.level,
						osm.chartId,
						MAX(osp.clearStatus) as clearStatus
					FROM ongeki_score_playlog osp
					INNER JOIN ongeki_static_music osm 
						ON osp.musicId = osm.songId 
						AND osp.level = osm.chartId 
						AND osm.version = ?
					WHERE osp.user = ?
					GROUP BY osp.musicId, osm.level, osm.chartId
					ORDER BY MAX(osp.userPlayDate) DESC
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
			const version = versions.ongeki_version

			const [results] = await db.execute<RowDataPacket[]>(
				`
					SELECT
						osp.musicId,
						osm.level,
						osm.chartId,
						MAX(osp.clearStatus) as clearStatus
					FROM ongeki_score_playlog osp
					INNER JOIN ongeki_static_music osm 
						ON osp.musicId = osm.songId 
						AND osp.level = osm.chartId 
						AND osm.version = ?
					WHERE osp.user = ?
					GROUP BY osp.musicId, osm.level, osm.chartId
					ORDER BY MAX(osp.userPlayDate) DESC
				`,
				[version, userId]
			)

			return c.json(results)
		} catch (error) {
			throw rethrowWithMessage("Failed to get possession playlog", error)
		}
	})

export { OngekiPossessionRoutes }
