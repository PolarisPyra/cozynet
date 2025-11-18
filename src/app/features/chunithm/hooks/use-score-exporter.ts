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

interface KamaitachiExportResponse {
	success: boolean
	data: BatchManualImport
	message?: string
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
			const data = (await response.json()) as KamaitachiExportResponse

			if (!response.ok) {
				throw new Error()
			}

			return data.data
		},
		enabled: false // Only fetch when manually triggered
	})
}
