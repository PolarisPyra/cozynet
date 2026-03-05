import type { Filter } from "@/app/shared/hooks/use-filtering"
import { LEVELS, STARS } from "@/app/shared/config/filter-options"
import { levelToStars } from "@/app/shared/utils/chunithm"
import { LEVEL_CONFIGS } from "@/app/shared/utils/level-filter"
import type { ChunithmPlaylog, ChunithmRating } from "@/app/shared/types/frontend"
import type { DB } from "@/app/shared/types"

export const scoreFilters: Filter<ChunithmPlaylog>[] = [
	{
		identifier: "level",
		label: "Level",
		options: [...LEVELS, ...STARS],
		predicate: (s, v) => {
			if (s.chartId === 5) return v.startsWith("star") ? levelToStars(s.level) === parseInt(v.replace("star", "")) : false
			return LEVEL_CONFIGS.CHUNITHM(s.level, v)
		}
	},
	{
		identifier: "achievement",
		label: "Achievement",
		options: [
			{ label: "All", value: "all" },
			{ label: "Full Combo", value: "fc" },
			{ label: "All Justice", value: "aj" },
			{ label: "Full Chain", value: "fch" }
		],
		predicate: (s, v) => (v === "fc" ? s.isFullCombo === 1 : v === "aj" ? s.isAllJustice === 1 : v === "fch" ? s.fullChainKind === 1 : true)
	}
]

export const ratingFilters = (version: number): Filter<ChunithmRating>[] => [
	{
		identifier: "tab",
		label: "Tab",
		options:
			version >= 17
				? [
						{ label: "New 20", value: "new" },
						{ label: "Best 30", value: "base" },
						{ label: "Potential", value: "potential" }
					]
				: [
						{ label: "Best 30", value: "base" },
						{ label: "Recent 10", value: "recent" },
						{ label: "Potential", value: "potential" }
					],
		predicate: () => true
	},
	{
		identifier: "sort",
		label: "Sort",
		options: [
			{ label: "Default", value: "default" },
			{ label: "Floor (Lowest Level)", value: "floor" },
			{ label: "Ceiling (Highest Level)", value: "ceiling" }
		],
		// Sorting is handled in the page component; this filter never excludes items.
		predicate: () => true
	}
]

export const songFilters: Filter<DB.ChuniStaticMusic>[] = [
	{
		identifier: "level",
		label: "Level",
		options: [...LEVELS, ...STARS],
		predicate: (s, v) => {
			if (s.chartId === 5) return v.startsWith("star") ? levelToStars(s.level) === parseInt(v.replace("star", "")) : false
			return LEVEL_CONFIGS.CHUNITHM(s.level, v)
		}
	},
	{
		identifier: "genre",
		label: "Genre",
		options: [
			{ label: "All", value: "all" },
			{ label: "ORIGINAL", value: "ORIGINAL" },
			{ label: "東方Project", value: "東方Project" },
			{ label: "POPS & ANIME", value: "POPS & ANIME" },
			{ label: "ゲキマイ", value: "ゲキマイ" },
			{ label: "イロドリミドリ", value: "イロドリミドリ" },
			{ label: "niconico", value: "niconico" },
			{ label: "VARIETY", value: "VARIETY" }
		],
		predicate: (s, v) => s.genre === v
	},
	{
		identifier: "chartType",
		label: "Chart Type",
		options: [
			{ label: "All", value: "all" },
			{ label: "BASIC", value: "0" },
			{ label: "ADVANCED", value: "1" },
			{ label: "EXPERT", value: "2" },
			{ label: "MASTER", value: "3" },
			{ label: "ULTIMA", value: "4" },
			{ label: "WORLDS END", value: "5" }
		],
		predicate: (s, v) => s.chartId === parseInt(v)
	}
]
