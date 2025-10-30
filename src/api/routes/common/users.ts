import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";

import { db } from "@/api/db";
import { validateJson } from "@/api/middleware/validator";
import { rethrowWithMessage } from "@/api/utils/error";
import { UserRole } from "@/shared/types";

enum PermissionType {
	Upload = "has_upload",
	Download = "has_download",
	Special = "has_special",
}

enum PermissionValue {
	Disabled = 0,
	Enabled = 1,
}

const UserRoutes = new Hono()
	.post("/verify", async (c) => {
		try {
			return c.json(c.payload);
		} catch (error) {
			throw rethrowWithMessage("Failed to verify user", error);
		}
	})
	.get("/roles", async (c) => {
		try {
			const userId = c.payload.userId;
			if (!userId) throw new HTTPException(403);

			const [rows] = await db.execute<({ key: string; value: number } & RowDataPacket)[]>(
				"SELECT `key`, value FROM daphnis_user_option WHERE user = ? AND `key` IN ('has_upload', 'has_download', 'has_special')",
				[userId]
			);

			// Initialize with default values (all disabled)
			const roles = {
				upload: PermissionValue.Disabled,
				download: PermissionValue.Disabled,
				special: PermissionValue.Disabled,
			};

			// Assign the actual values from database
			for (const row of rows) {
				if (row.key === PermissionType.Upload) roles.upload = row.value;
				if (row.key === PermissionType.Download) roles.download = row.value;
				if (row.key === PermissionType.Special) roles.special = row.value;
			}

			return c.json(roles);
		} catch (error) {
			throw rethrowWithMessage("Failed to get user roles", error);
		}
	})
	.post(
		"/role/update",
		validateJson(
			z.object({
				userId: z.number().min(1),
				role: z.enum(["has_upload", "has_download", "has_special"]),
				value: z.number().min(0).max(1),
			})
		),
		async (c) => {
			try {
				const { userId: adminId, permissions } = c.payload;
				const { userId, role, value } = await c.req.json();

				if (!adminId || permissions !== UserRole.Admin) {
					throw new HTTPException(403);
				}

				const [result] = await db.execute<ResultSetHeader>(
					`UPDATE daphnis_user_option SET value = ? WHERE user = ? AND \`key\` = ?`,
					[value, userId, role]
				);

				if (result.affectedRows === 0) {
					await db.execute<ResultSetHeader>(`INSERT INTO daphnis_user_option (user, \`key\`, value) VALUES (?, ?, ?)`, [
						userId,
						role,
						value,
					]);
				}

				return c.json({ success: true });
			} catch (error) {
				throw rethrowWithMessage("Failed to update user role", error);
			}
		}
	);

export { UserRoutes };
