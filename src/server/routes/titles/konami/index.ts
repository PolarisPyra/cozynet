import { Hono } from "hono"

import { PopnRoutes } from "./popn"

export const AllKonamiRoutes = new Hono().route("popn", PopnRoutes)
