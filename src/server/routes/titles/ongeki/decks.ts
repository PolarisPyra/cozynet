import { Hono } from "hono"
import type { RowDataPacket } from "mysql2"

import { db } from "@/server/db"
import { rethrowWithMessage } from "@/server/utils/error"
import type { DB } from "@/app/shared/types"

const OngekiDecksRoutes = new Hono()
	.get("/", async c => {
		try {
			const { userId } = c.payload

			const [decks] = await db.execute<(RowDataPacket & DB.OngekiUserDeck)[]>(
				"SELECT * FROM ongeki_user_deck WHERE user = ? ORDER BY deckId ASC",
				[userId]
			)

			return c.json({ decks })
		} catch (error) {
			throw rethrowWithMessage("Failed to fetch Ongeki decks", error)
		}
	})
	.post("/update", async c => {
		try {
			const { userId } = c.payload
			const { deckId, cardId1, cardId2, cardId3 } = await c.req.json()

			if (deckId === undefined) {
				return c.json({ error: "deckId is required" }, 400)
			}

			// Check if deck exists
			const [existing] = await db.execute<RowDataPacket[]>(
				"SELECT id FROM ongeki_user_deck WHERE user = ? AND deckId = ?",
				[userId, deckId]
			)

			if (existing.length > 0) {
				await db.execute(
					"UPDATE ongeki_user_deck SET cardId1 = ?, cardId2 = ?, cardId3 = ? WHERE user = ? AND deckId = ?",
					[cardId1, cardId2, cardId3, userId, deckId]
				)
			} else {
				await db.execute(
					"INSERT INTO ongeki_user_deck (user, deckId, cardId1, cardId2, cardId3) VALUES (?, ?, ?, ?, ?)",
					[userId, deckId, cardId1, cardId2, cardId3]
				)
			}

			return c.json({ success: true })
		} catch (error) {
			throw rethrowWithMessage("Failed to update Ongeki deck", error)
		}
	})

export { OngekiDecksRoutes }
