import { useQuery } from "@tanstack/react-query";

import { ChunithmPlaylog } from "@/shared/types";
import { api } from "@/utils";

// Fetch Chunithm scores
export function useChunithmScores() {
	return useQuery<ChunithmPlaylog[]>({
		queryKey: ["chunithm", "scores"],
		queryFn: async () => {
			const response = await api.chunithm.profile.playlog.$get();

			if (!response.ok) {
				throw new Error();
			}

			return (await response.json()) as ChunithmPlaylog[];
		},
	});
}
