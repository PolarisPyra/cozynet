import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { RowDataPacket } from "mysql2"

import { DB, UserRole } from "@/app/shared/types"
import { db } from "@/server/db"
import { rethrowWithMessage } from "@/server/utils/error"

const AimeCardRoute = new Hono()
	.get("/aime_card", async c => {
		try {
			const { permissions } = c.payload

			// Only admins can view all aime cards
			if (permissions !== UserRole.Admin) {
				throw new HTTPException(403, {
					message: "Admin permissions required"
				})
			}

			const [rows] = await db.execute<(DB.AimeCard & RowDataPacket)[]>("SELECT * FROM aime_card")
			return c.json({ users: rows })
		} catch (error) {
			console.error("Error executing query:", error)
			throw rethrowWithMessage("Failed to fetch users", error)
		}
	})
	.get("/aime_user", async c => {
		try {
			const { permissions } = c.payload

			// Only admins can view all users
			if (permissions !== UserRole.Admin) {
				throw new HTTPException(403, {
					message: "Admin permissions required"
				})
			}
			const [rows] = await db.execute<(Omit<DB.AimeUser, "password"> & RowDataPacket)[]>(
				"SELECT id, username, created_date,last_login_date, permissions FROM aime_user"
			)
			return c.json({ users: rows })
		} catch (error) {
			throw rethrowWithMessage("Failed to fetch users", error)
		}
	})
export { AimeCardRoute }
