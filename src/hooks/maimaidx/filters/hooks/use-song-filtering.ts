import { useMemo } from "react";

import { useMaimaiDxSongs } from "@/hooks/maimaidx";
import type { Mai2StaticMusic } from "@/shared/types";

import { songFilters } from "../definitions/song-filters";
import type { UseSongFilteringParams } from "../types/music-types";

/**
 * Hook for filtering MaimaiDX songs with search and multiple filters
 */
export const useMaimaiDxSongFiltering = ({ searchQuery, filterValues }: UseSongFilteringParams) => {
	const { data: songs = [], isLoading } = useMaimaiDxSongs();

	const filteredSongs = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();

		return songs.filter((song: Mai2StaticMusic) => {
			// Apply search filter
			if (normalizedQuery) {
				const matchesSearch =
					song.title?.toLowerCase().includes(normalizedQuery) || song.artist?.toLowerCase().includes(normalizedQuery);
				if (!matchesSearch) return false;
			}

			// Apply all active filters
			return songFilters.every((filter) => {
				const filterValue = filterValues[filter.identifier];
				if (!filterValue || filterValue === "all") return true;
				return filter.predicate(song, filterValue);
			});
		});
	}, [songs, searchQuery, filterValues]);

	return {
		filteredSongs,
		isLoading,
	};
};
