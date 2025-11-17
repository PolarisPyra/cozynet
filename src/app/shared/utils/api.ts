import { hc } from "hono/client"

import { ApiRouteType } from "@/server/routes"

export const api = hc<ApiRouteType>("/api")
