import { Hono } from "hono"

import { OngekiCardsRoutes } from "./cards"
import { OngekiLeaderboardRoutes } from "./leaderboard"
import { OngekiModsRoutes } from "./modifications"
import { OngekiStaticMusic } from "./music"
import { NewUserRatingFramesRoutes } from "./new-rating"
import { OngekiPossessionRoutes } from "./possession"
import { OngekiProfilePlaylog } from "./playlog"
import { OngekiRatingRoutes } from "./rating"
import { OngekiReiwaRoutes } from "./reiwa"
import { OngekiRivalsRoutes } from "./rivals"
import { OngekiSettingsRoutes } from "./settings"

export const AllOngekiRoutes = new Hono()
	.route("profile", OngekiProfilePlaylog)
	.route("static", OngekiStaticMusic)

	.route("rating", OngekiRatingRoutes)
	.route("newRating", NewUserRatingFramesRoutes)
	.route("settings", OngekiSettingsRoutes)
	.route("leaderboard", OngekiLeaderboardRoutes)
	.route("possession", OngekiPossessionRoutes)

	.route("rivals", OngekiRivalsRoutes)
	.route("mods", OngekiModsRoutes)
	.route("reiwa", OngekiReiwaRoutes)
	.route("cards", OngekiCardsRoutes)
