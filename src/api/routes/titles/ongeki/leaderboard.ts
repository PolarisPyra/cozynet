import { Hono } from "hono"
import type { RowDataPacket } from "mysql2"

import { db } from "@/api/db"
import { rethrowWithMessage } from "@/api/utils/error"
import { DB } from "@/shared/types"

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
       ORDER BY
          CASE
            WHEN opd.newPlayerRating IS NOT NULL THEN opd.newPlayerRating
          END DESC,
          opd.playerRating DESC
			`,
			[version]
		)

		return c.json(results)
	} catch (error) {
		throw rethrowWithMessage("Failed to get leaderboard", error)
	}
})

export { OngekiLeaderboardRoutes }
