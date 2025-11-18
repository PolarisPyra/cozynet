import { Hono } from "hono"

import { FavoritesRoutes } from "./favorites"
import { ChunithmScoreExporterRoutes } from "./score-exporter"
import { ChunithmLeaderboardRoutes } from "./leaderboard"
import { ChunithmModsRoutes } from "./modifications"
import { ChunithmOptionsRoutes } from "./options"
import { ChunithmProfileRoutes } from "./profile"
import { UserRatingFramesRoutes } from "./rating"
import { RivalsRoutes } from "./rivals"
import { ChunithmScoreLeaderboardRoutes } from "./score-leaderboard"
import { ChunithmSettingsRoutes } from "./settings"
import { ChunithmStaticMusic } from "./staticmusic"
import { ChunithmTeamsRoutes } from "./teams"
import { UsernameRoutes } from "./update-name"
import { UserBoxRoutes } from "./userbox"

export const AllChunithmRoutes = new Hono()
	.route("static", ChunithmStaticMusic)
	.route("profile", ChunithmProfileRoutes)
	.route("favorites", FavoritesRoutes)
	.route("scoreExporter", ChunithmScoreExporterRoutes)
	.route("leaderboard", ChunithmLeaderboardRoutes)
	.route("score-leaderboard", ChunithmScoreLeaderboardRoutes)
	.route("rating", UserRatingFramesRoutes)
	.route("rivals", RivalsRoutes)
	.route("cozynet", ChunithmSettingsRoutes)
	.route("options", ChunithmOptionsRoutes)
	.route("mods", ChunithmModsRoutes)
	.route("teams", ChunithmTeamsRoutes)
	.route("userbox", UserBoxRoutes)
	.route("username", UsernameRoutes)
