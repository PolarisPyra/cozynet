import { useMemo } from "react";

import { useChunithmSongs, useChunithmVersion } from "@/hooks/chunithm";
import type { FilterValues } from "@/shared/types";

import { songFilters } from "../definitions/song-filters";
import type { UseChunithmFilteringParams } from "../types/music-types";

export const useChunithmSongFiltering = ({ searchQuery, filterValues }: UseChunithmFilteringParams) => {
	const { data: songs = [], isLoading } = useChunithmSongs();
	const version = useChunithmVersion();

	const filteredSongs = useMemo(() => {
		if (!songs) return [];

		const normalizedQuery = searchQuery.trim().toLowerCase();

		return songs.filter((song) => {
			// Apply search query filter
			if (normalizedQuery && song.title && !song.title.toLowerCase().includes(normalizedQuery)) {
				return false;
			}

			// Apply all active filters
			return songFilters.every((filter) => {
				const value = filterValues?.[filter.identifier];

				// Handle required filters with default values
				if (filter.isRequired && value === undefined) {
					const firstOptionValue = filter.options?.[0]?.value;
					return filter.predicate(song, firstOptionValue);
				}

				// Skip filters that are not set (undefined values)
				if (value === undefined) {
					return true;
				}

				return filter.predicate(song, value);
			});
		});
	}, [songs, searchQuery, filterValues]);

	return {
		filteredSongs,
		isLoading,
		version,
	};
};

export const useSongFilters = () => {
	return songFilters;
};

export const getDefaultSongFilterValues = (): FilterValues => {
	const defaultValues: FilterValues = {};

	songFilters.forEach((filter) => {
		if (filter.isRequired && filter.options.length > 0) {
			defaultValues[filter.identifier] = filter.options[0].value;
		}
	});

	return defaultValues;
};
