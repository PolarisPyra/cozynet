import { Hono } from "hono";
import type { RowDataPacket } from "mysql2";

import { db } from "@/api/db";
import { rethrowWithMessage } from "@/api/utils/error";
import { DB } from "@/shared/types";

const ChunithmLeaderboardRoutes = new Hono().get("", async (c) => {
	try {
		const { versions } = c.payload;
		const version = versions.chunithm_version;

		const [results] = await db.execute<(DB.ChuniProfileData & RowDataPacket)[]>(
			`
				SELECT 
					cpd.user,
					cpd.playerRating,
					cpd.userName 
				FROM chuni_profile_data cpd
				WHERE cpd.version = ?
				ORDER BY cpd.playerRating DESC
			`,
			[version]
		);

		return c.json(results);
	} catch (error) {
		throw rethrowWithMessage("Failed to get leaderboard", error);
	}
});

export { ChunithmLeaderboardRoutes };
