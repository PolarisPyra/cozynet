import { useState } from "react"

import { useSearchParams } from "react-router-dom"

import SongInfoCard from "@/components/chunithm/song-info-card"
import Header from "@/components/common/header"
import { MultiFilter } from "@/components/common/multi-filter"
import ResponsiveGrid from "@/components/common/responsive-grid"
import Spinner from "@/components/common/spinner"
import {
	type ChunithmFilterValues,
	getDefaultSongFilterValues,
	useChunithmSongFiltering,
	useSongFilters
} from "@/hooks/chunithm"
import useGroupedSongs from "@/hooks/chunithm/use-grouped-songs"
import { Body, Container, FilterArea } from "@/pages/layout/layout"
import { chunithmBadgeColors } from "@/utils/helpers"

const ChunithmAllSongs = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const searchQuery = searchParams.get("search") || ""
	const [filterValues, setFilterValues] = useState<ChunithmFilterValues>(getDefaultSongFilterValues())

	const songFilters = useSongFilters()
	const { filteredSongs, isLoading } = useChunithmSongFiltering({ searchQuery, filterValues })
	const groupedSongs = useGroupedSongs({ songs: filteredSongs })

	const handleFilterChange = (identifier: string, value: string) => {
		setFilterValues(prev => ({ ...prev, [identifier]: value }))
	}

	const handleClearAll = () => {
		setFilterValues(getDefaultSongFilterValues())
	}

	const searchItems = groupedSongs
		.filter(song => song.songId !== null)
		.map(song => ({
			id: song.songId as number,
			title: song.title || ""
		}))

	if (isLoading) return <LoadingState />

	return (
		<Container>
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
			<Body>
				<FilterArea>
					<div className="flex justify-start">
						<MultiFilter
							filters={songFilters}
							filterValues={filterValues}
							onFilterChange={handleFilterChange}
							onClearAll={handleClearAll}
						/>
					</div>
				</FilterArea>
				<ResponsiveGrid
					items={groupedSongs}
					levelColorBadge={chunithmBadgeColors}
					loading={isLoading}
					jacketArt="chunithm/jacket"
					CardComponent={SongInfoCard}
				/>
			</Body>
		</Container>
	)
}

const LoadingState = () => (
	<div className="relative flex-1 overflow-auto">
		<Header title="All Songs" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<Spinner />
		</div>
	</div>
)

export default ChunithmAllSongs
