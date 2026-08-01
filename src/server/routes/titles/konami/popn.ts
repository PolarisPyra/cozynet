import { Hono } from "hono"
import type { ResultSetHeader, RowDataPacket } from "mysql2"
import { z } from "zod"

import { DB, DaphnisUserOptionKey } from "@/app/shared/types"
import { db } from "@/server/db"
import { validateJson } from "@/server/middleware/validator"
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
				1 AS cnt,
				m.title,
				m.artist,
				m.genre,
				m.category,
				m.difficulty,
				m.chartId
			FROM popn_playlog p
			LEFT JOIN (
				SELECT songId, chartId, MAX(version) AS maxVersion
				FROM popn_static_music
				GROUP BY songId, chartId
			) latest
				ON latest.songId = p.music_num
				AND latest.chartId = p.sheet_num
			LEFT JOIN popn_static_music m
				ON m.songId = latest.songId
				AND m.chartId = latest.chartId
				AND m.version = latest.maxVersion
			WHERE p.user_id = ?
			ORDER BY p.playdate DESC, p.id DESC
		`,
			[userId]
		)

		return c.json(results)
	} catch (error) {
		throw rethrowWithMessage("Failed to get Pop'n playlog", error)
	}
})

const PopnSettingsRoutes = new Hono()
	.get("forceUnlock", async c => {
		try {
			const { userId } = c.payload
			const [rows] = await db.execute<(Pick<DB.DaphnisUserOption, "value"> & RowDataPacket)[]>(
				"SELECT value FROM cozynet_user_option WHERE user = ? AND `key` = ?",
				[userId, DaphnisUserOptionKey.PopnForceUnlockSongs]
			)

			return c.json({ forceUnlockSongs: Number(rows[0]?.value ?? 0) !== 0 })
		} catch (error) {
			throw rethrowWithMessage("Failed to get Pop'n song force-unlock setting", error)
		}
	})
	.post(
		"forceUnlock",
		validateJson(z.object({ enabled: z.boolean() })),
		async c => {
			try {
				const { userId } = c.payload
				const { enabled } = await c.req.json()
				const value = enabled ? 1 : 0
				const [update] = await db.execute<ResultSetHeader>(
					"UPDATE cozynet_user_option SET value = ? WHERE user = ? AND `key` = ?",
					[value, userId, DaphnisUserOptionKey.PopnForceUnlockSongs]
				)

				if (update.affectedRows === 0) {
					await db.execute<ResultSetHeader>(
						"INSERT INTO cozynet_user_option (user, `key`, value) VALUES (?, ?, ?)",
						[userId, DaphnisUserOptionKey.PopnForceUnlockSongs, value]
					)
				}

				return c.json({ forceUnlockSongs: enabled })
			} catch (error) {
				throw rethrowWithMessage("Failed to update Pop'n song force-unlock setting", error)
			}
		}
	)

export const PopnRoutes = new Hono()
	.route("static", PopnStaticMusic)
	.route("profile", PopnProfileRoutes)
	.route("settings", PopnSettingsRoutes)
