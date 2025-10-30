import { LEVEL_CONFIGS } from "@/utils/level-filter";

import type { ScoreFilter } from "../types/music-types";

export const scoreLevelFilter: ScoreFilter = {
	identifier: "level",
	label: "Level",
	options: [
		{ label: "All", value: "all" },
		{ label: "1", value: "1" },
		{ label: "2", value: "2" },
		{ label: "3", value: "3" },
		{ label: "4", value: "4" },
		{ label: "5", value: "5" },
		{ label: "6", value: "6" },
		{ label: "7", value: "7" },
		{ label: "7+", value: "7+" },
		{ label: "8", value: "8" },
		{ label: "8+", value: "8+" },
		{ label: "9", value: "9" },
		{ label: "9+", value: "9+" },
		{ label: "10", value: "10" },
		{ label: "10+", value: "10+" },
		{ label: "11", value: "11" },
		{ label: "11+", value: "11+" },
		{ label: "12", value: "12" },
		{ label: "12+", value: "12+" },
		{ label: "13", value: "13" },
		{ label: "13+", value: "13+" },
		{ label: "14", value: "14" },
		{ label: "14+", value: "14+" },
		{ label: "15", value: "15" },
		{ label: "15+", value: "15+" },
	],
	predicate: (score, value) => {
		if (!score.level) return false;
		return LEVEL_CONFIGS.ONGEKI(score.level, value);
	},
};

export const scoreAchievementFilter: ScoreFilter = {
	identifier: "achievement",
	label: "Achievement",
	options: [
		{ label: "All", value: "all" },
		{ label: "Full Bell", value: "fullbell" },
		{ label: "Full Combo", value: "fullcombo" },
		{ label: "All Break", value: "allbreake" },
	],
	predicate: (score, value) => {
		if (value === "all") return true;

		switch (value) {
			case "fullbell":
				return score.isFullBell === 1;
			case "fullcombo":
				return score.isFullCombo === 1;
			case "allbreake":
				return score.isAllBreak === 1;
			default:
				return true;
		}
	},
};

export const scoreFilters: ScoreFilter[] = [scoreLevelFilter, scoreAchievementFilter];
