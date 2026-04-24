import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"

import { validateJson } from "@/server/middleware/validator"
import { rethrowWithMessage } from "@/server/utils/error"
import { artemisFetch } from "@/server/utils/artemis-client"

interface LobbySnapshot {
	id: string
	game: string
	host_user_id: number
	game_version: string
	status: "waiting" | "active" | "closed"
	created_at: number
	seats: Array<{ seat: number; user_id: number; username: string; attached: boolean }>
}

/**
 * /api/party/:game/lobbies — thin proxy to Artemis's /internal/party/:game/*
 * endpoints. Every request carries the game tag so lobbies from different
 * Artemis titles never mix.
 */
const PartyLobbiesRoutes = new Hono()
	.get("/", async c => {
		try {
			const userId = c.payload.userId
			if (!userId) throw new HTTPException(401, { message: "Unauthorized" })
			const game = encodeURIComponent(c.req.param("game") ?? "")
			const data = await artemisFetch<{ lobbies: LobbySnapshot[] }>({
				method: "GET",
				path: `/internal/party/${game}/lobbies`,
				query: { on_behalf_of: userId }
			})
			return c.json(data.lobbies)
		} catch (error) {
			throw rethrowWithMessage("Failed to list lobbies", error)
		}
	})

	.post("/", async c => {
		try {
			const userId = c.payload.userId
			if (!userId) throw new HTTPException(401, { message: "Unauthorized" })
			const game = encodeURIComponent(c.req.param("game") ?? "")
			const lobby = await artemisFetch<LobbySnapshot>({
				method: "POST",
				path: `/internal/party/${game}/lobbies`,
				query: { on_behalf_of: userId }
			})
			return c.json(lobby)
		} catch (error) {
			throw rethrowWithMessage("Failed to create lobby", error)
		}
	})

	.post("/:id/join", async c => {
		try {
			const userId = c.payload.userId
			if (!userId) throw new HTTPException(401, { message: "Unauthorized" })
			const game = encodeURIComponent(c.req.param("game") ?? "")
			const id = c.req.param("id")
			const lobby = await artemisFetch<LobbySnapshot>({
				method: "POST",
				path: `/internal/party/${game}/lobbies/${encodeURIComponent(id)}/join`,
				query: { on_behalf_of: userId }
			})
			return c.json(lobby)
		} catch (error) {
			throw rethrowWithMessage("Failed to join lobby", error)
		}
	})

	.delete("/:id/leave", async c => {
		try {
			const userId = c.payload.userId
			if (!userId) throw new HTTPException(401, { message: "Unauthorized" })
			const game = encodeURIComponent(c.req.param("game") ?? "")
			const id = c.req.param("id")
			await artemisFetch({
				method: "POST",
				path: `/internal/party/${game}/lobbies/${encodeURIComponent(id)}/leave`,
				query: { on_behalf_of: userId }
			})
			return c.json({ ok: true })
		} catch (error) {
			throw rethrowWithMessage("Failed to leave lobby", error)
		}
	})

	.post("/:id/start", async c => {
		try {
			const userId = c.payload.userId
			if (!userId) throw new HTTPException(401, { message: "Unauthorized" })
			const game = encodeURIComponent(c.req.param("game") ?? "")
			const id = c.req.param("id")
			const lobby = await artemisFetch<LobbySnapshot>({
				method: "POST",
				path: `/internal/party/${game}/lobbies/${encodeURIComponent(id)}/start`,
				query: { on_behalf_of: userId }
			})
			return c.json(lobby)
		} catch (error) {
			throw rethrowWithMessage("Failed to start lobby", error)
		}
	})

	.post(
		"/:id/kick",
		validateJson(
			z.object({
				seat: z.number().int().min(1).max(4)
			})
		),
		async c => {
			try {
				const userId = c.payload.userId
				if (!userId) throw new HTTPException(401, { message: "Unauthorized" })
				const game = encodeURIComponent(c.req.param("game") ?? "")
				const id = c.req.param("id")
				const { seat } = await c.req.json()
				await artemisFetch({
					method: "POST",
					path: `/internal/party/${game}/lobbies/${encodeURIComponent(id)}/kick`,
					query: { on_behalf_of: userId },
					body: { seat }
				})
				return c.json({ ok: true })
			} catch (error) {
				throw rethrowWithMessage("Failed to kick member", error)
			}
		}
	)

export { PartyLobbiesRoutes }
