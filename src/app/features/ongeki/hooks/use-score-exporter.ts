import { useQuery } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"

interface BatchManualScore {
	identifier: string
	matchType: "inGameID"
	score: number
	noteLamp: "LOSS" | "CLEAR" | "FULL COMBO" | "ALL BREAK" | "ALL BREAK+"
	bellLamp: "NONE" | "FULL BELL"
	difficulty: "BASIC" | "ADVANCED" | "EXPERT" | "MASTER" | "LUNATIC"
	timeAchieved?: number
	judgements?: {
		cbreak: number
		break: number
		hit: number
		miss: number
	}
	optional?: {
		maxCombo: number
		battleScore?: number
		fast?: number
		slow?: number
		damage?: number
		bellCount?: number
		totalBellCount?: number
	}
}

interface BatchManualImport {
	meta: {
		game: string
		playtype: string
		service: string
	}
	scores: BatchManualScore[]
	classes?: {
		dan?: string
	}
}

/**
 * Hook to fetch Ongeki score export data
 * @returns Query result with score export data
 */
export const useOngekiScoreExporter = () => {
	return useQuery({
		queryKey: ["ongeki", "score-exporter", "export"],
		queryFn: async () => {
			const response = await api.ongeki.scoreExporter.export.$get()

			if (!response.ok) {
				throw new Error()
			}

			return (await response.json()) as BatchManualImport
		},
		enabled: false // Only fetch when manually triggered
	})
}
