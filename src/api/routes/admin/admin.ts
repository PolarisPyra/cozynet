import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { ResultSetHeader, RowDataPacket } from "mysql2"

import { db } from "@/api/db"
import { rethrowWithMessage } from "@/api/utils/error"
import { UserRole } from "@/shared/types"

const AdminRoutes = new Hono()
	.get("/roles", async c => {
		try {
			const { userId, permissions } = c.payload

			if (!userId) {
				throw new HTTPException(403)
			}

			const roles = {
				hasAdminAccess: permissions === UserRole.Admin
			}

			return c.json(roles)
		} catch (error) {
			throw rethrowWithMessage("Failed to check user roles", error)
		}
	})

	.post("/keychip/generate", async c => {
		try {
			const { userId, permissions } = c.payload

			const body = await c.req.json()
			const { arcade_nickname, name, game, namcopcbid, aimecard } = body

			if (!userId || permissions !== UserRole.Admin) {
				throw new HTTPException(403)
			}

			const [existingArcade] = await db.execute<RowDataPacket[]>(
				`SELECT id 
				FROM arcade 
				WHERE name = ? 
				AND nickname = ?`,
				[name, arcade_nickname]
			)

			if (existingArcade[0]) {
				throw new HTTPException(400)
			}

			// Generate serial ID based on game type
			const serialId = game === "SDEW" ? namcopcbid : aimecard
			if (!serialId) {
				throw new HTTPException(400)
			}

			const [existingMachine] = await db.execute<RowDataPacket[]>(
				`SELECT id 
				FROM machine 
				WHERE serial = ?`,
				[serialId]
			)

			if (existingMachine[0]) {
				throw new HTTPException(400)
			}

			// Create new arcade
			const [result] = await db.execute<ResultSetHeader>(
				`INSERT INTO arcade (name, nickname) 
				VALUES (?, ?)`,
				[name, arcade_nickname]
			)

			const arcadeId = result.insertId

			await db.execute<ResultSetHeader>(
				`INSERT INTO arcade_owner (user, arcade, permissions) 
				VALUES (?, ?, ?)`,
				[userId, arcadeId, 1]
			)

			await db.execute<ResultSetHeader>(
				`INSERT INTO machine (arcade, serial, game) 
				VALUES (?, ?, ?)`,
				[arcadeId, serialId, game === "SDEW" ? game : null]
			)

			return c.json({ success: true, arcadeId })
		} catch (error) {
			throw rethrowWithMessage("Failed to generate keychip", error)
		}
	})

export { AdminRoutes }
