import { Hono } from "hono"
import type { RowDataPacket } from "mysql2"

import { DB } from "@/app/shared/types"
import { db } from "@/server/db"
import { rethrowWithMessage } from "@/server/utils/error"

const PopnStaticMusic = new Hono().get("music", async c => {
	try {
		const [results] = await db.execute<(DB.PopnStaticMusic & RowDataPacket)[]>(`
			SELECT m.*
			FROM popn_static_music m
			INNER JOIN (
				SELECT songId, chartId, MAX(version) AS maxVersion
				FROM popn_static_music
				GROUP BY songId, chartId
			) latest
				ON latest.songId = m.songId
				AND latest.chartId = m.chartId
				AND latest.maxVersion = m.version
			ORDER BY m.songId, m.chartId
		`)

		return c.json(results)
	} catch (error) {
		throw rethrowWithMessage("Failed to get Pop'n static music", error)
	}
})

const PopnProfileRoutes = new Hono().get("playlog", async c => {
	try {
		const { userId } = c.payload
		const [results] = await db.execute<(DB.PopnPlaylog & RowDataPacket)[]>(
			`
			SELECT
				p.*,
				latest.cnt AS cnt,
				m.title,
				m.artist,
				m.genre,
				m.category,
				m.difficulty,
				m.chartId
			FROM popn_playlog p
			INNER JOIN (
				SELECT music_num, sheet_num, MAX(id) AS latestId, COUNT(*) AS cnt
				FROM popn_playlog
				WHERE user_id = ?
				GROUP BY music_num, sheet_num
			) latest
				ON latest.latestId = p.id
			INNER JOIN popn_static_music m
				ON m.songId = p.music_num
				AND m.chartId = p.sheet_num
				AND m.version = (
					SELECT MAX(mv.version)
					FROM popn_static_music mv
					WHERE mv.songId = m.songId AND mv.chartId = m.chartId
				)
			WHERE p.user_id = ?
			ORDER BY p.playdate DESC, p.id DESC
		`,
			[userId, userId]
		)

		return c.json(results)
	} catch (error) {
		throw rethrowWithMessage("Failed to get Pop'n playlog", error)
	}
})

export const PopnRoutes = new Hono().route("static", PopnStaticMusic).route("profile", PopnProfileRoutes)
