import { Hono } from "hono"

import { AimeCardRoute } from "./aime"
import { ArcadeRoutes } from "./arcades"
import { KeychipRoutes } from "./keychip"
import { ProfileRoutes } from "./profile"
import { UserRoutes } from "./users"

export const AllCommonRoutes = new Hono()

	.route("arcades", ArcadeRoutes)
	.route("users", UserRoutes)
	.route("aime", AimeCardRoute)
	.route("keychip", KeychipRoutes)
	.route("profile", ProfileRoutes)
