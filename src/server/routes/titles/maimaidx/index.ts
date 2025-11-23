import { Hono } from "hono"

import { MaimaiDXStaticMusic } from "./music"
import { MaimaiDXPlaylogRoute } from "./playlog"
import { MaimaiDXRatingRoutes } from "./rating"
import { MaimaiDXSettings } from "./settings"

export const AllMaimaiDXRoutes = new Hono()

	.route("static", MaimaiDXStaticMusic)
	.route("profile", MaimaiDXPlaylogRoute)
	.route("rating", MaimaiDXRatingRoutes)
	.route("cozynet", MaimaiDXSettings)
