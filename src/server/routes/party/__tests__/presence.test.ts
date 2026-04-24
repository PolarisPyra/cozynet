import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { PartyPresenceRoutes } from "../presence"
import { FAKE_USER, wrapPresence } from "./helpers"

const GAME = "ongeki"

async function call(payload = FAKE_USER) {
	const app = wrapPresence(PartyPresenceRoutes, payload)
	return app.request(`http://localhost/${GAME}/presence`, { method: "GET" })
}

beforeEach(() => {
	process.env.ARTEMIS_BASE_URL = "http://artemis.test"
	process.env.COZYNET_API_KEY = "test-api-key"
	vi.stubGlobal("fetch", vi.fn())
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe("PartyPresenceRoutes", () => {
	it("returns at_cabinet=false when Artemis says so", async () => {
		;(globalThis.fetch as any).mockResolvedValueOnce(
			new Response(JSON.stringify({ at_cabinet: false, game: GAME }), { status: 200 })
		)
		const res = await call()
		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body.at_cabinet).toBe(false)
	})

	it("surfaces cabinet keychip + version when present", async () => {
		;(globalThis.fetch as any).mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					at_cabinet: true,
					game: GAME,
					keychip: "A69E01A0000001",
					game_version: "1.55"
				}),
				{ status: 200 }
			)
		)
		const res = await call()
		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body.keychip).toBe("A69E01A0000001")
		expect(body.game_version).toBe("1.55")
		const call0 = (globalThis.fetch as any).mock.calls[0]
		expect((call0[0] as URL).pathname).toBe(`/internal/party/${GAME}/presence`)
	})

	it("rejects unauthenticated callers", async () => {
		const res = await call({} as any)
		expect(res.status).toBe(401)
	})
})
