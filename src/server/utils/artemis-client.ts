/**
 * Thin wrapper around fetch() for server-to-server calls to the Artemis
 * /internal/party/* endpoints. Handles the X-Cozynet-Api-Key header and
 * translates non-2xx responses into HTTPException with the same status the
 * web client should see.
 */
import { HTTPException } from "hono/http-exception"

const baseUrl = () => {
	const v = process.env.ARTEMIS_BASE_URL
	if (!v) throw new HTTPException(503, { message: "ARTEMIS_BASE_URL is not set" })
	return v.replace(/\/$/, "")
}

const apiKey = () => {
	const v = process.env.COZYNET_API_KEY
	if (!v) throw new HTTPException(503, { message: "COZYNET_API_KEY is not set" })
	return v
}

type Method = "GET" | "POST" | "DELETE"

interface ArtemisRequestInit {
	method: Method
	path: string
	query?: Record<string, string | number | undefined>
	body?: unknown
}

export async function artemisFetch<T = unknown>({ method, path, query, body }: ArtemisRequestInit): Promise<T> {
	const url = new URL(baseUrl() + path)
	if (query) {
		for (const [k, v] of Object.entries(query)) {
			if (v !== undefined) url.searchParams.set(k, String(v))
		}
	}
	const headers: Record<string, string> = {
		"X-Cozynet-Api-Key": apiKey()
	}
	let bodyInit: BodyInit | undefined
	if (body !== undefined) {
		headers["Content-Type"] = "application/json"
		bodyInit = JSON.stringify(body)
	}

	const res = await fetch(url, { method, headers, body: bodyInit })
	const raw = await res.text()
	let parsed: unknown = undefined
	if (raw) {
		try {
			parsed = JSON.parse(raw)
		} catch {
			parsed = raw
		}
	}

	if (!res.ok) {
		let message: string = `Artemis returned ${res.status}`
		if (parsed && typeof parsed === "object") {
			const obj = parsed as { message?: string; error?: string }
			if (obj.message) message = obj.message
			else if (obj.error) message = obj.error
		}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		throw new HTTPException(res.status as any, { message })
	}

	return parsed as T
}
