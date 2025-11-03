import { useMemo } from "react"

import { VictoryAxis, VictoryBar, VictoryChart, VictoryTheme, VictoryTooltip } from "victory"

import { usePossessionPlaylog } from "@/hooks/ongeki"
import { LEVEL_CONFIGS } from "@/utils/level-filter"

// Level labels matching the filter options (includes 5+ and 6+ which Chunithm doesn't have)
const LEVEL_LABELS = [
	"1",
	"2",
	"3",
	"4",
	"5",
	"5+",
	"6",
	"6+",
	"7",
	"7+",
	"8",
	"8+",
	"9",
	"9+",
	"10",
	"10+",
	"11",
	"11+",
	"12",
	"12+",
	"13",
	"13+",
	"14",
	"14+",
	"15",
	"15+"
]

// Custom color palette for the chart
const CHART_COLORS = [
	"#3b82f6", // Blue
	"#8b5cf6", // Purple
	"#ec4899", // Pink
	"#f59e0b", // Amber
	"#10b981", // Emerald
	"#06b6d4", // Cyan
	"#f97316", // Orange
	"#6366f1", // Indigo
	"#14b8a6", // Teal
	"#ef4444", // Red
	"#84cc16", // Lime
	"#a855f7", // Violet
	"#22c55e", // Green
	"#eab308", // Yellow
	"#06b6d4", // Sky
	"#f43f5e", // Rose
	"#8b5cf6", // Purple
	"#3b82f6", // Blue
	"#ec4899", // Pink
	"#f59e0b", // Amber
	"#10b981", // Emerald
	"#06b6d4", // Cyan
	"#f97316", // Orange
	"#6366f1", // Indigo
	"#14b8a6", // Teal
	"#ef4444" // Red
]

const OngekiPossessionChart = () => {
	const { data: scores = [], isLoading } = usePossessionPlaylog()

	const chartData = useMemo(() => {
		if (!scores || scores.length === 0) return []

		// Filter only cleared songs (clearStatus === 2 means "Won")
		// Version filtering is already handled server-side in the playlog endpoint
		const clearedScores = scores.filter(score => {
			const isCleared = score.clearStatus === 2
			const hasLevel = score.level != null && score.level > 0
			const hasMusicId = score.musicId != null

			return isCleared && hasLevel && hasMusicId
		})

		// Group unique songs by level category (using same logic as filters)
		const levelMap = new Map<string, Set<string>>()

		clearedScores.forEach(score => {
			if (!score.level || !score.musicId) return

			// Find which level label this score belongs to
			for (const label of LEVEL_LABELS) {
				if (LEVEL_CONFIGS.ONGEKI(score.level, label)) {
					if (!levelMap.has(label)) {
						levelMap.set(label, new Set())
					}

					// Track unique songs by musicId + chartId combination (same song can have multiple charts)
					const uniqueKey = `${score.musicId}-${score.chartId}`
					levelMap.get(label)!.add(uniqueKey)
					break
				}
			}
		})

		// Calculate total for percentage calculation
		const totalSongs = Array.from(levelMap.values()).reduce((sum, set) => sum + set.size, 0)

		// Convert to chart data, only including levels with cleared songs
		const data = LEVEL_LABELS.map((label, index) => {
			const count = levelMap.get(label)?.size || 0
			const percentage = totalSongs > 0 ? ((count / totalSongs) * 100).toFixed(2) : "0.00"
			return {
				x: label,
				y: count,
				label: count === 0 ? "" : `Level ${label}\n${count} songs cleared`,
				count,
				percentage,
				total: totalSongs,
				index
			}
		}).filter(item => item.count > 0)

		return data
	}, [scores])

	if (isLoading) {
		return (
			<div className="bg-card border-border flex h-96 items-center justify-center rounded-md border p-4 shadow-sm">
				<p className="text-muted-foreground">Loading chart data...</p>
			</div>
		)
	}

	if (chartData.length === 0) {
		return (
			<div className="bg-card border-border rounded-md border p-4 shadow-sm">
				<h3 className="text-foreground mb-4 text-lg font-semibold">Songs Cleared by Level</h3>
				<div className="flex h-96 items-center justify-center">
					<p className="text-muted-foreground">No cleared songs found</p>
				</div>
			</div>
		)
	}

	const maxCount = Math.max(...chartData.map(d => d.y), 1)
	const tickInterval = maxCount <= 10 ? 1 : maxCount <= 50 ? 5 : maxCount <= 100 ? 10 : 20
	const tickValues = []
	for (let i = 0; i <= maxCount; i += tickInterval) {
		tickValues.push(i)
	}

	const xTickValues = LEVEL_LABELS

	return (
		<div className="bg-card border-border rounded-md border p-2 shadow-sm">
			<h3 className="text-primary mb-3 text-lg font-semibold">Songs Cleared by Level</h3>
			<div className="w-full">
				<VictoryChart
					theme={VictoryTheme.material}
					domainPadding={{ x: [15, 15] }}
					padding={{ top: 20, left: 75, right: 25, bottom: 75 }}
					height={300}
					width={Math.max(600, chartData.length * 24)}
				>
					<VictoryAxis
						dependentAxis
						tickValues={tickValues}
						label="Number of Songs"
						style={{
							axis: { stroke: "hsl(var(--muted-foreground))", strokeWidth: 2 },
							ticks: { stroke: "hsl(var(--muted-foreground))", size: 5 },
							tickLabels: { fill: "var(--primary)", fontSize: 11, padding: 5 },
							axisLabel: { fill: "var(--primary)", fontSize: 12, padding: 50 }
						}}
					/>
					<VictoryAxis
						tickValues={xTickValues}
						tickFormat={(x: string) => x}
						label="Level"
						style={{
							axis: { stroke: "hsl(var(--muted-foreground))", strokeWidth: 1.5 },
							ticks: { stroke: "hsl(var(--muted-foreground))", size: 4 },
							tickLabels: { fill: "var(--primary)", fontSize: 10, angle: -45, textAnchor: "end", padding: 8 },
							axisLabel: { fill: "var(--primary)", fontSize: 11, padding: 50 }
						}}
					/>
					<VictoryBar
						data={chartData}
						barWidth={12}
						labelComponent={
							<VictoryTooltip
								flyoutStyle={{
									fill: "#1f2937",
									stroke: "#4b5563",
									strokeWidth: 1
								}}
								style={{
									fill: "#e5e7eb",
									fontSize: 11,
									fontFamily: "inherit"
								}}
								cornerRadius={4}
								pointerLength={6}
								flyoutPadding={{ top: 8, bottom: 8, left: 12, right: 12 }}
								dx={0}
								dy={-5}
							/>
						}
						style={{
							data: {
								fill: ({ datum }) => {
									const levelIndex = datum.index
									return CHART_COLORS[levelIndex % CHART_COLORS.length]
								},
								fillOpacity: 0.85,
								stroke: ({ datum }) => {
									const levelIndex = datum.index
									return CHART_COLORS[levelIndex % CHART_COLORS.length]
								},
								strokeWidth: 1.5
							}
						}}
					/>
				</VictoryChart>
			</div>
		</div>
	)
}

export default OngekiPossessionChart
