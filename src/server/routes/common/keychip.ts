import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { ResultSetHeader, RowDataPacket } from "mysql2"
import { z } from "zod"

import { DB } from "@/app/shared/types"
import { db } from "@/server/db"
import { validateJson } from "@/server/middleware/validator"
import { rethrowWithMessage } from "@/server/utils/error"

const KeychipRoutes = new Hono()
	.get("/", async c => {
		try {
			const { userId } = c.payload
			if (!userId) throw new HTTPException(403)

			// Get machines owned by user through arcade_owner
			const [machines] = await db.execute<
				(DB.Machine & { arcade_name: string | null; arcade_nickname: string | null } & RowDataPacket)[]
			>(
				`SELECT m.*, a.name as arcade_name, a.nickname as arcade_nickname
				FROM machine m
				INNER JOIN arcade_owner ao ON m.arcade = ao.arcade
				INNER JOIN arcade a ON m.arcade = a.id
				WHERE ao.user = ?
				ORDER BY m.id ASC`,
				[userId]
			)

			return c.json({ keychips: machines })
		} catch (error) {
			throw rethrowWithMessage("Failed to fetch keychips", error)
		}
	})
	.get("/trusted", async c => {
		try {
			const { userId } = c.payload
			if (!userId) throw new HTTPException(403)

			// Get trusted keychips (machines trusted by this user)
			// Note: This might require a trust_keychip table - for now returning empty
			// You'll need to implement the trust mechanism based on your schema
			return c.json({ keychips: [] })
		} catch (error) {
			throw rethrowWithMessage("Failed to fetch trusted keychips", error)
		}
	})
	.post("/generate", async c => {
		try {
			const { userId } = c.payload
			if (!userId) throw new HTTPException(403)

			// Generate a random keychip ID (serial)
			// Format: A69E01A[0-9]{4}[0-9]{4} (15 chars total, e.g., A69E01A97462352)

			let uniqueNumbers = ""
			while (uniqueNumbers.length < 4) {
				const digit = Math.floor(Math.random() * 10)
				if (!uniqueNumbers.includes(digit.toString())) uniqueNumbers += digit
			}
			const randomNumbers = Math.floor(1000 + Math.random() * 9000)
				.toString()
				.padStart(4, "0")

			const keychipId = `A69E01A${uniqueNumbers}${randomNumbers}`

			// Create a new arcade for this keychip
			const [arcadeResult] = await db.execute<ResultSetHeader>("INSERT INTO arcade (name, nickname) VALUES (?, ?)", [
				`Keychip ${keychipId.substring(0, 12)}`,
				`keychip-${keychipId.substring(0, 12)}`
			])

			const arcadeId = arcadeResult.insertId

			// Set user as owner
			await db.execute<ResultSetHeader>("INSERT INTO arcade_owner (user, arcade, permissions) VALUES (?, ?, ?)", [
				userId,
				arcadeId,
				1
			])

			// Create machine with the keychip ID as serial
			await db.execute<ResultSetHeader>("INSERT INTO machine (arcade, serial) VALUES (?, ?)", [arcadeId, keychipId])

			return c.json({ success: true, keychipId })
		} catch (error) {
			throw rethrowWithMessage("Failed to generate keychip", error)
		}
	})
	.post(
		"/rename",
		validateJson(
			z.object({
				keychipId: z.string(),
				placeName: z.string().max(20)
			})
		),
		async c => {
			try {
				const { userId } = c.payload
				const { keychipId, placeName } = await c.req.json()

				if (!userId) throw new HTTPException(403)

				// Verify user owns this keychip
				const [machines] = await db.execute<(DB.Machine & RowDataPacket)[]>(
					`SELECT m.* FROM machine m
					INNER JOIN arcade_owner ao ON m.arcade = ao.arcade
					WHERE m.serial = ? AND ao.user = ?`,
					[keychipId, userId]
				)

				if (machines.length === 0) {
					throw new HTTPException(404, { message: "Keychip not found or not owned by you" })
				}

				const machine = machines[0]

				// Update both arcade name and nickname
				await db.execute<ResultSetHeader>("UPDATE arcade SET name = ?, nickname = ? WHERE id = ?", [
					placeName,
					placeName,
					machine.arcade
				])

				return c.json({ success: true })
			} catch (error) {
				if (error instanceof HTTPException) throw error
				throw rethrowWithMessage("Failed to rename keychip", error)
			}
		}
	)
	.delete("/:id", async c => {
		try {
			const { userId } = c.payload
			const machineId = parseInt(c.req.param("id"))

			if (!userId) throw new HTTPException(403)

			// Verify user owns this keychip
			const [machines] = await db.execute<(DB.Machine & RowDataPacket)[]>(
				`SELECT m.* FROM machine m
				INNER JOIN arcade_owner ao ON m.arcade = ao.arcade
				WHERE m.id = ? AND ao.user = ?`,
				[machineId, userId]
			)

			if (machines.length === 0) {
				throw new HTTPException(404, { message: "Keychip not found or not owned by you" })
			}

			const machine = machines[0]

			// Delete machine
			await db.execute<ResultSetHeader>("DELETE FROM machine WHERE id = ?", [machineId])

			// Delete arcade ownership
			await db.execute<ResultSetHeader>("DELETE FROM arcade_owner WHERE arcade = ?", [machine.arcade])

			// Optionally delete arcade if no other machines
			const [otherMachines] = await db.execute<RowDataPacket[]>("SELECT id FROM machine WHERE arcade = ?", [
				machine.arcade
			])
			if (otherMachines.length === 0) {
				await db.execute<ResultSetHeader>("DELETE FROM arcade WHERE id = ?", [machine.arcade])
			}

			return c.json({ success: true })
		} catch (error) {
			if (error instanceof HTTPException) throw error
			throw rethrowWithMessage("Failed to remove keychip", error)
		}
	})
	.post(
		"/add",
		validateJson(
			z.object({
				keychipId: z.string()
			})
		),
		async c => {
			try {
				const { userId } = c.payload
				const { keychipId } = await c.req.json()

				if (!userId) throw new HTTPException(403)

				// Find machine by serial
				const [machines] = await db.execute<(DB.Machine & RowDataPacket)[]>("SELECT * FROM machine WHERE serial = ?", [
					keychipId
				])

				if (machines.length === 0) {
					throw new HTTPException(404, { message: "Keychip not found" })
				}

				const machine = machines[0]

				// Add user as trusted owner (with lower permissions)
				// Check if already trusted
				const [existing] = await db.execute<RowDataPacket[]>(
					"SELECT * FROM arcade_owner WHERE user = ? AND arcade = ?",
					[userId, machine.arcade]
				)

				if (existing.length === 0) {
					await db.execute<ResultSetHeader>("INSERT INTO arcade_owner (user, arcade, permissions) VALUES (?, ?, ?)", [
						userId,
						machine.arcade,
						0
					])
				}

				return c.json({ success: true })
			} catch (error) {
				if (error instanceof HTTPException) throw error
				throw rethrowWithMessage("Failed to add keychip", error)
			}
		}
	)
	.delete(
		"/delete",
		validateJson(
			z.object({
				keychipId: z.string()
			})
		),
		async c => {
			try {
				const { userId } = c.payload
				const { keychipId } = await c.req.json()

				if (!userId) throw new HTTPException(403)

				// Find machine by serial
				const [machines] = await db.execute<(DB.Machine & RowDataPacket)[]>("SELECT * FROM machine WHERE serial = ?", [
					keychipId
				])

				if (machines.length === 0) {
					throw new HTTPException(404, { message: "Keychip not found" })
				}

				const machine = machines[0]

				// Remove trusted ownership (only if permissions = 0, meaning trusted not owner)
				await db.execute<ResultSetHeader>(
					"DELETE FROM arcade_owner WHERE user = ? AND arcade = ? AND permissions = 0",
					[userId, machine.arcade]
				)

				return c.json({ success: true })
			} catch (error) {
				if (error instanceof HTTPException) throw error
				throw rethrowWithMessage("Failed to delete keychip", error)
			}
		}
	)

export { KeychipRoutes }
