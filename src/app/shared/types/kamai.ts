export type KamaiDifficulty = "BASIC" | "ADVANCED" | "EXPERT" | "MASTER" | "ULTIMA" | "LUNATIC"

export type KamaiChartDefinition = {
	chartID: string
	difficulty?: KamaiDifficulty
	data?: {
		inGameID?: number
		maxPlatScore?: number
	}
}

export type KamaiPbScore = {
	chartID?: string
	game?: string
	playtype?: string
	songID?: number
	timeAchieved?: number | null
	scoreData?: {
		score?: number
		noteLamp?: string
		clearLamp?: string
		bellLamp?: string
		platinumScore?: number | null
		platinumStars?: number | null
		judgements?: Record<string, number | null>
		optional?: {
			maxCombo?: number
			damage?: number | null
			bellCount?: number | null
			totalBellCount?: number | null
		}
	}
}

export type KamaiFileFormat = {
	scores?: unknown[]
	body?: {
		pbs?: KamaiPbScore[]
		charts?: KamaiChartDefinition[]
	}
}
