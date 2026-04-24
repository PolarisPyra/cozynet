/**
 * Shared test helpers — builds a Hono app wrapping a sub-router with a stub
 * middleware that installs ``c.payload`` so the routes' ``c.payload.userId``
 * access works without dragging the real JWT stack into the test.
 */
import { Hono } from "hono"

import { UserMeta } from "@/server/types/jwt"

export const FAKE_USER: UserMeta = {
	userId: 42,
	username: "alice",
	permissions: 0,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	versions: {} as any
}

export function wrap(sub: Hono, payload: Partial<UserMeta> = FAKE_USER) {
	const app = new Hono()
	app.use("*", async (c, next) => {
		c.payload = payload as UserMeta
		await next()
	})
	// Game-scoped mount — matches the real /api/party/:game/... shape so
	// c.req.param("game") resolves in downstream handlers.
	app.route("/:game/lobbies", sub)
	return app
}

export function wrapPresence(sub: Hono, payload: Partial<UserMeta> = FAKE_USER) {
	const app = new Hono()
	app.use("*", async (c, next) => {
		c.payload = payload as UserMeta
		await next()
	})
	app.route("/:game/presence", sub)
	return app
}

export function wrapRealtime(sub: Hono, payload: Partial<UserMeta> = FAKE_USER) {
	const app = new Hono()
	app.use("*", async (c, next) => {
		c.payload = payload as UserMeta
		await next()
	})
	app.route("/:game/realtime-token", sub)
	return app
}
