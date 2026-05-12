import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { ResultSetHeader, RowDataPacket } from "mysql2"
import { z } from "zod"

import { UserRole } from "@/app/shared/types"
import { db } from "@/server/db"
import { validateJson } from "@/server/middleware/validator"
import { rethrowWithMessage } from "@/server/utils/error"

type UserRow = { id: number; username: string | null } & RowDataPacket
type ArcadeTransferRow = {
	id: number
	name: string | null
	nickname: string | null
	serial: string | null
	machineId: number
	ownerUser: number
	ownerUsername: string | null
} & RowDataPacket

type MatchedArcadeTransferRow = ArcadeTransferRow & {
	matchLastSeen: number
	sourceRank: number
}

type PlayHistoryArcadeRow = {
	user: number
	arcade: number
	lastSeen: number
	sourceRank: number
} & RowDataPacket

const assertAdmin = (userId: number | undefined, permissions: number | undefined) => {
	if (!userId || permissions !== UserRole.Admin) {
		throw new HTTPException(403)
	}
}

const getTargetUser = async (targetId: number) => {
	const [users] = await db.execute<UserRow[]>("SELECT id, username FROM aime_user WHERE id = ?", [targetId])
	const targetUser = users[0]
	if (!targetUser) {
		throw new HTTPException(404, { message: "User not found" })
	}
	return targetUser
}

const generateSegaKeychipSerial = async () => {
	for (let attempt = 0; attempt < 20; attempt++) {
		let uniqueNumbers = ""
		while (uniqueNumbers.length < 4) {
			const digit = Math.floor(Math.random() * 10).toString()
			if (!uniqueNumbers.includes(digit)) uniqueNumbers += digit
		}
		const randomNumbers = Math.floor(1000 + Math.random() * 9000)
			.toString()
			.padStart(4, "0")
		const keychipId = `A69E01A${uniqueNumbers}${randomNumbers}`

		const [existingMachine] = await db.execute<RowDataPacket[]>("SELECT id FROM machine WHERE serial = ? LIMIT 1", [
			keychipId
		])
		if (existingMachine.length === 0) return keychipId
	}

	throw new HTTPException(409, { message: "Failed to generate a unique keychip serial" })
}

const getOwnedKeychipArcades = async (ownerId?: number) => {
	const ownerFilter = ownerId ? "AND ao.user = ?" : ""
	const params = ownerId ? [ownerId] : []
	const [arcades] = await db.execute<ArcadeTransferRow[]>(
		`SELECT
			a.id,
			a.name,
			a.nickname,
			m.id AS machineId,
			m.serial,
			ao.user AS ownerUser,
			owner.username AS ownerUsername
		FROM arcade_owner ao
		INNER JOIN aime_user owner ON owner.id = ao.user
		INNER JOIN arcade a ON a.id = ao.arcade
		INNER JOIN machine m ON m.arcade = a.id
		WHERE ao.permissions = 1
		${ownerFilter}`,
		params
	)

	return arcades
}

const getAdminOwnedKeychipArcades = async (currentUserId: number) => getOwnedKeychipArcades(currentUserId)

const getUserPlayHistoryArcades = async (targetId?: number) => {
	const params = targetId ? [targetId, targetId, targetId, targetId, targetId, targetId] : []
	const userWhere = targetId ? "WHERE user = ? AND" : "WHERE"

	const [history] = await db.execute<PlayHistoryArcadeRow[]>(
		`SELECT user, arcade, MAX(lastSeen) AS lastSeen, MAX(sourceRank) AS sourceRank
		FROM (
			SELECT user, placeId AS arcade, MAX(id) AS lastSeen, 3 AS sourceRank
			FROM chuni_score_playlog
			${userWhere} placeId IS NOT NULL
			GROUP BY user, placeId
			UNION ALL
			SELECT user, lastPlaceId AS arcade, MAX(id) AS lastSeen, 2 AS sourceRank
			FROM chuni_profile_data
			${userWhere} lastPlaceId IS NOT NULL
			GROUP BY user, lastPlaceId
			UNION ALL
			SELECT user, placeId AS arcade, MAX(id) AS lastSeen, 3 AS sourceRank
			FROM ongeki_score_playlog
			${userWhere} placeId IS NOT NULL
			GROUP BY user, placeId
			UNION ALL
			SELECT user, lastPlaceId AS arcade, MAX(id) AS lastSeen, 2 AS sourceRank
			FROM ongeki_profile_data
			${userWhere} lastPlaceId IS NOT NULL
			GROUP BY user, lastPlaceId
			UNION ALL
			SELECT user, placeId AS arcade, MAX(id) AS lastSeen, 3 AS sourceRank
			FROM mai2_playlog
			${userWhere} placeId IS NOT NULL
			GROUP BY user, placeId
			UNION ALL
			SELECT user, lastPlaceId AS arcade, MAX(id) AS lastSeen, 2 AS sourceRank
			FROM mai2_profile_detail
			${userWhere} lastPlaceId IS NOT NULL
			GROUP BY user, lastPlaceId
		) history
		GROUP BY user, arcade`,
		params
	)

	return history
}

const selectUserKeychipArcade = (arcades: ArcadeTransferRow[], playHistory: PlayHistoryArcadeRow[] = []) => {
	const playHistoryByArcade = new Map(playHistory.map(row => [row.arcade, row]))
	const matches = arcades
		.map(arcade => {
			const history = playHistoryByArcade.get(arcade.id)
			if (!history) return null

			return {
				...arcade,
				matchLastSeen: history.lastSeen,
				sourceRank: history.sourceRank
			}
		})
		.filter((arcade): arcade is MatchedArcadeTransferRow => arcade !== null)
		.sort(
			(a, b) =>
				b.sourceRank - a.sourceRank || b.matchLastSeen - a.matchLastSeen || b.id - a.id || b.machineId - a.machineId
		)

	return matches[0]
}

const findUserKeychipArcade = async (currentUserId: number, targetId: number) => {
	return selectUserKeychipArcade(
		await getAdminOwnedKeychipArcades(currentUserId),
		await getUserPlayHistoryArcades(targetId)
	)
}

const AdminUserRoutes = new Hono()
	.get("/", async c => {
		try {
			const { userId, permissions } = c.payload

			assertAdmin(userId, permissions)

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

			const adminOwnedKeychipArcades = await getAdminOwnedKeychipArcades(userId)
			const ownedKeychipArcades = await getOwnedKeychipArcades()
			const playHistoryArcades = await getUserPlayHistoryArcades()

			// Combine data
			const usersWithDetails = users.map(user => {
				const userArcades = arcades.filter(arcade => arcade.user === user.id)
				const userPlayHistory = playHistoryArcades.filter(history => history.user === user.id)
				const transferCandidates = adminOwnedKeychipArcades.filter(
					candidate => !userArcades.some(arcade => arcade.id === candidate.id)
				)
				const transferCandidateArcade =
					user.id === userId ? undefined : selectUserKeychipArcade(transferCandidates, userPlayHistory)
				const matchedOwnedArcade =
					user.id === userId
						? undefined
						: selectUserKeychipArcade(
								ownedKeychipArcades.filter(candidate => !userArcades.some(arcade => arcade.id === candidate.id)),
								userPlayHistory
							)

				return {
					...user,
					cards: cards.filter(card => card.user === user.id),
					arcades: userArcades,
					transferCandidateArcade: transferCandidateArcade
						? {
								id: transferCandidateArcade.id,
								name: transferCandidateArcade.name,
								nickname: transferCandidateArcade.nickname,
								serial: transferCandidateArcade.serial
							}
						: null,
					matchedOwnedArcade:
						matchedOwnedArcade && matchedOwnedArcade.ownerUser !== user.id
							? {
									id: matchedOwnedArcade.id,
									name: matchedOwnedArcade.name,
									nickname: matchedOwnedArcade.nickname,
									serial: matchedOwnedArcade.serial,
									ownerUser: matchedOwnedArcade.ownerUser,
									ownerUsername: matchedOwnedArcade.ownerUsername
								}
							: null
				}
			})

			return c.json({ users: usersWithDetails })
		} catch (error) {
			throw rethrowWithMessage("Failed to fetch users", error)
		}
	})
	.post("/:id/keychip/generate", async c => {
		try {
			const { userId: currentUserId, permissions: currentUserPermissions } = c.payload
			const targetId = parseInt(c.req.param("id"))

			assertAdmin(currentUserId, currentUserPermissions)

			const targetUser = await getTargetUser(targetId)
			const keychipId = await generateSegaKeychipSerial()
			const displayName = targetUser.username || `User ${targetId}`
			const arcadeName = `${displayName}'s SEGA arcade`
			const arcadeNickname = `${displayName}'s SEGA arcade`

			const connection = await db.getConnection()
			try {
				await connection.beginTransaction()

				const [arcadeResult] = await connection.execute<ResultSetHeader>(
					"INSERT INTO arcade (name, nickname) VALUES (?, ?)",
					[arcadeName, arcadeNickname]
				)
				const arcadeId = arcadeResult.insertId

				await connection.execute<ResultSetHeader>(
					"INSERT INTO arcade_owner (user, arcade, permissions) VALUES (?, ?, ?)",
					[targetId, arcadeId, 1]
				)

				await connection.execute<ResultSetHeader>("INSERT INTO machine (arcade, serial, game) VALUES (?, ?, ?)", [
					arcadeId,
					keychipId,
					null
				])

				await connection.commit()

				return c.json({
					success: true,
					keychipId,
					arcadeId,
					arcadeName,
					arcadeNickname,
					userId: targetId,
					username: targetUser.username
				})
			} catch (error) {
				await connection.rollback()
				throw error
			} finally {
				connection.release()
			}
		} catch (error) {
			throw rethrowWithMessage("Failed to generate keychip for user", error)
		}
	})
	.post("/:id/arcades/transfer-keychip", async c => {
		try {
			const { userId: currentUserId, permissions: currentUserPermissions } = c.payload
			const targetId = parseInt(c.req.param("id"))

			assertAdmin(currentUserId, currentUserPermissions)
			if (currentUserId === targetId) {
				throw new HTTPException(400, { message: "Cannot transfer an arcade to the current owner" })
			}

			const targetUser = await getTargetUser(targetId)
			const arcadeMatch = await findUserKeychipArcade(currentUserId, targetId)
			if (!arcadeMatch) {
				throw new HTTPException(404, {
					message: "No admin-owned keychip arcade was found in this user's play/profile history"
				})
			}

			const connection = await db.getConnection()
			try {
				await connection.beginTransaction()

				const [lockedArcades] = await connection.execute<ArcadeTransferRow[]>(
					`SELECT
						a.id,
						a.name,
						a.nickname,
						m.id AS machineId,
						m.serial,
						ao.user AS ownerUser,
						owner.username AS ownerUsername
					FROM arcade_owner ao
					INNER JOIN aime_user owner ON owner.id = ao.user
					INNER JOIN arcade a ON a.id = ao.arcade
					INNER JOIN machine m ON m.arcade = a.id
					WHERE ao.user = ?
					AND ao.permissions = 1
					AND ao.arcade = ?
					AND NOT EXISTS (
						SELECT 1
						FROM arcade_owner target_ao
						WHERE target_ao.arcade = ao.arcade
						AND target_ao.user = ?
					)
					FOR UPDATE`,
					[currentUserId, arcadeMatch.id, targetId]
				)

				const arcade = lockedArcades[0]
				const arcadeStillMatches = selectUserKeychipArcade(lockedArcades, await getUserPlayHistoryArcades(targetId))
				if (!arcade || !arcadeStillMatches) {
					throw new HTTPException(404, { message: "Matching keychip arcade is no longer transferable" })
				}

				await connection.execute<ResultSetHeader>(
					"UPDATE arcade_owner SET user = ?, permissions = 1 WHERE user = ? AND arcade = ?",
					[targetId, currentUserId, arcade.id]
				)

				await connection.commit()

				return c.json({
					success: true,
					arcadeId: arcade.id,
					arcadeName: arcade.name,
					arcadeNickname: arcade.nickname,
					keychipId: arcade.serial,
					userId: targetId,
					username: targetUser.username
				})
			} catch (error) {
				await connection.rollback()
				throw error
			} finally {
				connection.release()
			}
		} catch (error) {
			throw rethrowWithMessage("Failed to transfer keychip arcade", error)
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
					await db.execute<ResultSetHeader>("UPDATE aime_user SET username = ?, permissions = ? WHERE id = ?", [
						username,
						permissions,
						targetId
					])
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

			const [chunithmProfiles] = await db.execute<RowDataPacket[]>("SELECT * FROM chuni_profile_data WHERE user = ?", [
				targetId
			])

			const [ongekiProfiles] = await db.execute<RowDataPacket[]>("SELECT * FROM ongeki_profile_data WHERE user = ?", [
				targetId
			])

			const [maimaiProfiles] = await db.execute<RowDataPacket[]>("SELECT * FROM mai2_profile_detail WHERE user = ?", [
				targetId
			])

			return c.json({
				chunithm: chunithmProfiles,
				ongeki: ongekiProfiles,
				maimaidx: maimaiProfiles
			})
		} catch (error) {
			throw rethrowWithMessage("Failed to fetch user profiles", error)
		}
	})
	.put("/:id/profiles/:game/:version", validateJson(z.record(z.any())), async c => {
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

			await db.execute<ResultSetHeader>(`UPDATE \`${tableName}\` SET ${setFields} WHERE user = ? AND version = ?`, [
				...values,
				targetId,
				version
			])

			return c.json({ success: true })
		} catch (error) {
			throw rethrowWithMessage("Failed to update user profile", error)
		}
	})
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
