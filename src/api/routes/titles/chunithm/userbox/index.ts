import { Hono } from "hono";

import AvatarRoutes from "./avatar";
import CharacterRoutes from "./character";
import MapiconRoutes from "./mapicon";
import NameplateRoutes from "./nameplate";
import StageRoutes from "./stage";
import SystemVoiceRoutes from "./systemvoice";
import TrophyRoutes from "./trophy";

export const UserBoxRoutes = new Hono()
	.route("avatar", AvatarRoutes)
	.route("character", CharacterRoutes)
	.route("nameplate", NameplateRoutes)
	.route("mapicon", MapiconRoutes)
	.route("stage", StageRoutes)
	.route("systemvoice", SystemVoiceRoutes)
	.route("trophy", TrophyRoutes);
