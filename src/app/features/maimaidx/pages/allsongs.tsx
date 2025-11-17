import { useMemo, useState } from "react"

import { useSearchParams } from "react-router-dom"

import Header from "@/app/shared/components/common/header"
import { MultiFilter } from "@/app/shared/components/common/multi-filter"
import ResponsiveGrid from "@/app/shared/components/common/responsive-grid"
import Spinner from "@/app/shared/components/common/spinner"
import { MaimaiDxSongInfoCard } from "@/app/features/maimaidx/components/song-info-card"
import {
	getDefaultSongFilterValues,
	useMaimaiDxSongFiltering,
	useMaimaiDxVersion,
	useSongFilters
} from "@/app/features/maimaidx/hooks"
import { Mai2StaticMusic } from "@/app/shared/types"
import type { FilterValues } from "@/app/shared/types"
import { maimaiDxBadgeColors } from "@/app/shared/utils/maimai"

export function MaimaiDxAllSongs() {
	const [searchParams, setSearchParams] = useSearchParams()
	const searchQuery = searchParams.get("search") || ""
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaultSongFilterValues())

	const version = useMaimaiDxVersion()
	const songFilters = useSongFilters()
	const { filteredSongs, isLoading } = useMaimaiDxSongFiltering({
		searchQuery,
		filterValues
	})

	const handleFilterChange = (identifier: string, value: string) => {
		setFilterValues(prev => ({
			...prev,
			[identifier]: value
		}))
	}

	const handleClearAll = () => {
		setFilterValues(getDefaultSongFilterValues())
	}

	const groupedSongs = useMemo(() => {
		const songsMap = new Map<number, Mai2StaticMusic>()

		filteredSongs.forEach(song => {
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
	}, [filteredSongs])

	const searchItems = groupedSongs
		.filter(song => song.songId !== null)
		.map(song => ({
			id: song.songId as number,
			title: song.title || ""
		}))

	if (isLoading) return <LoadingState />
	if (!version) return <NoVersionState />

	return (
		<div className="relative flex-1 overflow-auto">
			<Header
				title="All Songs"
				searchProps={{
					items: searchItems,
					searchQuery,
					onSearchChange: value => setSearchParams({ search: value }),
					placeholder: "Search songs...",
					emptyMessage: "No songs found.",
					groupLabel: "Songs"
				}}
			/>
			<div className="mb-4 px-4 pb-4 sm:py-0">
				<div className="border-border bg-background/95 flex-shrink-0 rounded-sm backdrop-blur-sm">
					<div className="py-3">
						<div className="flex justify-start">
							<MultiFilter
								filters={songFilters}
								filterValues={filterValues}
								onFilterChange={handleFilterChange}
								onClearAll={handleClearAll}
							/>
						</div>
					</div>
				</div>
				<ResponsiveGrid
					items={groupedSongs}
					levelColorBadge={maimaiDxBadgeColors}
					loading={isLoading}
					jacketArt="maimaidx/jacket"
					CardComponent={MaimaiDxSongInfoCard}
				/>
			</div>
		</div>
	)
}

function LoadingState() {
	return (
		<div className="relative flex-1 overflow-auto">
			<Header title="All Songs" />
			<div className="flex h-[calc(100vh-64px)] items-center justify-center">
				<Spinner />
			</div>
		</div>
	)
}

function NoVersionState() {
	return (
		<div className="relative flex-1 overflow-auto">
			<Header title="All Songs" />
			<div className="flex h-[calc(100vh-64px)] items-center justify-center">
				<p className="text-primary">Please set your Maimai DX version in settings first</p>
			</div>
		</div>
	)
}
