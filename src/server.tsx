/** @jsxImportSource hono/jsx */
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { HTTPException } from "hono/http-exception";
import { jsxRenderer } from "hono/jsx-renderer";
import { jwt } from "hono/jwt";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

import { jwtPayloadMiddleware } from "./api/middleware/jwtPayload";
import { Routes, UnprotectedRoutes } from "./api/routes";

const { NODE_ENV, CLIENT_PORT, DOMAIN, JWT_SECRET, SERVER_PORT } = process.env;

const protocol = NODE_ENV === "production" ? "https" : "http";
const port = NODE_ENV === "production" ? "" : `:${CLIENT_PORT}`;
const origin = `${protocol}://${DOMAIN}${port}`;

const server = new Hono()
	.use(
		"*",
		cors({
			origin: [origin],
			credentials: true,
			allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			allowHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
		})
	)
	.use(
		"*",
		csrf({
			origin: (requestOrigin) => {
				const allowedOrigins = [origin];
				return allowedOrigins.includes(requestOrigin);
			},
		})
	)
	.use(secureHeaders())
	.use(logger())
	.onError((err, c) => {
		if (err instanceof HTTPException) {
			return c.json({ error: err.message }, err.status);
		}
		return c.json({ error: err.message }, 500);
	})
	.use(compress())
	// Apply rate limiting to all API routes
	.use(
		"/api/*",
		rateLimiter({
			windowMs: 1 * 60 * 1000, // 1 minute
			limit: 100, // 100 requests per minute for all API routes
			standardHeaders: "draft-6",
			keyGenerator: (c) => {
				// Use IP address from headers (works with proxies) or fallback to connection IP
				return c.req.header("x-forwarded-for")?.split(",")[0].trim() || c.req.header("x-real-ip") || "unknown";
			},
		})
	)
	.route("/api", UnprotectedRoutes)
	.use(jwt({ secret: JWT_SECRET!, cookie: "auth_token" }))
	.use(jwtPayloadMiddleware())
	.route("/api", Routes)
	.use("/public/*", serveStatic({ root: "./public" }))
	.use("/assets/*", serveStatic({ root: "./public/assets" }))
	.get(
		"/*",
		jsxRenderer(() => (
			<html lang="en">
				<head>
					<meta charSet="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<title>Thamyris</title>
				</head>
				<body>
					<div id="root"></div>
					<script type="module" src="/src/client.tsx"></script>
				</body>
			</html>
		))
	);

serve({
	fetch: server.fetch,
	port: Number(SERVER_PORT) || 3000,
});

export default server;
