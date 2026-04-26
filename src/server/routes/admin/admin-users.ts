import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { ResultSetHeader, RowDataPacket } from "mysql2"
import { z } from "zod"

import { UserRole } from "@/app/shared/types"
import { db } from "@/server/db"
import { validateJson } from "@/server/middleware/validator"
import { rethrowWithMessage } from "@/server/utils/error"

const AdminUserRoutes = new Hono()
	.get("/", async c => {
		try {
			const { userId, permissions } = c.payload

			if (!userId || permissions !== UserRole.Admin) {
				throw new HTTPException(403)
			}

			// Get all users
			const [users] = await db.execute<RowDataPacket[]>(
				"SELECT id, username, email, permissions, created_date, last_login_date, suspend_expire_time FROM aime_user ORDER BY id ASC"
			)

			// Get cards for all users
			const [cards] = await db.execute<RowDataPacket[]>(
				"SELECT id, user, access_code, created_date, is_locked, is_banned FROM aime_card"
			)

			// Get arcades for all users
			const [arcades] = await db.execute<RowDataPacket[]>(
				`SELECT ao.user, a.id, a.name, a.nickname 
				 FROM arcade_owner ao 
				 JOIN arcade a ON ao.arcade = a.id`
			)

			// Combine data
			const usersWithDetails = users.map(user => {
				return {
					...user,
					cards: cards.filter(card => card.user === user.id),
					arcades: arcades.filter(arcade => arcade.user === user.id)
				}
			})

			return c.json({ users: usersWithDetails })
		} catch (error) {
			throw rethrowWithMessage("Failed to fetch users", error)
		}
	})
	.put(
		"/:id",
		validateJson(
			z.object({
				username: z.string().min(1),
				email: z.string().email().optional(),
				permissions: z.number().int()
			})
		),
		async c => {
			try {
				const { userId: currentUserId, permissions: currentUserPermissions } = c.payload
				const targetId = parseInt(c.req.param("id"))

				if (!currentUserId || currentUserPermissions !== UserRole.Admin) {
					throw new HTTPException(403)
				}

				const body = await c.req.json()
				const { username, email, permissions } = body

				if (email) {
					await db.execute<ResultSetHeader>(
						"UPDATE aime_user SET username = ?, email = ?, permissions = ? WHERE id = ?",
						[username, email, permissions, targetId]
					)
				} else {
					await db.execute<ResultSetHeader>(
						"UPDATE aime_user SET username = ?, permissions = ? WHERE id = ?",
						[username, permissions, targetId]
					)
				}

				return c.json({ success: true })
			} catch (error) {
				throw rethrowWithMessage("Failed to update user", error)
			}
		}
	)
	.delete("/:id", async c => {
		try {
			const { userId: currentUserId, permissions: currentUserPermissions } = c.payload
			const targetId = parseInt(c.req.param("id"))

			if (!currentUserId || currentUserPermissions !== UserRole.Admin) {
				throw new HTTPException(403)
			}

			// Cannot delete oneself
			if (currentUserId === targetId) {
				throw new HTTPException(400, { message: "Cannot delete your own account" })
			}

			// Get all tables dynamically
			const [tables] = await db.execute<RowDataPacket[]>(
				`SELECT TABLE_NAME 
				 FROM information_schema.columns 
				 WHERE TABLE_SCHEMA = DATABASE() 
				 AND COLUMN_NAME = 'user'`
			)

			// Execute deletes
			const connection = await db.getConnection()
			try {
				await connection.beginTransaction()

				// Delete from all linked tables
				for (const table of tables) {
					const tableName = table.TABLE_NAME
					await connection.execute(`DELETE FROM \`${tableName}\` WHERE user = ?`, [targetId])
				}

				// Finally delete the user
				await connection.execute("DELETE FROM aime_user WHERE id = ?", [targetId])

				await connection.commit()
			} catch (error) {
				await connection.rollback()
				throw error
			} finally {
				connection.release()
			}

			return c.json({ success: true })
		} catch (error) {
			throw rethrowWithMessage("Failed to delete user", error)
		}
	})
	.get("/:id/profiles", async c => {
		try {
			const { userId: currentUserId, permissions: currentUserPermissions } = c.payload
			const targetId = parseInt(c.req.param("id"))

			if (!currentUserId || currentUserPermissions !== UserRole.Admin) {
				throw new HTTPException(403)
			}

			const [chunithmProfiles] = await db.execute<RowDataPacket[]>(
				"SELECT * FROM chuni_profile_data WHERE user = ?",
				[targetId]
			)

			const [ongekiProfiles] = await db.execute<RowDataPacket[]>(
				"SELECT * FROM ongeki_profile_data WHERE user = ?",
				[targetId]
			)

			const [maimaiProfiles] = await db.execute<RowDataPacket[]>(
				"SELECT * FROM mai2_profile_detail WHERE user = ?",
				[targetId]
			)

			return c.json({
				chunithm: chunithmProfiles,
				ongeki: ongekiProfiles,
				maimaidx: maimaiProfiles
			})
		} catch (error) {
			throw rethrowWithMessage("Failed to fetch user profiles", error)
		}
	})
	.put(
		"/:id/profiles/:game/:version",
		validateJson(z.record(z.any())),
		async c => {
			try {
				const { userId: currentUserId, permissions: currentUserPermissions } = c.payload
				const targetId = parseInt(c.req.param("id"))
				const game = c.req.param("game")
				const version = parseInt(c.req.param("version"))

				if (!currentUserId || currentUserPermissions !== UserRole.Admin) {
					throw new HTTPException(403)
				}

				const body = await c.req.json()
				
				let tableName = ""
				if (game === "chunithm" || game === "chunithmnew") tableName = "chuni_profile_data"
				else if (game === "ongeki") tableName = "ongeki_profile_data"
				else if (game === "maimai" || game === "maimaidx") tableName = "mai2_profile_detail"
				else throw new HTTPException(400, { message: "Invalid game" })

				// Build dynamic update query
				// Filter out restricted keys
				const restrictedKeys = ["id", "user", "version"]
				const entries = Object.entries(body).filter(([key]) => !restrictedKeys.includes(key))

				if (entries.length === 0) return c.json({ success: true })

				const setFields = entries.map(([key]) => `\`${key}\` = ?`).join(", ")
				const values = entries.map(([, val]) => val)

				await db.execute<ResultSetHeader>(
					`UPDATE \`${tableName}\` SET ${setFields} WHERE user = ? AND version = ?`,
					[...values, targetId, version]
				)

				return c.json({ success: true })
			} catch (error) {
				throw rethrowWithMessage("Failed to update user profile", error)
			}
		}
	)
	.post("/:id/ban", validateJson(z.object({ banned: z.boolean() })), async c => {
		try {
			const { userId: currentUserId, permissions: currentUserPermissions } = c.payload
			const targetId = parseInt(c.req.param("id"))
			const { banned } = await c.req.json()

			if (!currentUserId || currentUserPermissions !== UserRole.Admin) {
				throw new HTTPException(403)
			}

			await db.execute("UPDATE aime_card SET is_banned = ? WHERE user = ?", [banned ? 1 : 0, targetId])
			return c.json({ success: true })
		} catch (error) {
			throw rethrowWithMessage("Failed to update ban status", error)
		}
	})
	.post("/:id/lock", validateJson(z.object({ locked: z.boolean() })), async c => {
		try {
			const { userId: currentUserId, permissions: currentUserPermissions } = c.payload
			const targetId = parseInt(c.req.param("id"))
			const { locked } = await c.req.json()

			if (!currentUserId || currentUserPermissions !== UserRole.Admin) {
				throw new HTTPException(403)
			}

			await db.execute("UPDATE aime_card SET is_locked = ? WHERE user = ?", [locked ? 1 : 0, targetId])
			return c.json({ success: true })
		} catch (error) {
			throw rethrowWithMessage("Failed to update lock status", error)
		}
	})

export { AdminUserRoutes }
