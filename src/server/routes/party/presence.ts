import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"

import { rethrowWithMessage } from "@/server/utils/error"
import { artemisFetch } from "@/server/utils/artemis-client"

interface Presence {
	at_cabinet: boolean
	game: string
	keychip?: string
	game_version?: string
}

const PartyPresenceRoutes = new Hono().get("/", async c => {
	try {
		const userId = c.payload.userId
		if (!userId) throw new HTTPException(401, { message: "Unauthorized" })
		const game = encodeURIComponent(c.req.param("game") ?? "")
		const presence = await artemisFetch<Presence>({
			method: "GET",
			path: `/internal/party/${game}/presence`,
			query: { user_id: userId }
		})
		return c.json(presence)
	} catch (error) {
		throw rethrowWithMessage("Failed to fetch cabinet presence", error)
	}
})

export { PartyPresenceRoutes }
