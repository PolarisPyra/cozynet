import { Hono } from "hono"
import type { RowDataPacket } from "mysql2"

import { db } from "@/api/db"
import { rethrowWithMessage } from "@/api/utils/error"
import { DB } from "@/shared/types"

const ChunithmPossessionRoutes = new Hono().get("", async c => {
	try {
		const { userId, versions } = c.payload
		const version = versions.chunithm_version

		const [results] = await db.execute<(DB.ChuniProfileData & RowDataPacket)[]>(
			`
				SELECT 
					cpd.userName,
					cpd.playerRating,
					cpd.highestRating,
					cpd.firstPlayDate,
					cpd.lastPlayDate,
					cpd.classEmblemBase,
					cpd.classEmblemMedal
				FROM chuni_profile_data cpd
				WHERE cpd.user = ? AND cpd.version = ?
			`,
			[userId, version]
		)

		return c.json(results[0])
	} catch (error) {
		throw rethrowWithMessage("Failed to get possession data", error)
	}
})

export { ChunithmPossessionRoutes }
