import { Hono } from "hono"

import { FavoritesRoutes } from "./favorites"
import { ChunithmKamaitachiRoutes } from "./kamaitachi"
import { ChunithmLeaderboardRoutes } from "./leaderboard"
import { ChunithmModsRoutes } from "./modifications"
import { ChunithmOptionsRoutes } from "./options"
import { ChunithmProfileRoutes } from "./profile"
import { ChunithmScorePlaylog } from "./playlog"
import { UserRatingFramesRoutes } from "./rating"
import { ChunithmReiwaRoutes } from "./reiwa"
import { RivalsRoutes } from "./rivals"
import { ChunithmSettingsRoutes } from "./settings"
import { ChunithmStaticMusic } from "./staticmusic"
import { ChunithmTeamsRoutes } from "./teams"
import { UsernameRoutes } from "./update-name"
import { UserBoxRoutes } from "./userbox"

export const AllChunithmRoutes = new Hono()
	.route("static", ChunithmStaticMusic)
	.route("profile", ChunithmProfileRoutes)
	.route("favorites", FavoritesRoutes)
	.route("kamaitachi", ChunithmKamaitachiRoutes)
	.route("leaderboard", ChunithmLeaderboardRoutes)
	.route("rating", UserRatingFramesRoutes)
	.route("reiwa", ChunithmReiwaRoutes)
	.route("rivals", RivalsRoutes)
	.route("cozynet", ChunithmSettingsRoutes)
	.route("options", ChunithmOptionsRoutes)
	.route("mods", ChunithmModsRoutes)
	.route("playlog", ChunithmScorePlaylog)
	.route("teams", ChunithmTeamsRoutes)
	.route("userbox", UserBoxRoutes)
	.route("username", UsernameRoutes)
