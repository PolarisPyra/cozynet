import { Context } from "hono"
import { setCookie } from "hono/cookie"
import { sign } from "hono/jwt"

import { DB } from "@/shared/types"

import { JWTPayload } from "../types"
import { GameVersions, UserMeta } from "../types/jwt"

export const signAndSetCookie = async (
	c: Context,
	user: DB.AimeUser,
	card: DB.AimeCard,
	versions: GameVersions
): Promise<UserMeta> => {
	const userMeta = {
		userId: user.id,
		username: user.username,
		permissions: user.permissions || 0,
		aimeCardId: card?.access_code,
		versions
	}
	// Create JWT token
	const payload: JWTPayload = {
		user: JSON.stringify(userMeta),
		exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days expiration
	}

	const { JWT_SECRET, NODE_ENV, DOMAIN } = process.env

	// Using 'any' here because Hono is sitting on their hands:
	// https://github.com/honojs/hono/issues/2492
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const token = await sign(payload as any, JWT_SECRET!)

	// Set JWT token as a cookie
	setCookie(c, "auth_token", token, {
		httpOnly: true,
		secure: NODE_ENV === "production",
		sameSite: "Strict",
		maxAge: 60 * 60 * 24 * 7, // 7 days
		path: "/",
		domain: NODE_ENV === "production" ? DOMAIN : "localhost"
	})

	return userMeta
}

export const clearCookie = (c: Context) => {
	const { NODE_ENV, DOMAIN } = process.env

	setCookie(c, "auth_token", "", {
		httpOnly: true,
		secure: NODE_ENV === "production",
		sameSite: "Strict",
		maxAge: 0,
		path: "/",
		domain: NODE_ENV === "production" ? DOMAIN : "localhost"
	})
}
