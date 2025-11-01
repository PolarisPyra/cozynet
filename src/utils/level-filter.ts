export const createLevelPredicate = (threshold: number, split: number) => {
	const getLevelRange = (value: string): { min: number; max: number } | null => {
		if (value === "all") {
			return null
		}

		const baseLevel = parseInt(value, 10)
		const isPlus = value.endsWith("+")

		if (baseLevel < threshold) {
			return {
				min: baseLevel,
				max: baseLevel + 1
			}
		}

		if (!isPlus) {
			return {
				min: baseLevel,
				max: baseLevel + split
			}
		}

		return {
			min: baseLevel + split,
			max: baseLevel + 1
		}
	}

	return (level: number | null, value: string): boolean => {
		if (value === "all") {
			return true
		}

		if (!level) {
			return false
		}

		const normalizedLevel = Math.round(level * 10) / 10

		const range = getLevelRange(value)
		if (!range) {
			return false
		}

		return normalizedLevel >= range.min && normalizedLevel < range.max
	}
}

export const LEVEL_CONFIGS = {
	CHUNITHM: createLevelPredicate(
		7, // threshold: decimal split starts at level 7
		0.5 // split: "7" = 7.0-7.4, "7+" = 7.5-7.9
	),
	MAIMAI: createLevelPredicate(7, 0.6),
	ONGEKI: createLevelPredicate(7, 0.7)
} as const
