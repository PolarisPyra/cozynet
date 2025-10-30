import { useQuery } from "@tanstack/react-query";

import { OngekiPlaylog } from "@/shared/types";
import { api } from "@/utils";

// Fetch Ongeki scores
export function useOngekiScores() {
	return useQuery<OngekiPlaylog[]>({
		queryKey: ["ongeki", "scores"],
		queryFn: async () => {
			const response = await api.ongeki.profile.playlog.$get();
			if (!response.ok) {
				throw new Error();
			}

			return (await response.json()) as OngekiPlaylog[];
		},
	});
}
