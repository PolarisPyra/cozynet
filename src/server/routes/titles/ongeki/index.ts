import { Hono } from "hono"

import { OngekiCardsRoutes } from "./cards"
import { OngekiScoreExporterRoutes } from "./score-exporter"
import { OngekiLeaderboardRoutes } from "./leaderboard"
import { OngekiModsRoutes } from "./modifications"
import { OngekiStaticMusic } from "./music"
import { NewUserRatingFramesRoutes } from "./new-rating"
import { OngekiProfileRoutes } from "./profile"
import { OngekiRatingRoutes } from "./rating"
import { OngekiRivalsRoutes } from "./rivals"
import { OngekiScoreLeaderboardRoutes } from "./score-leaderboard"
import { OngekiSettingsRoutes } from "./settings"
import { UsernameRoutes } from "./update-name"
import { UserBoxRoutes } from "./userbox"

export const AllOngekiRoutes = new Hono()
	.route("profile", OngekiProfileRoutes)
	.route("static", OngekiStaticMusic)

	.route("rating", OngekiRatingRoutes)
	.route("newRating", NewUserRatingFramesRoutes)
	.route("settings", OngekiSettingsRoutes)
	.route("leaderboard", OngekiLeaderboardRoutes)
	.route("score-leaderboard", OngekiScoreLeaderboardRoutes)

	.route("rivals", OngekiRivalsRoutes)
	.route("mods", OngekiModsRoutes)
	.route("scoreExporter", OngekiScoreExporterRoutes)
	.route("cards", OngekiCardsRoutes)
	.route("username", UsernameRoutes)
	.route("userbox", UserBoxRoutes)
