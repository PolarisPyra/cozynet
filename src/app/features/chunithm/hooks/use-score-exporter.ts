import { useQuery } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"

interface BatchManualScore {
	identifier: string
	matchType: "inGameID"
	score: number
	noteLamp: "ALL JUSTICE CRITICAL" | "ALL JUSTICE" | "FULL COMBO" | "NONE"
	clearLamp: "CATASTROPHY" | "ABSOLUTE" | "BRAVE" | "HARD" | "CLEAR" | "FAILED"
	difficulty: "BASIC" | "ADVANCED" | "EXPERT" | "MASTER" | "ULTIMA"
	timeAchieved?: number
	judgements?: {
		jcrit: number
		justice: number
		attack: number
		miss: number
	}
	optional?: {
		maxCombo: number
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
		emblem?: string
	}
}

/**
 * Hook to fetch score export data for Chunithm
 * Returns data in Kamaitachi-compatible format
 */
export const useScoreExporter = () => {
	return useQuery({
		queryKey: ["chunithm", "score-exporter", "export"],
		queryFn: async () => {
			const response = await api.chunithm.scoreExporter.export.$get()

			if (!response.ok) {
				throw new Error()
			}

			return (await response.json()) as BatchManualImport
		},
		enabled: false // Only fetch when manually triggered
	})
}
