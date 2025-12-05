import { useMemo, useState } from "react"

import { useSearchParams } from "react-router-dom"

import { MaimaiDxSongInfoCard } from "@/app/features/maimaidx/components/song-info-card"
import { songFilters, useMaimaiDxSongs, useMaimaiDxVersion } from "@/app/features/maimaidx/hooks"
import Header from "@/app/shared/components/common/header"
import { MultiFilter } from "@/app/shared/components/common/multi-filter"
import { Pagination } from "@/app/shared/components/common/pagination"
import Spinner from "@/app/shared/components/common/spinner"
import { getDefaults, useFiltering } from "@/app/shared/hooks/use-filtering"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import { Body, CardGrid, Container, FilterArea } from "@/app/shared/pages/layout/layout"
import type { DB, FilterValues, Mai2StaticMusic } from "@/app/shared/types"
import { maimaiDxBadgeColors } from "@/app/shared/utils/maimai"

export function MaimaiDxAllSongs() {
	const [searchParams, setSearchParams] = useSearchParams()
	const searchQuery = searchParams.get("search") || ""
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaults(songFilters))

	const version = useMaimaiDxVersion()
	const { data: songs, isLoading } = useMaimaiDxSongs()
	const filtered = useFiltering(songs || [], songFilters, searchQuery, filterValues)

	const grouped = useMemo(() => {
		const map = new Map<number, Mai2StaticMusic>()
		filtered.forEach((s: DB.Mai2StaticMusic) => {
			if (s.difficulty == null || !s.songId || !s.title) return
			if (!map.has(s.songId)) map.set(s.songId, { ...s, charts: [] })
			map.get(s.songId)!.charts.push({ chartId: s.chartId ?? null, difficulty: s.difficulty, level: s.level })
		})
		return Array.from(map.values())
	}, [filtered])

	const { page, setPage, totalPages, paged, hasMore } = usePagination(grouped, 20, [searchQuery, filterValues])

	if (!version) {
		return (
			<Container>
				<Header title="All Songs" />
				<Body>
					<div className="text-muted-foreground py-20 text-center">Set your version in settings first</div>
				</Body>
			</Container>
		)
	}

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

				<CardGrid>
					{paged.map((song, idx) => (
						<MaimaiDxSongInfoCard key={idx} score={song} levelColorBadge={maimaiDxBadgeColors} />
					))}
				</CardGrid>

				{grouped.length === 0 && <div className="text-muted-foreground py-20 text-center">No songs found</div>}

				{hasMore && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
			</Body>
		</Container>
	)
}
