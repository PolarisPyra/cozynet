import { Context, Next } from "hono"

export const routeLogger = async (c: Context, next: Next) => {
	const shouldLog = typeof process !== "undefined" && process.env.NODE_ENV !== "production"

	const start = Date.now()
	const { method, url } = c.req

	try {
		await next()

		const elapsed = Date.now() - start
		const status = c.res.status

		if (shouldLog) {
			console.info(`[${new Date().toISOString()}] ${method} ${url} - Status: ${status} - ${elapsed}ms`)
		}
	} catch (error) {
		const elapsed = Date.now() - start
		if (shouldLog) {
			console.error(`[${new Date().toISOString()}] ${method} ${url} - Error: ${error} - ${elapsed}ms`)
		}
		throw error
	}
}
