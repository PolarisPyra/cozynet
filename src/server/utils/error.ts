import { HTTPException } from "hono/http-exception"

/**
 * Allows rethrowing an error with a wrapper message while preserving the original error's status code.
 * Like catching a rock, putting a sticky note on it, and throwing it at someone else.
 */
export const rethrowWithMessage = (msg: string, error: unknown) => {
	const httpException = error instanceof HTTPException ? error : undefined
	const status = httpException?.status ?? 500
	const includeInnerMessage = status >= 400 && status < 500 && httpException?.message
	const message = `${msg}${includeInnerMessage ? `: ${httpException.message}` : ""}`
	const cause = error

	return new HTTPException(status, { message, cause })
}
