import type { Filter } from "@/app/shared/hooks/use-filtering"
import { LEVELS } from "@/app/shared/config/filter-options"
import { LEVEL_CONFIGS } from "@/app/shared/utils/level-filter"
import type { Mai2Playlog, MaimaiRating } from "@/app/shared/types/frontend"
import type { DB } from "@/app/shared/types"

export const scoreFilters: Filter<Mai2Playlog>[] = [
	{
		identifier: "level",
		label: "Level",
		options: LEVELS,
		predicate: (s, v) => (s.difficulty ? LEVEL_CONFIGS.MAIMAI(s.difficulty, v) : false)
	}
]

export const ratingFilters: Filter<MaimaiRating>[] = [
	{
		identifier: "tab",
		label: "Tab",
		isRequired: true,
		options: [
			{ label: "Best 35", value: "base" },
			{ label: "Best 15", value: "new" }
		],
		predicate: () => true
	},
	{
		identifier: "level",
		label: "Level",
		options: LEVELS,
		predicate: (r, v) => (r.difficulty ? LEVEL_CONFIGS.MAIMAI(r.difficulty, v) : false)
	},
	{
		identifier: "achievement",
		label: "Achievement",
		options: [
			{ label: "All", value: "all" },
			{ label: "Full Combo", value: "fc" },
			{ label: "All Perfect", value: "ap" },
			{ label: "Full Sync", value: "fs" },
			{ label: "Full Deluxe", value: "fdx" }
		],
		predicate: (r, v) => {
			if (v === "fc") return r.comboStatus === 1 || r.comboStatus === 2
			if (v === "ap") return r.comboStatus === 3 || r.comboStatus === 4
			if (v === "fs") return r.syncStatus === 1 || r.syncStatus === 2
			if (v === "fdx") return r.syncStatus === 3 || r.syncStatus === 4
				return true
		}
	}
]

export const songFilters: Filter<DB.Mai2StaticMusic>[] = [
	{
		identifier: "level",
		label: "Level",
		options: LEVELS,
		predicate: (s, v) => (s.difficulty ? LEVEL_CONFIGS.MAIMAI(s.difficulty, v) : false)
	}
]

export const chartFilters = [
	{ label: "All", value: "all" },
	{ label: "BASIC", value: "0" },
	{ label: "ADVANCED", value: "1" },
	{ label: "EXPERT", value: "2" },
	{ label: "MASTER", value: "3" },
	{ label: "Re:MASTER", value: "4" }
]
