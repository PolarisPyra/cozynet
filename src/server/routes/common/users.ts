import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { ResultSetHeader, RowDataPacket } from "mysql2"
import { z } from "zod"

import { DB } from "@/app/shared/types"
import { accessCodeSchema, eamuseAccessCodeSchema } from "@/app/shared/types/validation/auth"
import { db } from "@/server/db"
import { validateJson } from "@/server/middleware/validator"
import { rethrowWithMessage } from "@/server/utils/error"

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
			z
				.object({
					accessCode: accessCodeSchema.optional(),
					eamuseAccessCode: eamuseAccessCodeSchema.optional()
				})
				.refine(value => value.accessCode || value.eamuseAccessCode, {
					message: "An ALL.NET access code or e-amusement code is required"
				})
		),
		async c => {
			try {
				const { userId } = c.payload
				const { accessCode, eamuseAccessCode } = await c.req.json()

				if (!userId) throw new HTTPException(403)

				// Check if card exists
				const [cards] = await db.execute<(DB.AimeCard & RowDataPacket)[]>(
					"SELECT * FROM aime_card WHERE (? IS NOT NULL AND access_code = ?) OR (? IS NOT NULL AND eamuse_access_code = ?)",
					[accessCode || null, accessCode || null, eamuseAccessCode || null, eamuseAccessCode || null]
				)

				if (cards.length === 0) {
					// Complete the user's existing card when the missing identifier is supplied.
					// This prevents an E004-only bind from creating a second row for an
					// account that already has its ALL.NET card row.
					const [ownedCards] = await db.execute<(DB.AimeCard & RowDataPacket)[]>(
						"SELECT * FROM aime_card WHERE user = ? ORDER BY id ASC",
						[userId]
					)

					if (ownedCards.length === 1) {
						const existingCard = ownedCards[0]
						const accessCodeFits = !accessCode || !existingCard.access_code || existingCard.access_code === accessCode
						const eamuseCodeFits =
							!eamuseAccessCode ||
							!existingCard.eamuse_access_code ||
							existingCard.eamuse_access_code === eamuseAccessCode

						if (accessCodeFits && eamuseCodeFits && (!existingCard.access_code || !existingCard.eamuse_access_code)) {
							await db.execute<ResultSetHeader>(
								"UPDATE aime_card SET access_code = COALESCE(?, access_code), eamuse_access_code = COALESCE(?, eamuse_access_code) WHERE id = ?",
								[accessCode || null, eamuseAccessCode || null, existingCard.id]
							)
							return c.json({ success: true })
						}
					}

					if (ownedCards.length > 0) {
						throw new HTTPException(409, {
							message: "Your account already has a different card bound to it"
						})
					}

					// Card doesn't exist, create a new one
					// Generate IDM (16 hex characters) - typically derived from access code
					// For simplicity, we'll generate a random hex string
					const idm =
						eamuseAccessCode || Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("")

					// Generate chip_id (random number)
					const chipId = Math.floor(Math.random() * 1000000)

					// Create new card bound to user
					await db.execute<ResultSetHeader>(
						`INSERT INTO aime_card (user, access_code, eamuse_access_code, idm, chip_id, created_date, is_locked, is_banned, memo)
						VALUES (?, ?, ?, ?, ?, NOW(), 0, 0, '')`,
						[userId, accessCode || null, eamuseAccessCode || null, idm, chipId]
					)

					return c.json({ success: true })
				}

				if (cards.length > 1) {
					throw new HTTPException(409, { message: "The supplied card identifiers belong to different cards" })
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
				await db.execute<ResultSetHeader>(
					"UPDATE aime_card SET user = ?, access_code = COALESCE(?, access_code), eamuse_access_code = COALESCE(?, eamuse_access_code) WHERE id = ?",
					[userId, accessCode || null, eamuseAccessCode || null, card.id]
				)

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
			z
				.object({
					accessCode: accessCodeSchema.optional(),
					eamuseAccessCode: eamuseAccessCodeSchema.optional()
				})
				.refine(value => value.accessCode || value.eamuseAccessCode, {
					message: "An ALL.NET access code or e-amusement code is required"
				})
		),
		async c => {
			try {
				const { userId } = c.payload
				const { accessCode, eamuseAccessCode } = await c.req.json()

				if (!userId) throw new HTTPException(403)

				// Verify card belongs to user
				const [cards] = await db.execute<(DB.AimeCard & RowDataPacket)[]>(
					"SELECT * FROM aime_card WHERE user = ? AND ((? IS NOT NULL AND access_code = ?) OR (? IS NOT NULL AND eamuse_access_code = ?))",
					[userId, accessCode || null, accessCode || null, eamuseAccessCode || null, eamuseAccessCode || null]
				)

				if (cards.length === 0) {
					throw new HTTPException(404, { message: "Card not found or not bound to your account" })
				}

				// Delete the card
				const [result] = await db.execute<ResultSetHeader>("DELETE FROM aime_card WHERE id = ? AND user = ?", [
					cards[0].id,
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
