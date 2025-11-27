import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "@/app/shared/hooks/auth/use-auth"
import { useCurrentUser } from "@/app/shared/hooks/users"
import type { ChunithmPlaylog, Mai2Playlog, OngekiPlaylog } from "@/app/shared/types"
import { api } from "@/app/shared/utils"

type Game = "chunithm" | "ongeki" | "maimaidx"

export function useGameVersion(game: Game): number {
	const { versions } = useCurrentUser()
	return versions[`${game}_version`]
}

export function useGameVersions(game: Game) {
	return useQuery({
		queryKey: [game, "versions"],
		queryFn: async () => {
			if (game === "chunithm") {
				const res = await api.chunithm.cozynet.versions.$get()
				if (!res.ok) throw new Error()
				return res.json()
			}
			if (game === "ongeki") {
				const res = await api.ongeki.settings.versions.$get()
				if (!res.ok) throw new Error()
				const data = await res.json()
				return (data as { versions?: number[] }).versions ?? data
			}
			const res = await api.maimaidx.cozynet.versions.$get()
			if (!res.ok) throw new Error()
			return res.json()
		}
	})
}

export function useUpdateGameVersion(game: Game) {
	const { setUser } = useAuth()
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async (version: number) => {
			const res =
				game === "chunithm"
					? await api.chunithm.cozynet.update.$post({ json: { version } })
					: game === "ongeki"
						? await api.ongeki.settings.update.$post({ json: { version } })
						: await api.maimaidx.cozynet.update.$post({ json: { version } })
			if (!res.ok) throw new Error()
			const user = await res.json()
			setUser(user)
			qc.setQueryData(["auth", "verify"], user)
			qc.invalidateQueries({ queryKey: ["auth", "verify"] })
		}
	})
}

export function useGameScores<T = ChunithmPlaylog[] | OngekiPlaylog[] | Mai2Playlog[]>(game: Game) {
	return useQuery<T>({
		queryKey: [game, "scores"],
		queryFn: async () => {
			const res =
				game === "chunithm"
					? await api.chunithm.profile.playlog.$get()
					: game === "ongeki"
						? await api.ongeki.profile.playlog.$get()
						: await api.maimaidx.profile.playlog.$get()
			if (!res.ok) throw new Error()
			return res.json() as T
		}
	})
}

export function useGameSongs(game: Game) {
	return useQuery({
		queryKey: [game, "songs"],
		queryFn: async () => {
			if (game === "chunithm") {
				const res = await api.chunithm.static.chuni_static_music.$get()
				if (!res.ok) throw new Error()
				return res.json()
			}
			if (game === "ongeki") {
				const res = await api.ongeki.static.music.$get()
				if (!res.ok) throw new Error()
				return res.json()
			}
			const res = await api.maimaidx.static.music.$get()
			if (!res.ok) throw new Error()
			return res.json()
		}
	})
}

