import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { sign } from "hono/jwt"
import { z } from "zod"

import { validateJson } from "@/server/middleware/validator"
import { rethrowWithMessage } from "@/server/utils/error"

/**
 * POST /api/party/:game/realtime-token
 *
 * Mints a short-lived JWT for the browser to open a WebSocket directly to
 * Artemis's /ws/party. The JWT includes the ``game`` tag so Artemis rejects
 * cross-game reuse.
 */
const PartyRealtimeRoutes = new Hono().post(
	"/",
	validateJson(
		z.object({
			lobby_id: z.string().min(1).max(64).optional()
		})
	),
	async c => {
		try {
			const userId = c.payload.userId
			if (!userId) throw new HTTPException(401, { message: "Unauthorized" })
			const { LOBBY_SECRET } = process.env
			if (!LOBBY_SECRET) {
				throw new HTTPException(503, { message: "LOBBY_SECRET is not configured" })
			}
			const game = c.req.param("game") ?? ""
			if (!game) throw new HTTPException(400, { message: "game is required" })
			const { lobby_id } = await c.req.json()

			const scope = lobby_id ? `lobby:${lobby_id}` : "list"
			const now = Math.floor(Date.now() / 1000)
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const token = await sign(
				{
					user_id: userId,
					scope,
					game,
					iat: now,
					exp: now + 60 * 5
				} as any,
				LOBBY_SECRET
			)
			return c.json({ token, expires_at: now + 60 * 5, scope, game })
		} catch (error) {
			throw rethrowWithMessage("Failed to mint realtime token", error)
		}
	}
)

export { PartyRealtimeRoutes }
