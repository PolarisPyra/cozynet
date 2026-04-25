import { useState } from "react"

import { useSearchParams } from "react-router-dom"

import SongInfoCard from "@/app/features/chunithm/components/song-info-card"
import { songFilters, useChunithmSongs } from "@/app/features/chunithm/hooks"
import useGroupedSongs from "@/app/features/chunithm/hooks/use-grouped-songs"
import Header from "@/app/shared/components/common/header"
import { MultiFilter } from "@/app/shared/components/common/multi-filter"
import { Pagination } from "@/app/shared/components/common/pagination"
import Spinner from "@/app/shared/components/common/spinner"
import { getDefaults, useFiltering } from "@/app/shared/hooks/use-filtering"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import { Body, CardGrid, Container, FilterArea } from "@/app/shared/pages/layout/layout"
import type { FilterValues } from "@/app/shared/types"
import { chunithmBadgeColors } from "@/app/shared/utils/chunithm"

export default function ChunithmAllSongs() {
	const [searchParams, setSearchParams] = useSearchParams()
	const searchQuery = searchParams.get("search") || ""
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaults(songFilters))

	const { data: songs, isLoading } = useChunithmSongs()
	const filtered = useFiltering(songs || [], songFilters, searchQuery, filterValues)
	const grouped = useGroupedSongs({ songs: filtered })

	const { page, setPage, totalPages, paged, hasMore } = usePagination(grouped, 20, [searchQuery, filterValues])

	if (isLoading) {
		return (
			<Container>
				<Header title="All Songs" />
				<Body>
					<div className="flex h-96 items-center justify-center">
						<Spinner />
					</div>
				</Body>
			</Container>
		)
	}

	return (
		<Container>
			<Header
				title="All Songs"
				searchProps={{
					items: grouped.filter(s => s.songId).map(s => ({ id: s.songId as number, title: s.title || "" })),
					onSelect: val => setSearchParams({ search: val }),
					placeholder: "Search...",
					emptyMessage: "No songs.",
					groupLabel: "Songs"
				}}
			/>
			<Body>
				<FilterArea>
					<MultiFilter
						filters={songFilters}
						filterValues={filterValues}
						onFilterChange={(id, val) => setFilterValues(p => ({ ...p, [id]: val }))}
						onClearAll={() => setFilterValues(getDefaults(songFilters))}
					/>
				</FilterArea>

				<CardGrid className="auto-rows-fr">
					{paged.map((song, idx) => (
						<SongInfoCard key={idx} score={song} levelColorBadge={chunithmBadgeColors} jacketArt="chunithm/jacket" />
					))}
				</CardGrid>

				{grouped.length === 0 && <div className="text-muted-foreground py-20 text-center">No songs found</div>}

				{hasMore && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
			</Body>
		</Container>
	)
}
