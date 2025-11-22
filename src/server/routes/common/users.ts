import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { ResultSetHeader, RowDataPacket } from "mysql2"
import { z } from "zod"

import { DB } from "@/app/shared/types"
import { usernameSchema } from "@/app/shared/types/validation/auth"
import { db } from "@/server/db"
import { validateJson } from "@/server/middleware/validator"
import { signAndSetCookie } from "@/server/utils/cookie"
import { rethrowWithMessage } from "@/server/utils/error"
import { getUserGameVersions } from "@/server/utils/versions"

const UserRoutes = new Hono()
	.post("/verify", async c => {
		try {
			return c.json(c.payload)
		} catch (error) {
			throw rethrowWithMessage("Failed to verify user", error)
		}
	})
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
	.post(
		"/username",
		validateJson(
			z.object({
				username: usernameSchema
			})
		),
		async c => {
			const conn = await db.getConnection()
			try {
				await conn.beginTransaction()

				const { userId, aimeCardId } = c.payload
				const { username } = await c.req.json()

				if (!userId) throw new HTTPException(403)

				// Check if username is already taken by another user
				const [existingUsers] = await conn.execute<(DB.AimeUser & RowDataPacket)[]>(
					"SELECT * FROM aime_user WHERE username = ? AND id != ?",
					[username, userId]
				)

				if (existingUsers.length > 0) {
					throw new HTTPException(409, { message: "Username already exists" })
				}

				// Update username
				const [result] = await conn.execute<ResultSetHeader>("UPDATE aime_user SET username = ? WHERE id = ?", [
					username,
					userId
				])

				if (result.affectedRows === 0) {
					throw new HTTPException(404, { message: "User not found" })
				}

				// Refresh the JWT token with updated user data
				const [users] = await conn.execute<(DB.AimeUser & RowDataPacket)[]>("SELECT * FROM aime_user WHERE id = ?", [
					userId
				])
				const user = users[0]

				const [cards] = await conn.execute<(DB.AimeCard & RowDataPacket)[]>(
					"SELECT * FROM aime_card WHERE access_code = ?",
					[aimeCardId]
				)
				const card = cards[0]

				if (!user || !card) {
					throw new HTTPException(404)
				}

				const versions = await getUserGameVersions(userId, conn)
				const cookieResult = await signAndSetCookie(c, user, card, versions)

				await conn.commit()
				return c.json(cookieResult)
			} catch (error) {
				await conn.rollback()
				if (error instanceof HTTPException) throw error
				throw rethrowWithMessage("Failed to update username", error)
			} finally {
				conn.release()
			}
		}
	)
export { UserRoutes }
