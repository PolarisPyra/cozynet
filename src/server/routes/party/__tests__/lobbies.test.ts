/**
 * Vitest suite for the /api/party/:game/lobbies proxy routes.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { PartyLobbiesRoutes } from "../lobbies"
import { FAKE_USER, wrap } from "./helpers"

const GAME = "ongeki"

function setEnv() {
	process.env.ARTEMIS_BASE_URL = "http://artemis.test"
	process.env.COZYNET_API_KEY = "test-api-key"
}

async function call(method: string, subpath: string, body?: unknown, payload = FAKE_USER) {
	const app = wrap(PartyLobbiesRoutes, payload)
	const init: RequestInit = { method, headers: { "Content-Type": "application/json" } }
	if (body !== undefined) init.body = JSON.stringify(body)
	return app.request(`http://localhost/${GAME}/lobbies${subpath}`, init)
}

beforeEach(() => {
	setEnv()
	vi.stubGlobal("fetch", vi.fn())
})

afterEach(() => {
	vi.restoreAllMocks()
})

function mockArtemis(status: number, body: unknown) {
	;(globalThis.fetch as any).mockResolvedValueOnce(
		new Response(typeof body === "string" ? body : JSON.stringify(body), {
			status,
			headers: { "Content-Type": "application/json" }
		})
	)
}

describe("PartyLobbiesRoutes", () => {
	it("GET / forwards to Artemis with the game path + user id", async () => {
		mockArtemis(200, {
			lobbies: [
				{ id: "abc", game: GAME, host_user_id: 42, game_version: "1.55", status: "waiting", seats: [] }
			]
		})
		const res = await call("GET", "")
		expect(res.status).toBe(200)
		const call0 = (globalThis.fetch as any).mock.calls[0]
		const url = call0[0] as URL
		expect(url.pathname).toBe(`/internal/party/${GAME}/lobbies`)
		expect(url.searchParams.get("on_behalf_of")).toBe("42")
		expect(call0[1].headers["X-Cozynet-Api-Key"]).toBe("test-api-key")
	})

	it("POST / creates a lobby without body", async () => {
		const lobby = { id: "x", game: GAME, host_user_id: 42, game_version: "1.55", status: "waiting", seats: [] }
		mockArtemis(200, lobby)
		const res = await call("POST", "")
		expect(res.status).toBe(200)
		expect(await res.json()).toEqual(lobby)
	})

	it("POST /:id/join surfaces Artemis 4xx messages", async () => {
		mockArtemis(409, { error: "version_mismatch", message: "Lobby is for 1.55, cabinet is 1.50" })
		const res = await call("POST", "/bad-lobby/join")
		expect(res.status).toBe(409)
		expect(await res.text()).toContain("Lobby is for 1.55")
	})

	it("DELETE /:id/leave returns ok envelope", async () => {
		mockArtemis(200, { ok: true })
		const res = await call("DELETE", "/lobby42/leave")
		expect(res.status).toBe(200)
		expect(await res.json()).toEqual({ ok: true })
	})

	it("POST /:id/kick rejects out-of-range seat before hitting Artemis", async () => {
		const res = await call("POST", "/lobby42/kick", { seat: 99 })
		expect(res.status).toBeGreaterThanOrEqual(400)
		expect((globalThis.fetch as any).mock.calls).toHaveLength(0)
	})

	it("POST /:id/kick forwards seat to Artemis", async () => {
		mockArtemis(200, { ok: true })
		const res = await call("POST", "/lobby42/kick", { seat: 3 })
		expect(res.status).toBe(200)
		const call0 = (globalThis.fetch as any).mock.calls[0]
		const sent = JSON.parse(call0[1].body as string)
		expect(sent).toEqual({ seat: 3 })
		const url = call0[0] as URL
		expect(url.pathname).toBe(`/internal/party/${GAME}/lobbies/lobby42/kick`)
	})

	it("returns 401 when called without a user payload", async () => {
		const res = await call("GET", "", undefined, {} as any)
		expect(res.status).toBe(401)
	})
})
