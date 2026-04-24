import { verify } from "hono/jwt"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { PartyRealtimeRoutes } from "../realtime"
import { FAKE_USER, wrapRealtime } from "./helpers"

const GAME = "ongeki"

async function call(body: unknown, payload = FAKE_USER) {
	const app = wrapRealtime(PartyRealtimeRoutes, payload)
	return app.request(`http://localhost/${GAME}/realtime-token`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body)
	})
}

beforeEach(() => {
	process.env.ARTEMIS_BASE_URL = "http://artemis.test"
	process.env.COZYNET_API_KEY = "test-api-key"
	process.env.LOBBY_SECRET = "test-lobby-secret"
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ lobbies: [] }), {
				status: 200,
				headers: { "Content-Type": "application/json" }
			})
		)
	)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe("PartyRealtimeRoutes", () => {
	it("mints a list-scope JWT tagged with game when lobby_id is omitted", async () => {
		const res = await call({})
		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body.scope).toBe("list")
		expect(body.game).toBe(GAME)
		const decoded = (await verify(body.token, "test-lobby-secret")) as any
		expect(decoded.user_id).toBe(42)
		expect(decoded.scope).toBe("list")
		expect(decoded.game).toBe(GAME)
	})

	it("mints a lobby-scope JWT", async () => {
		const res = await call({ lobby_id: "abc123" })
		const body = await res.json()
		expect(body.scope).toBe("lobby:abc123")
		const decoded = (await verify(body.token, "test-lobby-secret")) as any
		expect(decoded.scope).toBe("lobby:abc123")
		expect(decoded.game).toBe(GAME)
	})

	it("rejects unauthenticated callers", async () => {
		const res = await call({}, {} as any)
		expect(res.status).toBe(401)
	})

	it("errors if LOBBY_SECRET is missing", async () => {
		delete process.env.LOBBY_SECRET
		const res = await call({})
		expect(res.status).toBe(503)
	})
})
