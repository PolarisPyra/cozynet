import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { ResultSetHeader, RowDataPacket } from "mysql2"
import { z } from "zod"

import { DB, UserRole } from "@/app/shared/types"
import { db } from "@/server/db"
import { validateJson } from "@/server/middleware/validator"
import { rethrowWithMessage } from "@/server/utils/error"

enum PermissionType {
	Upload = "has_upload",
	Download = "has_download",
	Special = "has_special"
}

enum PermissionValue {
	Disabled = 0,
	Enabled = 1
}

const UserRoutes = new Hono()
	.post("/verify", async c => {
		try {
			return c.json(c.payload)
		} catch (error) {
			throw rethrowWithMessage("Failed to verify user", error)
		}
	})
	.get("/roles", async c => {
		try {
			const userId = c.payload.userId
			if (!userId) throw new HTTPException(403)

			const [rows] = await db.execute<({ key: string; value: number } & RowDataPacket)[]>(
				"SELECT `key`, value FROM daphnis_user_option WHERE user = ? AND `key` IN ('has_upload', 'has_download', 'has_special')",
				[userId]
			)

			// Initialize with default values (all disabled)
			const roles = {
				upload: PermissionValue.Disabled,
				download: PermissionValue.Disabled,
				special: PermissionValue.Disabled
			}

			// Assign the actual values from database
			for (const row of rows) {
				if (row.key === PermissionType.Upload) roles.upload = row.value
				if (row.key === PermissionType.Download) roles.download = row.value
				if (row.key === PermissionType.Special) roles.special = row.value
			}

			return c.json(roles)
		} catch (error) {
			throw rethrowWithMessage("Failed to get user roles", error)
		}
	})
	.post(
		"/role/update",
		validateJson(
			z.object({
				userId: z.number().min(1),
				role: z.enum(["has_upload", "has_download", "has_special"]),
				value: z.number().min(0).max(1)
			})
		),
		async c => {
			try {
				const { userId: adminId, permissions } = c.payload
				const { userId, role, value } = await c.req.json()

				if (!adminId || permissions !== UserRole.Admin) {
					throw new HTTPException(403)
				}

				const [result] = await db.execute<ResultSetHeader>(
					`UPDATE daphnis_user_option SET value = ? WHERE user = ? AND \`key\` = ?`,
					[value, userId, role]
				)

				if (result.affectedRows === 0) {
					await db.execute<ResultSetHeader>(`INSERT INTO daphnis_user_option (user, \`key\`, value) VALUES (?, ?, ?)`, [
						userId,
						role,
						value
					])
				}

				return c.json({ success: true })
			} catch (error) {
				throw rethrowWithMessage("Failed to update user role", error)
			}
		}
	)
	// User card management routes
	.get("/cards", async c => {
		try {
			const { userId } = c.payload
			if (!userId) throw new HTTPException(403)

			const [cards] = await db.execute<(DB.AimeCard & RowDataPacket)[]>(
				"SELECT * FROM aime_card WHERE user = ? ORDER BY id ASC",
				[userId]
			)

			return c.json({ cards })
		} catch (error) {
			throw rethrowWithMessage("Failed to fetch user cards", error)
		}
	})
	.post(
		"/cards/bind",
		validateJson(
			z.object({
				accessCode: z.string().length(20)
			})
		),
		async c => {
			try {
				const { userId } = c.payload
				const { accessCode } = await c.req.json()

				if (!userId) throw new HTTPException(403)

				// Check if card exists
				const [cards] = await db.execute<(DB.AimeCard & RowDataPacket)[]>(
					"SELECT * FROM aime_card WHERE access_code = ?",
					[accessCode]
				)

				if (cards.length === 0) {
					// Card doesn't exist, create a new one
					// Generate IDM (16 hex characters) - typically derived from access code
					// For simplicity, we'll generate a random hex string
					const idm = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("")

					// Generate chip_id (random number)
					const chipId = Math.floor(Math.random() * 1000000)

					// Create new card bound to user
					await db.execute<ResultSetHeader>(
						`INSERT INTO aime_card (user, access_code, idm, chip_id, created_date, is_locked, is_banned, memo)
						VALUES (?, ?, ?, ?, NOW(), 0, 0, '')`,
						[userId, accessCode, idm, chipId]
					)

					return c.json({ success: true })
				}

				const card = cards[0]

				// Check if already bound to this user
				if (card.user === userId) {
					throw new HTTPException(409, { message: "Card already bound to your account" })
				}

				// Check if bound to another user
				const [users] = await db.execute<(DB.AimeUser & RowDataPacket)[]>(
					"SELECT * FROM aime_user WHERE id = ? AND username IS NOT NULL",
					[card.user]
				)

				if (users.length > 0) {
					throw new HTTPException(409, { message: "Card already bound to another user" })
				}

				// Bind card to user
				await db.execute<ResultSetHeader>("UPDATE aime_card SET user = ? WHERE access_code = ?", [userId, accessCode])

				return c.json({ success: true })
			} catch (error) {
				if (error instanceof HTTPException) throw error
				throw rethrowWithMessage("Failed to bind card", error)
			}
		}
	)
	.post(
		"/cards/unbind",
		validateJson(
			z.object({
				accessCode: z.string().length(20)
			})
		),
		async c => {
			try {
				const { userId } = c.payload
				const { accessCode } = await c.req.json()

				if (!userId) throw new HTTPException(403)

				// Verify card belongs to user
				const [cards] = await db.execute<(DB.AimeCard & RowDataPacket)[]>(
					"SELECT * FROM aime_card WHERE access_code = ? AND user = ?",
					[accessCode, userId]
				)

				if (cards.length === 0) {
					throw new HTTPException(404, { message: "Card not found or not bound to your account" })
				}

				// Delete the card
				const [result] = await db.execute<ResultSetHeader>("DELETE FROM aime_card WHERE access_code = ? AND user = ?", [
					accessCode,
					userId
				])

				if (result.affectedRows === 0) {
					throw new HTTPException(404, { message: "Card not found or not bound to your account" })
				}

				return c.json({ success: true })
			} catch (error) {
				if (error instanceof HTTPException) throw error
				throw rethrowWithMessage("Failed to unbind card", error)
			}
		}
	)
export { UserRoutes }
