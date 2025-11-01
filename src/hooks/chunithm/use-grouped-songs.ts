import { useMemo } from "react"

import { ChunithmStaticMusic } from "@/shared/types"
import { DB } from "@/shared/types"

interface UseGroupedSongsParams {
	songs: DB.ChuniStaticMusic[]
}

const useGroupedSongs = ({ songs }: UseGroupedSongsParams): ChunithmStaticMusic[] => {
	return useMemo(() => {
		const songsMap = new Map<number, ChunithmStaticMusic>()

		songs.forEach(song => {
			if (!song.level || !song.songId || !song.title) return

			if (!songsMap.has(song.songId)) {
				songsMap.set(song.songId, {
					id: song.id,
					version: song.version,
					songId: song.songId,
					chartId: song.chartId,
					title: song.title,
					artist: song.artist,
					level: song.level,
					genre: song.genre,
					jacketPath: song.jacketPath,
					worldsEndTag: song.worldsEndTag,
					opt: song.opt,
					charts: []
				})
			}

			songsMap.get(song.songId)!.charts.push({
				chartId: song.chartId ?? null,
				level: song.level
			})
		})

		return Array.from(songsMap.values())
	}, [songs])
}

export default useGroupedSongs
