export const getMaimaiDxGrade = (achievement: number): string => {
	// Achievement is stored as integer (e.g., 100_5000 for 100.5000%)
	if (achievement >= 100_5000) return "SSS+"
	if (achievement >= 100_0000) return "SSS"
	if (achievement >= 99_5000) return "SS+"
	if (achievement >= 99_0000) return "SS"
	if (achievement >= 98_0000) return "S+"
	if (achievement >= 97_0000) return "S"
	if (achievement >= 94_0000) return "AAA"
	if (achievement >= 90_0000) return "AA"
	if (achievement >= 80_0000) return "A"
	if (achievement >= 75_0000) return "BBB"
	if (achievement >= 70_0000) return "BB"
	if (achievement >= 60_0000) return "B"
	if (achievement >= 50_0000) return "C"
	return "D"
}

export const formatMaimaiDxAchievement = (achievement: number): string => {
	return (achievement / 10000).toFixed(4) + "%"
}

export const maimaiDxBadgeColors = (chartId?: number) => {
	const diff = String(getDifficultyFromMaimaiDxChart(chartId ?? 0))
	switch (diff) {
		case "Basic":
			return "border border-green-600 text-primary"
		case "Advanced":
			return "border border-orange-500 text-primary"
		case "Expert":
			return "border border-red-600 text-primary"
		case "Master":
			return "border border-purple-600 text-primary"
		case "Re:Master":
			return "border border-pink-600 text-primary"
		default:
			return "border border-gray-700 text-primary"
	}
}

export const getDifficultyFromMaimaiDxChart = (chartId: number) => {
	switch (chartId) {
		case 0:
			return "Basic"
		case 1:
			return "Advanced"
		case 2:
			return "Expert"
		case 3:
			return "Master"
		case 4:
			return "Re:Master"
		default:
			return "Unknown"
	}
}

export const getMaimaiDxComboStatus = (comboStatus?: number): string => {
	switch (comboStatus) {
		case 1:
			return "FC"
		case 2:
			return "FC+"
		case 3:
			return "AP"
		case 4:
			return "AP+"
		default:
			return ""
	}
}

export const getMaimaiDxSyncStatus = (syncStatus?: number): string => {
	switch (syncStatus) {
		case 1:
			return "FS"
		case 2:
			return "FS+"
		case 3:
			return "FDX"
		case 4:
			return "FDX+"
		default:
			return ""
	}
}
