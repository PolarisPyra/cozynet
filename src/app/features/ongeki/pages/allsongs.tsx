import { useMemo, useState } from "react"

import { useSearchParams } from "react-router-dom"

import { SongInfoCard } from "@/app/features/ongeki/components/song-info-card"
import { songFilters, useOngekiSongs, useOngekiVersion } from "@/app/features/ongeki/hooks"
import Header from "@/app/shared/components/common/header"
import { MultiFilter } from "@/app/shared/components/common/multi-filter"
import { Pagination } from "@/app/shared/components/common/pagination"
import Spinner from "@/app/shared/components/common/spinner"
import { getDefaults, useFiltering } from "@/app/shared/hooks/use-filtering"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import { Body, Container, FilterArea } from "@/app/shared/pages/layout/layout"
import type { FilterValues, OngekiStaticMusic } from "@/app/shared/types"
import { ongekiBadgeColors } from "@/app/shared/utils/ongeki"

export function OngekiAllSongs() {
	const [searchParams, setSearchParams] = useSearchParams()
	const searchQuery = searchParams.get("search") || ""
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaults(songFilters))

	const version = useOngekiVersion()
	const { data: songs, isLoading } = useOngekiSongs()
	const filtered = useFiltering(songs || [], songFilters, searchQuery, filterValues)

	const grouped = useMemo(() => {
		const map = new Map<number, OngekiStaticMusic>()
		filtered.forEach((s: any) => {
			if (!s.level || !s.songId || !s.title) return
			if (!map.has(s.songId)) map.set(s.songId, { ...s, charts: [] })
			map.get(s.songId)!.charts.push({ chartId: s.chartId ?? null, level: s.level })
		})
		return Array.from(map.values())
	}, [filtered])

	const { page, setPage, totalPages, paged, total, hasMore } = usePagination(grouped, 20, [searchQuery, filterValues])

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

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{paged.map((song, idx) => (
						<SongInfoCard key={idx} score={song} levelColorBadge={ongekiBadgeColors} jacketArt="ongeki/jacket" />
					))}
				</div>

				{grouped.length === 0 && <div className="text-muted-foreground py-20 text-center">No songs found</div>}

				{hasMore && <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />}
			</Body>
		</Container>
	)
}
