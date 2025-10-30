import { Hono } from "hono";
import type { RowDataPacket } from "mysql2";

import { db } from "@/api/db";
import { rethrowWithMessage } from "@/api/utils/error";
import { DB } from "@/shared/types";

const OngekiStaticMusic = new Hono().get("music", async (c) => {
	try {
		const { userId, versions } = c.payload;
		const version = versions.ongeki_version;

		const [results] = await db.execute<(DB.OngekiStaticMusic & RowDataPacket)[]>(
			`SELECT 
            m.songId,
            m.title,
            m.artist,
            m.jacketPath,
            m.genre,
            m.level,
            m.chartId,
            m.opt,
            earliest.version 
        FROM ongeki_static_music m
        INNER JOIN (
            SELECT songId, chartId, MAX(version) AS maxVersion, MIN(version) AS version
            FROM ongeki_static_music
            WHERE version <= ?
            GROUP BY songId, chartId
        ) AS earliest
        ON m.songId = earliest.songId AND m.chartId = earliest.chartId AND m.version = earliest.maxVersion
        LEFT JOIN ongeki_static_opt o ON m.opt = o.id
		LEFT JOIN daphnis_web_permissions dwp ON dwp.user = ?
		WHERE (dwp.status = 1 OR o.isEnable = 1 OR o.name = 'A000' OR o.name IS NULL)
        ORDER BY earliest.version DESC, m.id DESC`,
			[version, userId]
		);
		return c.json(results);
	} catch (error) {
		throw rethrowWithMessage("Failed to get static music", error);
	}
});
export { OngekiStaticMusic };
