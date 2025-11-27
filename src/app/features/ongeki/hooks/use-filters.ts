import type { Filter } from "@/app/shared/hooks/use-filtering"
import { LEVELS_ONGEKI } from "@/app/shared/config/filter-options"
import { LEVEL_CONFIGS } from "@/app/shared/utils/level-filter"

import ongekiSkills from "./ongekiSkill.json"

const skillMap = new Map(ongekiSkills.map((s: any) => [s.id, s.category]))

export const scoreFilters: Filter[] = [
	{
		identifier: "level",
		label: "Level",
		options: LEVELS_ONGEKI,
		predicate: (s, v) => (s.level ? LEVEL_CONFIGS.ONGEKI(s.level, v) : false)
	},
	{
		identifier: "achievement",
		label: "Achievement",
		options: [
			{ label: "All", value: "all" },
			{ label: "Full Bell", value: "fb" },
			{ label: "Full Combo", value: "fc" },
			{ label: "All Break", value: "ab" }
		],
		predicate: (s, v) => (v === "fb" ? s.isFullBell === 1 : v === "fc" ? s.isFullCombo === 1 : v === "ab" ? s.isAllBreak === 1 : true)
	}
]

export const ratingFilters = (version: number): Filter[] => [
	{
		identifier: "category",
		label: "Category",
		options:
			version >= 8
				? [
						{ label: "Top 50", value: "base" },
						{ label: "Current 10", value: "current" },
						{ label: "PScore", value: "pscore" },
						{ label: "Recommended", value: "next" }
					]
				: [
						{ label: "Top 30", value: "base" },
						{ label: "Recent 10", value: "current" },
						{ label: "Recent 15", value: "recent" },
						{ label: "Recommended", value: "next" }
					],
		predicate: () => true
	},
	{
		identifier: "level",
		label: "Level",
		options: LEVELS_ONGEKI,
		predicate: (r, v) => (r.level ? LEVEL_CONFIGS.ONGEKI(r.level, v) : false)
	},
	{
		identifier: "achievement",
		label: "Achievement",
		options: [
			{ label: "All", value: "all" },
			{ label: "Full Bell", value: "fb" },
			{ label: "Full Combo", value: "fc" },
			{ label: "All Break", value: "ab" }
		],
		predicate: (r, v) => (v === "fb" ? r.isFullBell === 1 : v === "fc" ? r.isFullCombo === 1 : v === "ab" ? r.isAllBreake === 1 : true)
	}
]

export const songFilters: Filter[] = [
	{
		identifier: "level",
		label: "Level",
		options: LEVELS_ONGEKI,
		predicate: (s, v) => (s.level ? LEVEL_CONFIGS.ONGEKI(s.level, v) : false)
	},
	{
		identifier: "genre",
		label: "Genre",
		options: [
			{ label: "All", value: "all" },
			{ label: "オンゲキ", value: "オンゲキ" },
			{ label: "東方Project", value: "東方Project" },
			{ label: "POPS＆ANIME", value: "POPS＆ANIME" },
			{ label: "チュウマイ", value: "チュウマイ" },
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
			{ label: "Normal", value: "normal" },
			{ label: "Lunatic", value: "lunatic" }
		],
		predicate: (s, v) => (v === "normal" ? s.chartId !== 10 : v === "lunatic" ? s.chartId === 10 : true)
	}
]

export const cardFilters: Filter[] = [
	{
		identifier: "rarity",
		label: "Rarity",
		isRequired: true,
		options: [
			{ label: "All", value: "all" },
			{ label: "SSR", value: "3" },
			{ label: "SR+", value: "12" },
			{ label: "SR", value: "2" },
			{ label: "R", value: "1" },
			{ label: "N", value: "0" }
		],
		predicate: (c, v) => c.rarity === parseInt(v)
	},
	{
		identifier: "attribute",
		label: "Attribute",
		options: [
			{ label: "All", value: "all" },
			{ label: "Fire", value: "Fire" },
			{ label: "Aqua", value: "Aqua" },
			{ label: "Leaf", value: "Leaf" }
		],
		predicate: (c, v) => c.attribute === v
	},
	{
		identifier: "acquisition",
		label: "Acquisition",
		options: [
			{ label: "All", value: "all" },
			{ label: "Acquired", value: "1" },
			{ label: "Not Acquired", value: "0" }
		],
		predicate: (c, v) => c.isAcquired === parseInt(v)
	},
	{
		identifier: "level",
		label: "Level Range",
		options: [
			{ label: "All", value: "all" },
			{ label: "Max Level", value: "max" },
			{ label: "1-10", value: "1-10" },
			{ label: "11-20", value: "11-20" },
			{ label: "21-30", value: "21-30" },
			{ label: "31+", value: "31+" }
		],
		predicate: (c, v) => {
			if (!c.level) return false
			if (v === "max") return c.level === c.maxLevel
			if (v === "1-10") return c.level <= 10
			if (v === "11-20") return c.level >= 11 && c.level <= 20
			if (v === "21-30") return c.level >= 21 && c.level <= 30
			if (v === "31+") return c.level >= 31
			return true
		}
	},
	{
		identifier: "skill",
		label: "Skill",
		options: [
			{ label: "All", value: "all" },
			{ label: "Attack", value: "Attack" },
			{ label: "Boost", value: "Boost" },
			{ label: "Danger Attack", value: "DangerAttack" },
			{ label: "Danger Boost", value: "DangerBoost" },
			{ label: "Danger Guard", value: "DangerGuard" },
			{ label: "Guard", value: "Guard" },
			{ label: "None", value: "None" },
			{ label: "Support", value: "Support" }
		],
		predicate: (c, v) => {
			if (c.skillId == null) return v === "None"
			return skillMap.get(c.skillId) === v
		}
	}
]
