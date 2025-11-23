import { Hono } from "hono"

import { MaimaiDXStaticMusic } from "./music"
import { MaimaiDXProfileRoutes } from "./profile"
import { UserRatingFramesRoutes } from "./rating"
import { MaimaiDXSettings } from "./settings"

export const AllMaimaiDXRoutes = new Hono()

	.route("static", MaimaiDXStaticMusic)
	.route("profile", MaimaiDXProfileRoutes)
	.route("rating", UserRatingFramesRoutes)
	.route("cozynet", MaimaiDXSettings)
