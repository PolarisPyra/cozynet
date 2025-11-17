import { useMemo } from "react"

import { useMaimaiDxSongs } from "@/app/features/maimaidx/hooks"
import { Mai2StaticMusic } from "@/app/shared/types"

const useMaimaiDxGroupedSongs = () => {
	const { data: songs = [], isLoading } = useMaimaiDxSongs()

	const groupedSongs = useMemo(() => {
		const songsMap = new Map<number, Mai2StaticMusic>()

		songs.forEach(song => {
			if (song.difficulty == null || !song.songId || !song.title) return

			if (!songsMap.has(song.songId)) {
				songsMap.set(song.songId, {
					...song,
					charts: []
				})
			}

			songsMap.get(song.songId)!.charts.push({
				chartId: song.chartId ?? null,
				difficulty: song.difficulty,
				level: song.level
			})
		})

		return Array.from(songsMap.values())
	}, [songs])

	return {
		groupedSongs,
		isLoading
	}
}

export default useMaimaiDxGroupedSongs
