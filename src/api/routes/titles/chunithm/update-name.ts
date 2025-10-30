import { Hono } from "hono";
import type { ResultSetHeader } from "mysql2";
import { z } from "zod";

import { db } from "@/api/db";
import { validateJson } from "@/api/middleware/validator";
import { rethrowWithMessage } from "@/api/utils/error";

const UsernameRoutes = new Hono().post(
	"update",
	validateJson(
		z.object({
			userName: z.string(),
		})
	),
	async (c) => {
		try {
			const { userId, versions } = c.payload;
			const { userName } = await c.req.json();
			const version = versions.chunithm_version;

			const [update] = await db.execute<ResultSetHeader>(
				`
           UPDATE chuni_profile_data
           SET userName = ?
           WHERE user = ?
           AND version = ?`,
				[userName, userId, version]
			);

			return c.json(update);
		} catch (error) {
			throw rethrowWithMessage("Failed to update username", error);
		}
	}
);

export { UsernameRoutes };
