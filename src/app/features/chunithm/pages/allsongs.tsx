import { useEffect, useMemo, useState } from "react"

import { useLocation, useNavigate } from "react-router-dom"

import SongInfoCard from "@/app/features/chunithm/components/song-info-card"
import { songFilters, useChunithmSongs } from "@/app/features/chunithm/hooks"
import useGroupedSongs from "@/app/features/chunithm/hooks/use-grouped-songs"
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
import type { FilterValues } from "@/app/shared/types"
import { chunithmBadgeColors, getDifficultyFromChunithmChart } from "@/app/shared/utils/chunithm"
import { CDN } from "@/app/shared/utils/constants"
import { formatLevel } from "@/app/shared/utils/format-level"

const CHUNITHM_ALLSONGS_VIEW_KEY = "chunithm-allsongs-view"

export default function ChunithmAllSongs() {
	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaults(songFilters))
	const [viewMode, setViewMode] = useState<"list" | "grid">(() => {
		try {
			return localStorage.getItem(CHUNITHM_ALLSONGS_VIEW_KEY) === "list" ? "list" : "grid"
		} catch {
			return "grid"
		}
	})

	const location = useLocation()
	const navigate = useNavigate()

	const { data: songs, isLoading } = useChunithmSongs()

	const filtered = useFiltering(songs || [], songFilters, searchQuery, filterValues)
	const grouped = useGroupedSongs({ songs: filtered })
	const inlineFilters = useMemo(() => songFilters, [])
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
		localStorage.setItem(CHUNITHM_ALLSONGS_VIEW_KEY, viewMode)
	}, [viewMode])

	const handleFilterChange = (identifier: string, value: string) => {
		setFilterValues(prev => ({ ...prev, [identifier]: value }))
		setPage(1)
	}

	const handleClearAll = () => {
		setFilterValues(getDefaults(songFilters))
		setPage(1)
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
						<DensityToggle density={viewMode} onChange={setViewMode} />
					</div>

					<div className="flex justify-center sm:justify-end">
						<InlineFilters
							filters={inlineFilters}
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
													src={`${CDN}/chunithm/jacket/${song.jacketPath}`}
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
													.map(chart => `${getDifficultyFromChunithmChart(chart.chartId ?? 0)} ${formatLevel(chart.level)}`)
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
									levelColorBadge={chunithmBadgeColors}
									jacketArt="chunithm/jacket"
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