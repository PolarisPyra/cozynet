import { Hono } from "hono"

import character from "./character"
import nameplate from "./nameplate"

export const UserBoxRoutes = new Hono().route("character", character).route("nameplate", nameplate)
