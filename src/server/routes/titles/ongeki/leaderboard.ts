import { Hono } from "hono"
import type { RowDataPacket } from "mysql2"

import { db } from "@/server/db"
import { rethrowWithMessage } from "@/server/utils/error"
import { DB } from "@/app/shared/types"

const OngekiLeaderboardRoutes = new Hono().get("", async c => {
	try {
		const { versions } = c.payload
		const version = versions.ongeki_version

		const [results] = await db.execute<(DB.OngekiProfileData & RowDataPacket)[]>(
			`
				SELECT
					opd.user,
					opd.playerRating,
					opd.userName,
					opd.newPlayerRating
				FROM ongeki_profile_data opd
				WHERE opd.version = ?
				ORDER BY COALESCE(opd.newPlayerRating, opd.playerRating) DESC
			`,
			[version]
		)

		return c.json(results)
	} catch (error) {
		throw rethrowWithMessage("Failed to get leaderboard", error)
	}
})

export { OngekiLeaderboardRoutes }
