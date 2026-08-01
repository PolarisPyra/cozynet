import type { Filter } from "@/app/shared/hooks/use-filtering"
import type { PopnPlaylog, PopnStaticMusic } from "@/app/shared/types"
import { getDifficultyFromPopnChart } from "@/app/shared/utils/popn"

const chartOptions = [0, 1, 2, 3].map(chartId => ({
	label: getDifficultyFromPopnChart(chartId),
	value: String(chartId)
}))

export const songFilters: Filter<PopnStaticMusic>[] = [
	{
		identifier: "genre",
		label: "Genre",
		options: [{ label: "All", value: "all" }],
		predicate: (song, value) => value === "all" || song.genre === value
	},
	{
		identifier: "chartType",
		label: "Chart Type",
		options: [{ label: "All", value: "all" }, ...chartOptions],
		predicate: (song, value) => value === "all" || song.chartId === Number(value)
	}
]

export const scoreFilters: Filter<PopnPlaylog>[] = [
	{
		identifier: "chartType",
		label: "Chart Type",
		options: [{ label: "All", value: "all" }, ...chartOptions],
		predicate: (score, value) => value === "all" || score.chartId === Number(value)
	},
	{
		identifier: "clearType",
		label: "Clear Type",
		options: [{ label: "All", value: "all" }],
		predicate: () => true
	}
]
