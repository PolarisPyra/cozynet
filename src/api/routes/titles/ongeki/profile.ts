import { Hono } from "hono"
import type { RowDataPacket } from "mysql2"

import { db } from "@/api/db"
import { rethrowWithMessage } from "@/api/utils/error"
import { DB } from "@/shared/types"

const OngekiProfileRoutes = new Hono().get("", async c => {
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

		return c.json(profileResults[0] || null)
	} catch (error) {
		throw rethrowWithMessage("Failed to get profile data", error)
	}
})

export { OngekiProfileRoutes }
