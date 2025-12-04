import { Hono } from "hono"

import nameplate from "./nameplate"

export const UserBoxRoutes = new Hono().route("nameplate", nameplate)
