import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise"
import { z } from "zod"

import { UserRole } from "@/app/shared/types"
import { db } from "@/server/db"
import { validateJson } from "@/server/middleware/validator"
import { rethrowWithMessage } from "@/server/utils/error"

type ArcadeLookupRow = {
	id: number
	name: string | null
	nickname: string | null
	serial: string
	ownerUser: number | null
	ownerUsername: string | null
} & RowDataPacket

const assertAdmin = (userId: number | undefined, permissions: number | undefined) => {
	if (!userId || permissions !== UserRole.Admin) throw new HTTPException(403)
}

const getArcadeById = async (arcadeId: number, connection: PoolConnection) => {
	const [arcades] = await connection.execute<ArcadeLookupRow[]>(
		`SELECT a.id, a.name, a.nickname, m.serial,
			ao.user AS ownerUser, owner.username AS ownerUsername
		FROM arcade a
		INNER JOIN machine m ON m.arcade = a.id
		LEFT JOIN arcade_owner ao ON ao.arcade = a.id AND ao.permissions = 1
		LEFT JOIN aime_user owner ON owner.id = ao.user
		WHERE a.id = ?
		LIMIT 1
		FOR UPDATE`,
		[arcadeId]
	)
	return arcades[0]
}

const AdminArcadeRoutes = new Hono()
	.get("/", async c => {
		try {
			assertAdmin(c.payload.userId, c.payload.permissions)
			const serial = c.req.query("serial")?.trim().toUpperCase()
			if (!serial) {
				const [arcades] = await db.execute<ArcadeLookupRow[]>(
					`SELECT a.id, a.name, a.nickname, m.serial,
						ao.user AS ownerUser, owner.username AS ownerUsername
					FROM machine m
					INNER JOIN arcade a ON a.id = m.arcade
					LEFT JOIN arcade_owner ao ON ao.arcade = a.id AND ao.permissions = 1
					LEFT JOIN aime_user owner ON owner.id = ao.user
					ORDER BY m.serial ASC`
				)
				return c.json({ arcades })
			}

			const [arcades] = await db.execute<ArcadeLookupRow[]>(
				`SELECT a.id, a.name, a.nickname, m.serial,
					ao.user AS ownerUser, owner.username AS ownerUsername
				FROM machine m
				INNER JOIN arcade a ON a.id = m.arcade
				LEFT JOIN arcade_owner ao ON ao.arcade = a.id AND ao.permissions = 1
				LEFT JOIN aime_user owner ON owner.id = ao.user
				WHERE m.serial = ?
				LIMIT 1`,
				[serial]
			)

			return c.json({ arcade: arcades[0] ?? null })
		} catch (error) {
			throw rethrowWithMessage("Failed to find arcade by serial", error)
		}
	})
	.post("/:id/owner", validateJson(z.object({ userId: z.number().int().positive() })), async c => {
		try {
			assertAdmin(c.payload.userId, c.payload.permissions)
			const arcadeId = Number(c.req.param("id"))
			const { userId: targetUserId } = c.req.valid("json")

			const [targetUsers] = await db.execute<RowDataPacket[]>("SELECT id, username FROM aime_user WHERE id = ?", [
				targetUserId
			])
			const targetUser = targetUsers[0] as { id: number; username: string | null } | undefined
			if (!targetUser) throw new HTTPException(404, { message: "Target user not found" })

			const connection = await db.getConnection()
			try {
				await connection.beginTransaction()
				const arcade = await getArcadeById(arcadeId, connection)
				if (!arcade) throw new HTTPException(404, { message: "Arcade not found" })
				if (!arcade.ownerUser) {
					throw new HTTPException(409, { message: "The selected arcade has no current owner" })
				}
				if (arcade.ownerUser === targetUserId) {
					throw new HTTPException(409, { message: "This user already owns the selected arcade" })
				}
				const [existingOwnership] = await connection.execute<RowDataPacket[]>(
					"SELECT 1 FROM arcade_owner WHERE arcade = ? AND user = ? LIMIT 1",
					[arcadeId, targetUserId]
				)
				if (existingOwnership.length > 0) {
					throw new HTTPException(409, {
						message: "The selected user already has an arcade_owner record for this arcade"
					})
				}

				const [result] = await connection.execute<ResultSetHeader>(
					"UPDATE arcade_owner SET user = ? WHERE arcade = ? AND permissions = 1",
					[targetUserId, arcadeId]
				)
				if (result.affectedRows !== 1) {
					throw new HTTPException(409, { message: "The arcade owner changed before reassignment" })
				}

				await connection.commit()
				return c.json({
					success: true,
					arcadeId,
					arcadeName: arcade.name,
					keychipId: arcade.serial,
					userId: targetUser.id,
					username: targetUser.username
				})
			} catch (error) {
				await connection.rollback()
				throw error
			} finally {
				connection.release()
			}
		} catch (error) {
			throw rethrowWithMessage("Failed to reassign arcade owner", error)
		}
	})

export { AdminArcadeRoutes }
