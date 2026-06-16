import { useQuery } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"

import { useOngekiVersion } from "./use-version"

interface LeaderboardEntry {
	userId: number
	username: string
	score: number
	rank: number
	isFullCombo: number
	isAllBreak: number
	isFullBell: number
	playDate: string
}

interface LeaderboardResponse {
	song: {
		title: string
		artist: string
		jacketPath: string
	} | null
	chart: {
		level: number
	} | null
	leaderboard: LeaderboardEntry[]
	total: number
}

export function useScoreLeaderboard(musicId: number, chartId: number, limit: number = 100, enabled: boolean = true) {
	const version = useOngekiVersion()

	return useQuery({
		queryKey: ["ongeki", "score-leaderboard", musicId, chartId, limit, version],
		queryFn: async () => {
			const response = await api.ongeki["score-leaderboard"][":musicId"][":chartId"].$get({
				param: {
					musicId: musicId.toString(),
					chartId: chartId.toString()
				},
				query: {
					limit: limit.toString()
				}
			})

			if (!response.ok) {
				throw new Error("Failed to fetch score leaderboard")
			}

			return (await response.json()) as LeaderboardResponse
		},
		enabled: enabled && musicId > 0 && chartId > 0 && Boolean(version)
	})
}
