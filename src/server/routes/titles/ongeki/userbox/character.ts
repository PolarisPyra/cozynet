import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { ResultSetHeader, RowDataPacket } from "mysql2"
import { z } from "zod"

import { db } from "@/server/db"
import { validateJson, validateParams } from "@/server/middleware/validator"
import { rethrowWithMessage } from "@/server/utils/error"

interface CharacterItem {
	characterId: number
	imagePath: string
	label: string
	locked: boolean
	equipped?: boolean
}

async function getCurrentCharacter(userId: number, version: number): Promise<CharacterItem[]> {
	const [result] = await db.execute<(CharacterItem & RowDataPacket)[]>(
		`
        SELECT
            dsc.characterId,
            dsc.imagePath,
            dsc.name AS label,
            CASE
                WHEN ouc.user IS NULL THEN 1
                ELSE 0
            END AS locked,
            1 as equipped
        FROM ongeki_profile_data opd
        JOIN daphnis_static_character dsc
            ON dsc.characterId = opd.characterId
            AND dsc.version = ?
        LEFT JOIN ongeki_user_character ouc
            ON ouc.characterId = dsc.characterId
            AND ouc.user = ?
        WHERE opd.user = ?
            AND opd.version = ?
        `,
		[version, userId, userId, version]
	)
	return result
}

const routes = new Hono()
	.get("", async c => {
		try {
			const { userId, versions } = c.payload
			const version = versions.ongeki_version

			const result = await getCurrentCharacter(userId, version)
			// If no current character, return null to indicate "no selection" instead of 404
			if (result.length === 0) {
				return c.json(null)
			}

			return c.json(result[0])
		} catch (error) {
			throw rethrowWithMessage("Failed to get current character", error)
		}
	})
	.post(
		"",
		validateJson(
			z.object({
				characterId: z.number().int().positive()
			})
		),
		async c => {
			try {
				const { userId, versions } = c.payload
				const version = versions.ongeki_version
				const { characterId } = await c.req.json()

				// Verify user owns the character
				const [ownership] = await db.execute<RowDataPacket[]>(
					`SELECT 1 FROM ongeki_user_character
                    WHERE user = ? AND characterId = ?`,
					[userId, characterId]
				)

				if (ownership.length === 0) {
					throw new HTTPException(400, {
						message: "You don't own this character"
					})
				}

				// Update profile
				await db.execute<ResultSetHeader>(
					`UPDATE ongeki_profile_data
                    SET characterId = ?
                    WHERE user = ? AND version = ?`,
					[characterId, userId, version]
				)

				// Get updated character data
				const result = await getCurrentCharacter(userId, version)
				if (result.length === 0) {
					return c.json(null)
				}
				return c.json(result[0])
			} catch (error) {
				throw rethrowWithMessage("Failed to update character", error)
			}
		}
	)
	.post(
		"search",
		validateJson(
			z.object({
				filter: z.object({
					locked: z.boolean().nullable()
				})
			})
		),
		async c => {
			try {
				const { userId, versions } = c.payload
				const version = versions.ongeki_version
				const { filter } = await c.req.json()
				const { locked } = filter

				let whereClause = "WHERE dsc.version = ?"
				const params = [version]

				if (locked === true) {
					whereClause += " AND ouc.user IS NULL"
				} else if (locked === false) {
					whereClause += " AND ouc.user IS NOT NULL"
				}

				const query = `
                SELECT
                    dsc.characterId,
                    dsc.imagePath,
                    dsc.name AS label,
                    CASE
                        WHEN ouc.user IS NULL THEN 1
                        ELSE 0
                    END AS locked,
                    CASE
                        WHEN opd.characterId = dsc.characterId
                        AND opd.user = ?
                        AND opd.version = ? THEN 1
                        ELSE 0
                    END AS equipped,
                    COUNT(*) OVER() AS total_count
                FROM daphnis_static_character dsc
                LEFT JOIN ongeki_user_character ouc
                    ON ouc.characterId = dsc.characterId
                    AND ouc.user = ?
                LEFT JOIN ongeki_profile_data opd
                    ON opd.characterId = dsc.characterId
                    AND opd.user = ?
                    AND opd.version = ?
                ${whereClause}
                ORDER BY
                    locked DESC,
                    dsc.characterId DESC
                `

				params.unshift(userId, version, userId, userId, version)
				const [items] = await db.execute<(CharacterItem & { total_count: number } & RowDataPacket)[]>(query, params)
				const totalCount = items.length > 0 ? items[0].total_count : 0

				const result = {
					items: items.map(({ total_count, ...item }) => item),
					total: totalCount
				}

				return c.json(result)
			} catch (error) {
				throw rethrowWithMessage("Failed to search characters", error)
			}
		}
	)
	.patch(
		"unlock/:characterId",
		validateParams(z.object({ characterId: z.string().regex(/^\d+$/).transform(Number) })),
		async c => {
			try {
				const { userId } = c.payload
				const { characterId } = c.req.param()

				// Add character to user's inventory
				await db.execute<ResultSetHeader>(
					`INSERT IGNORE INTO ongeki_user_character
                    (user, characterId, playCount, intimateLevel, intimateCount, intimateCountRewarded, intimateCountDate, isNew)
                    VALUES (?, ?, 0, 0, 0, 0, NOW(), 0)`,
					[userId, characterId]
				)

				return c.json({ success: true })
			} catch (error) {
				throw rethrowWithMessage("Failed to unlock character", error)
			}
		}
	)

export default routes
