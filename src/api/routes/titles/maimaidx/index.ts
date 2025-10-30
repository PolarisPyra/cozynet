import { Hono } from "hono";

import { MaimaiDXStaticMusic } from "./music";
import { MaimaiDXPlaylogRoute } from "./playlog";
import { MaimaiDXSettings } from "./settings";

export const AllMaimaiDXRoutes = new Hono()

	.route("static", MaimaiDXStaticMusic)
	.route("profile", MaimaiDXPlaylogRoute)
	.route("cozynet", MaimaiDXSettings);
