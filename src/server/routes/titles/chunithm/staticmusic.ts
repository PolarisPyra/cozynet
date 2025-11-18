import { Hono } from "hono"
import type { RowDataPacket } from "mysql2"

import { db } from "@/server/db"
import { rethrowWithMessage } from "@/server/utils/error"
import { DB } from "@/app/shared/types"

const ChunithmStaticMusic = new Hono().get("chuni_static_music", async c => {
	try {
		const { userId, versions } = c.payload
		const version = versions.chunithm_version
		const ULTIMA_CHART_ID = 4
		const ULTIMA_MINIMUM_VERSION = 11

		const query = `
			WITH song_chart_versions AS (
				-- Get latest and earliest versions for each song/chart combination
				SELECT
					songId,
					chartId,
					MAX(version) AS latest_version,
					MIN(version) AS earliest_version
				FROM chuni_static_music
				WHERE version <= ?
				GROUP BY songId, chartId
			),
			ultima_versions AS (
				-- Get latest ULTIMA versions for charts introduced >= version 11
				SELECT
					songId,
					chartId,
					MAX(version) AS latest_ultima_version
				FROM chuni_static_music
				WHERE version <= ?
					AND chartId = ?
					AND version >= ?
				GROUP BY songId, chartId
			),
			excluded_songs AS (
			  -- exlcude level 1 master songs (dummy charts)
				SELECT DISTINCT songId
				FROM chuni_static_music
				WHERE chartId = 3 AND level = 1
			)
			SELECT
				m.songId,
				m.title,
				m.artist,
				m.jacketPath,
				m.genre,
				m.level,
				m.chartId,
				m.opt,
				scv.earliest_version AS version
			FROM song_chart_versions scv
			LEFT JOIN ultima_versions uv
				ON uv.songId = scv.songId AND uv.chartId = scv.chartId
			INNER JOIN chuni_static_music m
				ON m.songId = scv.songId
				AND m.chartId = scv.chartId
				AND m.version = COALESCE(uv.latest_ultima_version, scv.latest_version)
			LEFT JOIN chuni_static_opts o ON m.opt = o.id
			LEFT JOIN cozynet_web_permissions dwp ON dwp.user = ?
			WHERE
				-- Permission checks
				(dwp.status = 1 OR o.isEnable = 1 OR o.name = 'A000' OR o.name IS NULL)
				-- Exclude specific songs
				AND scv.songId NOT IN (SELECT songId FROM excluded_songs)
				-- ULTIMA chart version filter
				AND (scv.chartId != ? OR scv.latest_version >= ?)
			ORDER BY scv.earliest_version DESC, m.id DESC
		`

		const params = [
			version,
			version,
			ULTIMA_CHART_ID,
			ULTIMA_MINIMUM_VERSION,
			userId,
			ULTIMA_CHART_ID,
			ULTIMA_MINIMUM_VERSION
		]

		const [results] = await db.execute<(DB.ChuniStaticMusic & RowDataPacket)[]>(
			query,
			params
		)

		return c.json(results)
	} catch (error) {
		throw rethrowWithMessage("Failed to get static music", error)
	}
})

export { ChunithmStaticMusic }
