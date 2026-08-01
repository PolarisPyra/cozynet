export const POPN_DIFFICULTIES: Record<number, string> = {
	0: "Easy",
	1: "Normal",
	2: "Hyper",
	3: "EX"
}

export const getDifficultyFromPopnChart = (chartId: number): string => POPN_DIFFICULTIES[chartId] ?? `Chart ${chartId}`

export const popnBadgeColors = (chartId?: number): string => {
	switch (chartId) {
		case 0:
			return "border-green-600 text-primary"
		case 1:
			return "border-blue-600 text-primary"
		case 2:
			return "border-orange-500 text-primary"
		case 3:
			return "border-red-600 text-primary"
		default:
			return "border-gray-700 text-primary"
	}
}

export const formatPopnDate = (date: string | null | undefined): string => {
	if (!date) return "—"
	const parsed = new Date(date)
	return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleString()
}
