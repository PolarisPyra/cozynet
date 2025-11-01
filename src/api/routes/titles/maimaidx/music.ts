import { Hono } from "hono"
import type { RowDataPacket } from "mysql2"

import { db } from "@/api/db"
import { rethrowWithMessage } from "@/api/utils/error"
import { Mai2StaticMusic } from "@/shared/types"

const MaimaiDXStaticMusic = new Hono().get("music", async c => {
	try {
		const { versions } = c.payload
		const version = versions.maimaidx_version

		const [results] = await db.execute<(Mai2StaticMusic & RowDataPacket)[]>(
			`WITH song_versions AS (
                -- Get the earliest version each song/chart combination appeared in
                SELECT 
                    songId, 
                    chartId, 
                    MIN(version) as earliest_version
                FROM mai2_static_music
                WHERE version <= 21
                GROUP BY songId, chartId
            )
            SELECT 
                m.songId,
                m.title,
                m.artist,
                m.genre,
                m.difficulty,
                m.chartId,
                m.jacketPath,
                sv.earliest_version as version
            FROM song_versions sv
            INNER JOIN mai2_static_music m 
                ON m.songId = sv.songId 
                AND m.chartId = sv.chartId
                AND m.version = sv.earliest_version
            ORDER BY sv.earliest_version DESC, m.id DESC`,
			[version]
		)
		return c.json(results)
	} catch (error) {
		throw rethrowWithMessage("Failed to get static music", error)
	}
})

export { MaimaiDXStaticMusic }
