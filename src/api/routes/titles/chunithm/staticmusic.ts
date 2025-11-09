import { Hono } from "hono"
import type { RowDataPacket } from "mysql2"

import { db } from "@/api/db"
import { rethrowWithMessage } from "@/api/utils/error"
import { DB } from "@/shared/types"

const ChunithmStaticMusic = new Hono().get("chuni_static_music", async c => {
	try {
		const { userId, versions } = c.payload
		const version = versions.chunithm_version
		const ULTIMA_CHART_ID = 4
		const ULTIMA_MINIMUM_VERSION = 11

		const [results] = await db.execute<(DB.ChuniStaticMusic & RowDataPacket)[]>(
			`
			SELECT 
				m.songId,
				m.title,
				m.artist,
				m.jacketPath,
				m.genre,
				m.level,
				m.chartId,
				m.opt,
				ev.earliest_version AS version
			FROM (
				-- Latest version for each song/chart up to user's selected version (for level data)
				SELECT songId, chartId, MAX(version) AS latest_version
				FROM chuni_static_music
				WHERE version <= ?
				GROUP BY songId, chartId
			) sv
			INNER JOIN (
				-- Earliest version for each song/chart (for version logo)
				SELECT songId, chartId, MIN(version) AS earliest_version
				FROM chuni_static_music
				WHERE version <= ?
				GROUP BY songId, chartId
			) ev ON ev.songId = sv.songId AND ev.chartId = sv.chartId
			LEFT JOIN (
				-- Latest ULTIMA versions for charts introduced >= version 11
				SELECT songId, chartId, MAX(version) AS latest_ultima_version
				FROM chuni_static_music
				WHERE version <= ? AND chartId = ? AND version >= ?
				GROUP BY songId, chartId
			) uv ON uv.songId = sv.songId AND uv.chartId = sv.chartId
			INNER JOIN chuni_static_music m
				ON m.songId = sv.songId
				AND m.chartId = sv.chartId
				AND m.version = COALESCE(uv.latest_ultima_version, sv.latest_version)
			LEFT JOIN chuni_static_opts o ON m.opt = o.id
			LEFT JOIN daphnis_web_permissions dwp ON dwp.user = ?
		
				AND sv.son	WHERE (dwp.status = 1 OR o.isEnable = 1 OR o.name = 'A000' OR o.name IS NULL)gId NOT IN (
					SELECT songId 
					FROM chuni_static_music 
					WHERE chartId = 3 AND level = 1
				)
				AND (sv.chartId != ? OR sv.latest_version >= ?)
			ORDER BY ev.earliest_version DESC, m.id DESC
			`,
			[
				version,
				version,
				version,
				ULTIMA_CHART_ID,
				ULTIMA_MINIMUM_VERSION,
				userId,
				ULTIMA_CHART_ID,
				ULTIMA_MINIMUM_VERSION
			]
		)

		return c.json(results)
	} catch (error) {
		throw rethrowWithMessage("Failed to get static music", error)
	}
})

export { ChunithmStaticMusic }
