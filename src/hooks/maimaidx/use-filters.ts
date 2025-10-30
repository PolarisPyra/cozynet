import { useMemo } from "react";

import { useMaimaiDxScores } from "@/hooks/maimaidx";
import { Mai2Playlog } from "@/shared/types";

// Filter Types
interface Filter {
	id: string;
	label: string;
}

// Chart Filter Types
type ChartFilter = "normal" | "re-master" | "utage";

// Score Filtering Types
interface UseMaimaiDxScoreFilteringParams {
	searchQuery: string;
	versionNum: number | null;
	showAllScores: boolean;
}

// Chart Filter Configuration Hook
const useMaimaiDxChartFilters = () => {
	return useMemo(() => {
		return [
			{ id: "normal", label: "Normal" },
			{ id: "re-master", label: "Re:MASTER" },
			{ id: "utage", label: "協 Utage" },
		];
	}, []);
};

// Score Filtering Hook
const useMaimaiDxScoreFiltering = ({ searchQuery, versionNum, showAllScores }: UseMaimaiDxScoreFilteringParams) => {
	const { data: scores = [], isLoading } = useMaimaiDxScores();

	const filteredScores = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();

		// Group scores by musicId + level and get best achievement for each
		const bestScoresMap = new Map<string, Mai2Playlog>();

		scores.forEach((score: Mai2Playlog) => {
			if (!score.musicId || !score.level) return;

			const key = `${score.musicId}-${score.level}`;
			const existing = bestScoresMap.get(key);

			// Use integer comparison - achievement is stored as integer (e.g., 100_5000 for 100.5000%)
			if (!existing || (score.achievement && existing.achievement && score.achievement > existing.achievement)) {
				bestScoresMap.set(key, score);
			}
		});

		const bestScores = Array.from(bestScoresMap.values());

		return bestScores
			.filter((score) => {
				// Filter by search query
				if (normalizedQuery && score.title && !score.title.toLowerCase().includes(normalizedQuery)) {
					return false;
				}

				// Filter by version if available
				if (versionNum && score.songVersion) {
					return showAllScores ? score.songVersion <= versionNum : score.songVersion === versionNum;
				}

				return true;
			})
			.sort((a, b) => (b.songVersion || 0) - (a.songVersion || 0));
	}, [scores, searchQuery, versionNum, showAllScores]);

	return {
		filteredScores,
		isLoading,
	};
};

// Export individual hooks
export { useMaimaiDxChartFilters, useMaimaiDxScoreFiltering };

// Export types
export type { Filter, ChartFilter, UseMaimaiDxScoreFilteringParams };
