import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { RowDataPacket } from "mysql2"

import { DB } from "@/app/shared/types"
import { db } from "@/server/db"
import { rethrowWithMessage } from "@/server/utils/error"

const ProfileRoutes = new Hono().get("/versions", async c => {
	try {
		const { userId } = c.payload
		if (!userId) throw new HTTPException(403)

		// Get all Chunithm profile versions
		const [chunithmProfiles] = await db.execute<(DB.ChuniProfileData & RowDataPacket)[]>(
			`
					SELECT 
						version,
						userName,
						level,
						reincarnationNum,
						playerRating,
						playCount,
						lastPlayDate
					FROM chuni_profile_data
					WHERE user = ?
					ORDER BY version DESC
				`,
			[userId]
		)

		// Get all Ongeki profile versions
		const [ongekiProfiles] = await db.execute<(DB.OngekiProfileData & RowDataPacket)[]>(
			`
					SELECT 
						version,
						userName,
						level,
						reincarnationNum,
						playerRating,
						newPlayerRating,
						playCount,
						lastPlayDate
					FROM ongeki_profile_data
					WHERE user = ?
					ORDER BY version DESC
				`,
			[userId]
		)

		// Get all Maimai DX profile versions
		const [maimaiProfiles] = await db.execute<(DB.Mai2ProfileDetail & RowDataPacket)[]>(
			`
					SELECT 
						version,
						userName,
						playerRating,
						playCount,
						lastPlayDate
					FROM mai2_profile_detail
					WHERE user = ?
					ORDER BY version DESC
				`,
			[userId]
		)

		return c.json({
			chunithm: chunithmProfiles,
			ongeki: ongekiProfiles,
			maimaidx: maimaiProfiles
		})
	} catch (error) {
		if (error instanceof HTTPException) throw error
		throw rethrowWithMessage("Failed to fetch profile versions", error)
	}
})

export { ProfileRoutes }
