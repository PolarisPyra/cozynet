export function formatLevel(level?: number | null): string {
	if (level == null) return "?"
	return Number.isFinite(level) ? level.toFixed(1) : "?"
}
