import { useQuery } from "@tanstack/react-query"

import type { DB } from "@/app/shared/types"
import { api } from "@/app/shared/utils"

type ProfileVersionsResponse = {
	chunithm: Array<
		Pick<
			DB.ChuniProfileData,
			"version" | "userName" | "level" | "reincarnationNum" | "playerRating" | "playCount" | "lastPlayDate"
		>
	>
	ongeki: Array<
		Pick<
			DB.OngekiProfileData,
			| "version"
			| "userName"
			| "level"
			| "reincarnationNum"
			| "playerRating"
			| "newPlayerRating"
			| "playCount"
			| "lastPlayDate"
		>
	>
	maimaidx: Array<Pick<DB.Mai2ProfileDetail, "version" | "userName" | "playerRating" | "playCount" | "lastPlayDate">>
}

export function useProfileVersions() {
	return useQuery({
		queryKey: ["profile", "versions"],
		queryFn: async (): Promise<ProfileVersionsResponse> => {
			const response = await api.common.profile.versions.$get()

			if (!response.ok) {
				throw new Error("Failed to fetch profile versions")
			}

			return await response.json()
		}
	})
}
