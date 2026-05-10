import { useMutation, useQueryClient } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"

export type ChunithmKamaiImportScore = {
	songId: number
	level: number
	score: number
	noteLamp: "ALL JUSTICE CRITICAL" | "ALL JUSTICE" | "FULL COMBO" | "NONE"
	clearLamp: "CATASTROPHY" | "ABSOLUTE" | "BRAVE" | "HARD" | "CLEAR" | "FAILED"
	timeAchieved?: number
	judgements?: {
		jcrit: number
		justice: number
		attack: number
		miss: number
	}
	maxCombo?: number
}

type ChunithmKamaiImportResult = {
	importedCount: number
	bestUpdatedCount?: number
	duplicateCount: number
	missingSongCount: number
	skippedCount: number
}

export function useScoreImporter() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (scores: ChunithmKamaiImportScore[]) => {
			const response = await api.chunithm.scoreExporter.import.$post({
				json: { scores }
			})

			if (!response.ok) {
				throw new Error("Failed to import scores")
			}

			return (await response.json()) as ChunithmKamaiImportResult
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["chunithm", "scores"] })
			queryClient.invalidateQueries({ queryKey: ["chunithm", "rating"] })
		}
	})
}
