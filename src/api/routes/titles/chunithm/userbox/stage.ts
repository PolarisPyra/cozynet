import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";

import { db } from "@/api/db";
import { validateJson, validateParams } from "@/api/middleware/validator";
import { rethrowWithMessage } from "@/api/utils/error";

interface StageItem {
	stageId: number;
	imagePath: string;
	label: string;
	locked: boolean;
	equipped?: boolean;
}

async function getCurrentStage(userId: number, version: number): Promise<StageItem[]> {
	const [result] = await db.execute<(StageItem & RowDataPacket)[]>(
		`
        SELECT               
            dsn.stageId,
            dsn.imagePath,
            dsn.name AS label,
            CASE
                WHEN cii.user IS NULL THEN 1
                ELSE 0
            END AS locked,
            1 as equipped          
        FROM chuni_profile_data cpd
        JOIN daphnis_static_stages dsn 
            ON dsn.stageId = cpd.stageId
            AND dsn.version = ?
        LEFT JOIN chuni_item_item cii 
            ON cii.itemId = dsn.stageId 
            AND cii.user = ?
            AND cii.itemKind = 13
        LEFT JOIN chuni_static_opts cso
            ON dsn.opt = cso.id
        WHERE cpd.user = ? 
            AND cpd.version = ?
            AND (cso.name != 'A000' OR cso.name IS NULL)
            AND dsn.name != 'Linked VERSE'
        `,
		[version, userId, userId, version]
	);
	return result;
}

const routes = new Hono()
	.get("", async (c) => {
		try {
			const { userId, versions } = c.payload;
			const version = versions.chunithm_version;

			const result = await getCurrentStage(userId, version);
			// If no current stage, return null to indicate "no selection" instead of 404
			if (result.length === 0) {
				return c.json(null);
			}

			return c.json(result[0]);
		} catch (error) {
			throw rethrowWithMessage("Failed to get current stage", error);
		}
	})
	.post(
		"",
		validateJson(
			z.object({
				stageId: z.number().int().positive(),
			})
		),
		async (c) => {
			try {
				const { userId, versions } = c.payload;
				const version = versions.chunithm_version;
				const { stageId } = await c.req.json();

				// Verify user owns the stage
				const [ownership] = await db.execute<RowDataPacket[]>(
					`SELECT 1 FROM chuni_item_item 
                    WHERE user = ? AND itemId = ? AND itemKind = 13`,
					[userId, stageId]
				);

				if (ownership.length === 0) {
					throw new HTTPException(400, {
						message: "You don't own this stage",
					});
				}

				// Update profile
				await db.execute<ResultSetHeader>(
					`UPDATE chuni_profile_data 
                    SET stageId = ?
                    WHERE user = ? AND version = ?`,
					[stageId, userId, version]
				);

				// Get updated stage data
				const result = await getCurrentStage(userId, version);
				return c.json(result[0]);
			} catch (error) {
				throw rethrowWithMessage("Failed to update stage", error);
			}
		}
	)
	.post(
		"search",
		validateJson(
			z.object({
				filter: z.object({
					locked: z.boolean().nullable(),
				}),
			})
		),
		async (c) => {
			try {
				const { userId, versions } = c.payload;
				const version = versions.chunithm_version;
				const { filter } = await c.req.json();
				const { locked } = filter;

				let whereClause = "WHERE dsn.version = ?";
				const params = [version];

				if (locked === true) {
					whereClause += " AND cii.user IS NULL";
				} else if (locked === false) {
					whereClause += " AND cii.user IS NOT NULL";
				}

				const query = `
                SELECT
                    dsn.stageId,
                    dsn.imagePath,
                    dsn.name AS label,
                    CASE
                        WHEN cii.user IS NULL THEN 1
                        ELSE 0
                    END AS locked,
                    CASE
                        WHEN cpd.stageId = dsn.stageId 
                        AND cpd.user = ? 
                        AND cpd.version = ? THEN 1
                        ELSE 0
                    END AS equipped,
                    COUNT(*) OVER() AS total_count
                FROM daphnis_static_stages dsn
                LEFT JOIN chuni_item_item cii 
                    ON cii.itemId = dsn.stageId 
                    AND cii.user = ?
                    AND cii.itemKind = 13
                LEFT JOIN chuni_profile_data cpd 
                    ON cpd.stageId = dsn.stageId
                    AND cpd.user = ?
                    AND cpd.version = ?
                LEFT JOIN chuni_static_opts cso
                    ON dsn.opt = cso.id
                ${whereClause}
                    AND (cso.name != 'A000' OR cso.name IS NULL)
                    AND dsn.name != 'Linked VERSE'
                ORDER BY 
                    locked DESC,
                    dsn.stageId DESC
                `;

				params.unshift(userId, version, userId, userId, version);
				const [items] = await db.execute<(StageItem & { total_count: number } & RowDataPacket)[]>(query, params);
				const totalCount = items.length > 0 ? items[0].total_count : 0;

				const result = {
					items: items.map(({ total_count, ...item }) => item),
					total: totalCount,
				};

				return c.json(result);
			} catch (error) {
				throw rethrowWithMessage("Failed to search stages", error);
			}
		}
	)
	.patch(
		"unlock/:stageId",
		validateParams(z.object({ stageId: z.string().regex(/^\d+$/).transform(Number) })),
		async (c) => {
			try {
				const { userId } = c.payload;
				const { stageId } = c.req.param();

				// Add stage to user's inventory
				await db.execute<ResultSetHeader>(
					`INSERT IGNORE INTO chuni_item_item 
                    (user, itemId, itemKind, stock, isValid)
                    VALUES (?, ?, 13, 1, 1)`,
					[userId, stageId]
				);

				return c.json({ success: true });
			} catch (error) {
				throw rethrowWithMessage("Failed to unlock stage", error);
			}
		}
	);

export default routes;
