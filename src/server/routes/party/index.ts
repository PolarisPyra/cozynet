import { Hono } from "hono"

import { PartyLobbiesRoutes } from "./lobbies"
import { PartyPresenceRoutes } from "./presence"
import { PartyRealtimeRoutes } from "./realtime"

/**
 * /api/party/:game/... — all party routes are scoped by game tag so lobbies
 * from different Artemis titles stay isolated.
 */
export const AllPartyRoutes = new Hono()
	.route("/:game/lobbies", PartyLobbiesRoutes)
	.route("/:game/presence", PartyPresenceRoutes)
	.route("/:game/realtime-token", PartyRealtimeRoutes)
