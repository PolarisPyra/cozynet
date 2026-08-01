import { useEffect, useMemo, useState } from "react"

import { useLocation, useNavigate } from "react-router-dom"

import { songFilters, usePopnSongs } from "@/app/features/popn/hooks"
import { DensityToggle } from "@/app/shared/components/common/density-toggle"
import Header from "@/app/shared/components/common/header"
import { InlineFilters } from "@/app/shared/components/common/inline-filters"
import { Pagination } from "@/app/shared/components/common/pagination"
import Spinner from "@/app/shared/components/common/spinner"
import { Badge } from "@/app/shared/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/shared/components/ui/table"
import { STANDARD_PAGE_SIZE } from "@/app/shared/constants/pagination"
import { getDefaults, useFiltering } from "@/app/shared/hooks/use-filtering"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import { Body, CardGrid, Container } from "@/app/shared/pages/layout/layout"
import type { FilterValues, PopnStaticMusic } from "@/app/shared/types"
import { getDifficultyFromPopnChart, popnBadgeColors } from "@/app/shared/utils/popn"

const POPN_ALLSONGS_VIEW_KEY = "popn-allsongs-view"

type GroupedSong = PopnStaticMusic & {
	charts: Array<{ chartId: number | null; difficulty: number | null }>
}

export function PopnAllSongs() {
	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<FilterValues>(() => getDefaults(songFilters))
	const [viewMode, setViewMode] = useState<"list" | "grid">(() => {
		try {
			return localStorage.getItem(POPN_ALLSONGS_VIEW_KEY) === "list" ? "list" : "grid"
		} catch {
			return "grid"
		}
	})
	const location = useLocation()
	const navigate = useNavigate()
	const { data: songs, isLoading } = usePopnSongs()
	const filtered = useFiltering(songs || [], songFilters, searchQuery, filterValues)
	const grouped = useMemo(() => {
		const map = new Map<number, GroupedSong>()
		filtered.forEach(song => {
			if (song.songId == null || !song.title) return
			if (!map.has(song.songId)) map.set(song.songId, { ...song, charts: [] })
			map.get(song.songId)!.charts.push({ chartId: song.chartId, difficulty: song.difficulty })
		})
		return Array.from(map.values())
	}, [filtered])
	const searchItems = useMemo(
		() => grouped.map(song => ({ id: song.songId as number, title: song.title || "" })),
		[grouped]
	)
	const { page, setPage, totalPages, paged } = usePagination(grouped, STANDARD_PAGE_SIZE, [searchQuery, filterValues])

	useEffect(() => {
		if (location.search) navigate(location.pathname, { replace: true })
	}, [location.pathname, location.search, navigate])
	useEffect(() => localStorage.setItem(POPN_ALLSONGS_VIEW_KEY, viewMode), [viewMode])

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
				<div className="mb-4 flex flex-wrap items-center justify-center gap-4 sm:justify-between">
					<InlineFilters
						filters={songFilters}
						filterValues={filterValues}
						onFilterChange={handleFilterChange}
						onClearAll={handleClearAll}
					/>
					<DensityToggle density={viewMode} onChange={setViewMode} />
				</div>
				{grouped.length === 0 ? (
					<div className="text-muted-foreground py-20 text-center">No songs found</div>
				) : viewMode === "list" ? (
					<>
						<div className="bg-card overflow-hidden rounded-lg border">
							<Table className="w-full min-w-[800px]">
								<TableHeader className="[&_tr]:bg-muted/35">
									<TableRow>
										<TableHead>Song</TableHead>
										<TableHead>Artist</TableHead>
										<TableHead>Genre</TableHead>
										<TableHead>Charts</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{paged.map(song => (
										<TableRow key={song.songId}>
											<TableCell className="font-semibold">{song.title}</TableCell>
											<TableCell>{song.artist || "—"}</TableCell>
											<TableCell>{song.genre || "—"}</TableCell>
											<TableCell>
												{song.charts
													.sort((a, b) => (a.chartId ?? 0) - (b.chartId ?? 0))
													.map(chart => `${getDifficultyFromPopnChart(chart.chartId ?? 0)} ${chart.difficulty ?? "—"}`)
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
								<div
									key={song.songId}
									className="bg-card border-border/60 flex h-full min-h-[220px] flex-col rounded-xl border p-4 shadow-sm"
								>
									<h3 className="text-foreground line-clamp-2 text-base font-semibold">{song.title}</h3>
									<div className="text-muted-foreground mt-1 line-clamp-1 text-xs">{song.artist || "Unknown"}</div>
									<div className="text-muted-foreground mt-1 text-xs">{song.genre || "N/A"}</div>
									<div className="mt-auto flex flex-wrap gap-2 pt-4">
										{song.charts
											.sort((a, b) => (a.chartId ?? 0) - (b.chartId ?? 0))
											.map((chart, index) => (
												<Badge
													key={`${chart.chartId}-${index}`}
													variant="outline"
													className={`border-2 ${popnBadgeColors(chart.chartId ?? undefined)}`}
												>
													{getDifficultyFromPopnChart(chart.chartId ?? 0)} {chart.difficulty ?? "—"}
												</Badge>
											))}
									</div>
								</div>
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

export default PopnAllSongs
