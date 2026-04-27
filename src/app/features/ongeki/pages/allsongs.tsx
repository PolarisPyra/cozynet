import { useEffect, useMemo, useState } from "react"

import { useLocation, useNavigate } from "react-router-dom"

import { SongInfoCard } from "@/app/features/ongeki/components/song-info-card"
import { songFilters, useOngekiSongs, useOngekiVersion } from "@/app/features/ongeki/hooks"
import { DensityToggle } from "@/app/shared/components/common/density-toggle"
import Header from "@/app/shared/components/common/header"
import { InlineFilters } from "@/app/shared/components/common/inline-filters"
import { Pagination } from "@/app/shared/components/common/pagination"
import Spinner from "@/app/shared/components/common/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/shared/components/ui/table"
import { STANDARD_PAGE_SIZE } from "@/app/shared/constants/pagination"
import { getDefaults, useFiltering } from "@/app/shared/hooks/use-filtering"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import { Body, CardGrid, Container } from "@/app/shared/pages/layout/layout"
import type { DB, FilterValues, OngekiStaticMusic } from "@/app/shared/types"
import { CDN } from "@/app/shared/utils/constants"
import { formatLevel } from "@/app/shared/utils/format-level"
import { getDifficultyFromOngekiChart, ongekiBadgeColors } from "@/app/shared/utils/ongeki"

const ONGEKI_ALLSONGS_VIEW_KEY = "ongeki-allsongs-view"

export function OngekiAllSongs() {
	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaults(songFilters))
	const [viewMode, setViewMode] = useState<"list" | "grid">(() => {
		try {
			return localStorage.getItem(ONGEKI_ALLSONGS_VIEW_KEY) === "list" ? "list" : "grid"
		} catch {
			return "grid"
		}
	})

	const location = useLocation()
	const navigate = useNavigate()

	const version = useOngekiVersion()
	const { data: songs, isLoading } = useOngekiSongs()
	const filtered = useFiltering(songs || [], songFilters, searchQuery, filterValues)

	const grouped = useMemo(() => {
		const map = new Map<number, OngekiStaticMusic>()

		filtered.forEach((song: DB.OngekiStaticMusic) => {
			if (!song.level || !song.songId || !song.title) return

			if (!map.has(song.songId)) {
				map.set(song.songId, { ...song, charts: [] })
			}

			map.get(song.songId)!.charts.push({
				chartId: song.chartId ?? null,
				level: song.level
			})
		})

		return Array.from(map.values())
	}, [filtered])

	const searchItems = useMemo(
		() => grouped.filter(song => song.songId).map(song => ({ id: song.songId as number, title: song.title || "" })),
		[grouped]
	)

	const { page, setPage, totalPages, paged } = usePagination(grouped, STANDARD_PAGE_SIZE, [searchQuery, filterValues])

	useEffect(() => {
		if (location.search) {
			navigate(location.pathname, { replace: true })
		}
	}, [location.pathname, location.search, navigate])

	useEffect(() => {
		localStorage.setItem(ONGEKI_ALLSONGS_VIEW_KEY, viewMode)
	}, [viewMode])

	const handleFilterChange = (identifier: string, value: string) => {
		setFilterValues(prev => ({ ...prev, [identifier]: value }))
		setPage(1)
	}

	const handleClearAll = () => {
		setFilterValues(getDefaults(songFilters))
		setPage(1)
	}

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
					items: searchItems,
					onSelect: setSearchQuery,
					placeholder: "Search...",
					emptyMessage: "No songs.",
					groupLabel: "Songs"
				}}
			/>

			<Body>
				<div className="mb-4 flex flex-col gap-4">
					<div className="flex flex-wrap items-center justify-center gap-4 sm:justify-between">
						<div className="flex items-center gap-2">
							{/* Placeholder for potential future buttons */}
						</div>
					</div>

					<div className="flex flex-wrap items-center justify-center gap-4 sm:justify-between">
						<DensityToggle density={viewMode} onChange={setViewMode} />
						<InlineFilters
							filters={songFilters}
							filterValues={filterValues}
							onFilterChange={handleFilterChange}
							onClearAll={handleClearAll}
							labelOverrides={{ chartType: "Difficulty" }}
						/>
					</div>
				</div>

				{grouped.length === 0 ? (
					<div className="text-muted-foreground py-20 text-center">No songs found</div>
				) : viewMode === "list" ? (
					<>
						<div className="bg-card overflow-hidden rounded-lg border">
							<Table className="min-w-[800px] w-full">
								<colgroup>
									<col className="w-16" />
									<col className="w-[30%]" />
									<col className="w-[18%]" />
									<col className="w-[48%]" />
								</colgroup>

								<TableHeader className="[&_tr]:bg-muted/35">
									<TableRow>
										<TableHead>Jacket</TableHead>
										<TableHead>Song</TableHead>
										<TableHead>Genre</TableHead>
										<TableHead>Charts</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody>
									{paged.map(song => (
										<TableRow key={song.songId}>
											<TableCell className="h-16">
												<img
													src={`${CDN}/ongeki/jacket/${song.jacketPath}`}
													alt={song.title || "Song jacket"}
													width={44}
													height={44}
													className="block size-11 shrink-0 rounded-sm object-cover"
												/>
											</TableCell>

											<TableCell className="h-16 max-w-80 truncate text-sm font-semibold leading-none">
												{song.title || "Unknown"}
											</TableCell>

											<TableCell className="text-muted-foreground h-16 leading-none">
												{song.genre || "—"}
											</TableCell>

											<TableCell className="text-muted-foreground h-16 max-w-120 truncate leading-none">
												{(song.charts || [])
													.sort((a, b) => (a.chartId ?? 0) - (b.chartId ?? 0))
													.map(chart => `${getDifficultyFromOngekiChart(chart.chartId ?? 0)} ${formatLevel(chart.level)}`)
													.join(" / ")}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						{totalPages > 1 && (
							<div className="mt-4">
								<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
							</div>
						)}
					</>
				) : (
					<>
						<CardGrid className="auto-rows-fr">
							{paged.map(song => (
								<SongInfoCard
									key={song.songId}
									score={song}
									levelColorBadge={ongekiBadgeColors}
									jacketArt="ongeki/jacket"
								/>
							))}
						</CardGrid>

						{totalPages > 1 && (
							<div className="mt-4">
								<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
							</div>
						)}
					</>
				)}
			</Body>
		</Container>
	)
}