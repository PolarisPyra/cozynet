import { useMemo, useState } from "react";

import { useSearchParams } from "react-router-dom";

import Header from "@/components/common/header";
import { MultiFilter } from "@/components/common/multi-filter";
import ResponsiveGrid from "@/components/common/responsive-grid";
import Spinner from "@/components/common/spinner";
import SongInfoCard from "@/components/ongeki/song-info-card";
import {
	type MusicFilterValues,
	getDefaultSongFilterValues,
	useOngekiSongFiltering,
	useSongFilters,
} from "@/hooks/ongeki";
import { Body, Container, FilterArea } from "@/pages/layout/layout";
import { OngekiStaticMusic } from "@/shared/types";
import { ongekiBadgeColors } from "@/utils/helpers";

const OngekiAllSongs = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const searchQuery = searchParams.get("search") || "";
	const [filterValues, setFilterValues] = useState<MusicFilterValues>(getDefaultSongFilterValues());

	const filters = useSongFilters();
	const { filteredSongs, isLoading, version } = useOngekiSongFiltering({
		searchQuery,
		filterValues,
	});

	const handleFilterChange = (identifier: string, value: string) => {
		setFilterValues((prev) => ({
			...prev,
			[identifier]: value,
		}));
	};

	const handleClearAll = () => {
		setFilterValues(getDefaultSongFilterValues());
	};

	const groupedSongs = useMemo(() => {
		const songsMap = new Map<number, OngekiStaticMusic>();

		filteredSongs.forEach((song) => {
			if (!song.level || !song.songId || !song.title) return;

			if (!songsMap.has(song.songId)) {
				songsMap.set(song.songId, {
					...song,
					charts: [],
				});
			}

			songsMap.get(song.songId)!.charts.push({
				chartId: song.chartId ?? null,
				level: song.level,
			});
		});

		return Array.from(songsMap.values());
	}, [filteredSongs]);

	if (isLoading) {
		return (
			<Container>
				<Header title="All Songs" />
				<div className="flex h-[calc(100vh-64px)] items-center justify-center">
					<Spinner />
				</div>
			</Container>
		);
	}

	if (!version) {
		return (
			<Container>
				<Header title="All Songs" />
				<div className="flex h-[calc(100vh-64px)] items-center justify-center">
					<p className="text-primary">Please set your Ongeki version in settings first</p>
				</div>
			</Container>
		);
	}

	const searchItems = groupedSongs
		.filter((song) => song.songId !== null)
		.map((song) => ({
			id: song.songId as number,
			title: song.title || "",
		}));

	return (
		<Container>
			<Header
				title="All Songs"
				searchProps={{
					items: searchItems,
					searchQuery,
					onSearchChange: (value) => setSearchParams({ search: value }),
					placeholder: "Search songs...",
					emptyMessage: "No songs found.",
					groupLabel: "Songs",
				}}
			/>
			<Body>
				<FilterArea>
					<div className="flex justify-start">
						<MultiFilter
							filters={filters}
							filterValues={filterValues}
							onFilterChange={handleFilterChange}
							onClearAll={handleClearAll}
						/>
					</div>
				</FilterArea>
				<ResponsiveGrid
					items={groupedSongs}
					levelColorBadge={ongekiBadgeColors}
					loading={isLoading}
					jacketArt="ongeki/jacket"
					CardComponent={SongInfoCard}
				/>
			</Body>
		</Container>
	);
};

export default OngekiAllSongs;
