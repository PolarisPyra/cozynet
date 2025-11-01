import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { ResultSetHeader, RowDataPacket } from "mysql2"

import { db } from "@/api/db"
import { rethrowWithMessage } from "@/api/utils/error"
import { DB, UserRole } from "@/shared/types"

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
	.post("/update", async c => {
		try {
			const userId = c.payload.userId
			const { accessCode } = await c.req.json()

			const [result] = await db.execute<ResultSetHeader>(
				`UPDATE aime_card 
            SET access_code = ? 
            WHERE user = ?`,
				[accessCode, userId]
			)

			if (result.affectedRows === 0) {
				return c.json({ error: "User not found" }, 404)
			}

			return c.json({ success: true })
		} catch (error) {
			throw rethrowWithMessage("Failed to update aime card", error)
		}
	})
export { AimeCardRoute }
