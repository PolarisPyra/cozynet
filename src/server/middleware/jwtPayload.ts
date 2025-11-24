import { MiddlewareHandler } from "hono"

import { UserMeta } from "../types/jwt"

declare module "hono" {
	interface Context {
		payload: UserMeta
	}
}

/**
 *  Just reassigns the JWT payload directly to the context,
 *  instead of having to access it through a string key everywhere.
 */
export const jwtPayloadMiddleware = (): MiddlewareHandler => {
	return async (c, next) => {
		try {
			const jwtPayload = c.get("jwtPayload")
			if (jwtPayload && jwtPayload.user) {
				c.payload = JSON.parse(jwtPayload.user) as UserMeta
			} else {
				// If JWT payload is missing, set empty payload (will cause 401 in routes that require auth)
				c.payload = {} as UserMeta
			}
		} catch (error) {
			// If parsing fails, set empty payload
			c.payload = {} as UserMeta
		}
		await next()
	}
}
