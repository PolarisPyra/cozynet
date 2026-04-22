import { useMutation, useQueryClient } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"

export type OngekiKamaiImportScore = {
	musicId: number
	level: 0 | 1 | 2 | 3 | 10
	score: number
	noteLamp: "LOSS" | "CLEAR" | "FULL COMBO" | "ALL BREAK" | "ALL BREAK+"
	bellLamp: "NONE" | "FULL BELL"
	platinumScore?: number | null
	platinumScoreMax?: number | null
	platinumStars?: number | null
	timeAchieved?: number
	judgements?: {
		cbreak: number
		break: number
		hit: number
		miss: number
	}
	maxCombo?: number
	damage?: number | null
	bellCount?: number | null
	totalBellCount?: number | null
}

type OngekiKamaiImportResult = {
	importedCount: number
	duplicateCount: number
	missingSongCount: number
	skippedCount: number
}

export function useOngekiScoreImporter() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (scores: OngekiKamaiImportScore[]) => {
			const response = await api.ongeki.scoreExporter.import.$post({
				json: { scores }
			})

			if (!response.ok) {
				throw new Error("Failed to import scores")
			}

			return (await response.json()) as OngekiKamaiImportResult
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ongeki", "scores"] })
		}
	})
}
