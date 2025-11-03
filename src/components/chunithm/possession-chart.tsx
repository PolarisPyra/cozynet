import { useMemo } from "react"

import { VictoryAxis, VictoryBar, VictoryChart, VictoryTheme, VictoryTooltip } from "victory"

import { usePossessionPlaylog } from "@/hooks/chunithm"
import { LEVEL_CONFIGS } from "@/utils/level-filter"

// Level labels matching the filter options (only up to 15+)
const LEVEL_LABELS = [
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
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
	"#06b6d4" // Sky
]

const CHART_CONFIG = {
	barWidth: 12,
	domainPadding: { x: [15, 15] as [number, number] },
	padding: { top: 50, left: 75, right: 25, bottom: 75 },
	height: 300,
	minWidth: 600
}

const TOOLTIP_CONFIG = {
	flyoutStyle: {
		fill: "#1f2937",
		stroke: "#4b5563",
		strokeWidth: 1
	},
	textStyle: {
		fill: "#e5e7eb",
		fontSize: 11,
		fontFamily: "inherit"
	},
	cornerRadius: 4,
	pointerLength: 6,
	flyoutPadding: { top: 8, bottom: 8, left: 12, right: 12 },
	offset: { dx: 0, dy: -5 }
}

interface PossessionChartProps {
	data: any[]
	isLoading: boolean
	levelLabels: string[]
	levelConfig: (level: number, label: string) => boolean
	filterClearedScore: (score: any) => boolean
	title: string
}

const PossessionChart = function ({
	data: scores = [],
	isLoading,
	levelLabels,
	levelConfig,
	filterClearedScore,
	title
}: PossessionChartProps) {
	const chartData = useMemo(() => {
		if (!scores || scores.length === 0) return []

		const clearedScores = scores.filter(filterClearedScore)

		// Group unique songs by level category
		const levelMap = new Map<string, Set<string>>()

		clearedScores.forEach(score => {
			if (!score.level || !score.musicId) return

			// Find which level label this score belongs to
			for (const label of levelLabels) {
				if (levelConfig(score.level, label)) {
					if (!levelMap.has(label)) {
						levelMap.set(label, new Set())
					}

					// Track unique songs by musicId + chartId combination
					const uniqueKey = `${score.musicId}-${score.chartId}`
					levelMap.get(label)!.add(uniqueKey)
					break
				}
			}
		})

		// Calculate total for percentage calculation
		const totalSongs = Array.from(levelMap.values()).reduce((sum, set) => sum + set.size, 0)

		// Convert to chart data, only including levels with cleared songs
		const data = levelLabels
			.map((label, index) => {
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
			})
			.filter(item => item.count > 0)

		return data
	}, [scores, levelLabels, levelConfig, filterClearedScore])

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
				<h3 className="text-foreground mb-4 text-lg font-semibold">{title}</h3>
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

	const chartWidth = Math.max(CHART_CONFIG.minWidth, chartData.length * 24)

	return (
		<div className="bg-card border-border rounded-md border p-2 shadow-sm">
			<h3 className="text-primary mb-3 text-lg font-semibold">{title}</h3>
			<div className="w-full overflow-x-auto">
				<VictoryChart
					theme={VictoryTheme.material}
					domainPadding={CHART_CONFIG.domainPadding}
					padding={CHART_CONFIG.padding}
					height={CHART_CONFIG.height}
					width={chartWidth}
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
						tickValues={levelLabels}
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
						barWidth={CHART_CONFIG.barWidth}
						labelComponent={
							<VictoryTooltip
								flyoutStyle={TOOLTIP_CONFIG.flyoutStyle}
								style={TOOLTIP_CONFIG.textStyle}
								cornerRadius={TOOLTIP_CONFIG.cornerRadius}
								pointerLength={TOOLTIP_CONFIG.pointerLength}
								flyoutPadding={TOOLTIP_CONFIG.flyoutPadding}
								dx={TOOLTIP_CONFIG.offset.dx}
								dy={TOOLTIP_CONFIG.offset.dy}
								constrainToVisibleArea
							/>
						}
						style={{
							data: {
								fill: ({ datum }) => CHART_COLORS[datum.index % CHART_COLORS.length],
								fillOpacity: 0.85,
								stroke: ({ datum }) => CHART_COLORS[datum.index % CHART_COLORS.length],
								strokeWidth: 1.5
							}
						}}
					/>
				</VictoryChart>
			</div>
		</div>
	)
}

const ChunithmPossessionChart = () => {
	const { data: scores = [], isLoading } = usePossessionPlaylog()

	return (
		<PossessionChart
			data={scores}
			isLoading={isLoading}
			levelLabels={LEVEL_LABELS}
			levelConfig={(level, label) => LEVEL_CONFIGS.CHUNITHM(level, label)}
			filterClearedScore={score => {
				const isCleared = score.isClear === 1
				const hasLevel = score.level != null && score.level > 0
				const isNotWorldsEnd = score.chartId !== 5
				const hasMusicId = score.musicId != null

				return isCleared && hasLevel && isNotWorldsEnd && hasMusicId
			}}
			title="Songs Cleared by Level"
		/>
	)
}

export default ChunithmPossessionChart
