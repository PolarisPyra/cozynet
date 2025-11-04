import { Hono } from "hono"
import type { RowDataPacket } from "mysql2"

import { db } from "@/api/db"
import { rethrowWithMessage } from "@/api/utils/error"
import { DB } from "@/shared/types"

const ChunithmProfileRoutes = new Hono()
	.get("", async c => {
		try {
			const { userId, versions } = c.payload
			const version = versions.chunithm_version

			const [profileResults] = await db.execute<(DB.ChuniProfileData & RowDataPacket)[]>(
				`
					SELECT 
						cpd.*
					FROM chuni_profile_data cpd
					WHERE cpd.user = ? AND cpd.version = ?
				`,
				[userId, version]
			)

			return c.json(profileResults[0] || null)
		} catch (error) {
			throw rethrowWithMessage("Failed to get profile data", error)
		}
	})

export { ChunithmProfileRoutes }

