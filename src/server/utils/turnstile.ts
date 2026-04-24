import { HTTPException } from "hono/http-exception"

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

const getClientIp = (headers: Headers) => {
	const cfConnectingIp = headers.get("CF-Connecting-IP")
	if (cfConnectingIp) return cfConnectingIp

	const forwardedFor = headers.get("X-Forwarded-For")
	if (forwardedFor) return forwardedFor.split(",")[0]?.trim()

	const realIp = headers.get("X-Real-IP")
	return realIp?.trim() || undefined
}

export const isTurnstileVerificationEnabled = () => Boolean(process.env.TURNSTILE_SITE_KEY || process.env.TURNSTILE_SECRET_KEY)

export const verifyTurnstileToken = async (token: string | undefined, headers: Headers) => {
	const siteKey = process.env.TURNSTILE_SITE_KEY
	const secret = process.env.TURNSTILE_SECRET_KEY

	if (!siteKey && !secret) return

	if (!siteKey || !secret) {
		throw new HTTPException(503, {
			message: "Turnstile is misconfigured"
		})
	}

	if (!token) {
		throw new HTTPException(400, {
			message: "Turnstile verification is required"
		})
	}

	const remoteip = getClientIp(headers)
	const response = await fetch(TURNSTILE_VERIFY_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			secret,
			response: token,
			...(remoteip ? { remoteip } : {})
		})
	})

	if (!response.ok) {
		throw new HTTPException(502, {
			message: "Turnstile verification failed"
		})
	}

	const result = (await response.json()) as {
		success?: boolean
	}

	if (!result.success) {
		throw new HTTPException(400, {
			message: "Turnstile verification failed"
		})
	}
}
