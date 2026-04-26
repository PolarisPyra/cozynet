import { useEffect, useMemo, useState } from "react"

import { LayoutGrid, List, Upload } from "lucide-react"
import { toast } from "sonner"

import { OngekiKamaiImportDialog } from "@/app/features/ongeki/components/kamai-import-dialog"
import { OngekiScoreInfoCard } from "@/app/features/ongeki/components/score-info-card"
import { OngekiRatingColors } from "@/app/features/ongeki/components/rating-colors"
import { scoreFilters, useOngekiScoreExporter, useOngekiScores, useOngekiVersion } from "@/app/features/ongeki/hooks"
import Header from "@/app/shared/components/common/header"
import { InlineFilters } from "@/app/shared/components/common/inline-filters"
import { Pagination } from "@/app/shared/components/common/pagination"
import Spinner from "@/app/shared/components/common/spinner"
import { Button } from "@/app/shared/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/shared/components/ui/table"
import { STANDARD_PAGE_SIZE } from "@/app/shared/constants/pagination"
import { getDefaults, useFiltering } from "@/app/shared/hooks/use-filtering"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import { Body, CardGrid, Container } from "@/app/shared/pages/layout/layout"
import type { FilterValues } from "@/app/shared/types"
import { CDN } from "@/app/shared/utils/constants"
import { formatLevel } from "@/app/shared/utils/format-level"
import {
	formatOngekiScorePlaylogDate,
	getDifficultyFromOngekiChart,
	getOngekiGrade,
	ongekiBadgeColors
} from "@/app/shared/utils/ongeki"

const PlatinumStars = ({ count }: { count: number }) => {
	const safeCount = Math.max(0, Math.min(5, count || 0))
	const starUrl = (filled: boolean) => `${CDN}/ongeki/badges/${filled ? "filled" : "base"}/pstar.webp`

	return (
		<div className="flex items-center justify-center gap-0.5">
			{Array.from({ length: 5 }, (_, i) => {
				const filled = i < safeCount

				return (
					<img
						key={i}
						aria-hidden
						className="inline-block h-3 w-3 object-contain"
						src={starUrl(filled)}
						alt={filled ? "Filled Star" : "Empty Star"}
					/>
				)
			})}
		</div>
	)
}

const normalizePlayerRating = (rating: number | null | undefined) => {
	if (rating == null) return null

	const numeric = Number(rating)
	if (!Number.isFinite(numeric)) return null

	return numeric > 100 ? numeric / 1000 : numeric
}

const ONGEKI_SCORES_DENSITY_KEY = "ongeki-scores-density"

export function OngekiScorePage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaults(scoreFilters))
	const [isExporting, setIsExporting] = useState(false)
	const [density, setDensity] = useState<"list" | "grid">(() => {
		try {
			const saved = localStorage.getItem(ONGEKI_SCORES_DENSITY_KEY)
			if (saved === "grid" || saved === "comfortable") return "grid"
			return "list"
		} catch {
			return "list"
		}
	})

	useEffect(() => {
		try {
			localStorage.setItem(ONGEKI_SCORES_DENSITY_KEY, density)
		} catch {
			// Ignore storage failures.
		}
	}, [density])

	const version = useOngekiVersion()
	const { data: scores, isLoading } = useOngekiScores()
	const { refetch: fetchExport } = useOngekiScoreExporter()

	const defaults = getDefaults(scoreFilters)
	const filtered = useFiltering(scores || [], scoreFilters, searchQuery, filterValues)
	const { page, setPage, totalPages, paged } = usePagination(filtered, STANDARD_PAGE_SIZE, [searchQuery, filterValues])

	const searchItems = useMemo(
		() => (scores || []).map(score => ({ id: score.id, title: score.title || "" })),
		[scores]
	)

	const handleExport = async () => {
		setIsExporting(true)

		try {
			const result = await fetchExport()

			if (!result.data) {
				toast.error("No data to export")
				return
			}

			const blob = new Blob([JSON.stringify(result.data, null, 2)], {
				type: "application/json"
			})

			const url = URL.createObjectURL(blob)
			const a = document.createElement("a")

			a.href = url
			a.download = `ongeki_kamai_export_${new Date().toISOString().split("T")[0]}.json`

			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)

			URL.revokeObjectURL(url)

			toast.success("Scores exported successfully")
		} catch (error) {
			console.error("Export error:", error)
			toast.error("Failed to export scores")
		} finally {
			setIsExporting(false)
		}
	}

	if (!version) {
		return (
			<Container>
				<Header title="Scores" />
				<Body>
					<div className="text-muted-foreground py-20 text-center">Set your version in settings first</div>
				</Body>
			</Container>
		)
	}

	if (isLoading) {
		return (
			<Container>
				<Header title="Scores" />
				<Body>
					<div className="flex h-96 items-center justify-center">
						<Spinner />
					</div>
				</Body>
			</Container>
		)
	}

	const showEmptyState = filtered.length === 0
	const hasActiveFilters = Boolean(searchQuery) || Object.values(filterValues).some((value, index) => value !== defaults[index])

	return (
		<Container>
			<Header
				title="Scores"
				actions={
					<InlineFilters
						filters={scoreFilters}
						filterValues={filterValues}
						onFilterChange={(id, val) => {
							setFilterValues(prev => ({ ...prev, [id]: val }))
							setPage(1)
						}}
						onClearAll={() => {
							setFilterValues(defaults)
							setPage(1)
						}}
					/>
				}
				searchProps={{
					items: searchItems,
					onSelect: setSearchQuery,
					placeholder: "Search scores...",
					emptyMessage: "No scores found.",
					groupLabel: "Scores"
				}}
			/>

			<Body>
				<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
					<div className="flex flex-wrap gap-2">
						<Button onClick={handleExport} variant="outline" size="sm" disabled={isExporting}>
							<Upload className="h-4 w-4" />
							{isExporting ? "Exporting..." : "Export to Kamai"}
						</Button>

						<OngekiKamaiImportDialog existingScores={scores || []} />
					</div>

					<div className="ml-auto flex items-center gap-2">
						<Button
							variant={density === "grid" ? "secondary" : "outline"}
							size="sm"
							onClick={() => setDensity("grid")}
							className="h-8 text-xs"
						>
							<LayoutGrid className="h-3.5 w-3.5" />
							Grid
						</Button>

						<Button
							variant={density === "list" ? "secondary" : "outline"}
							size="sm"
							onClick={() => setDensity("list")}
							className="h-8 text-xs"
						>
							<List className="h-3.5 w-3.5" />
							List
						</Button>
					</div>
				</div>

				{showEmptyState ? (
					<div className="text-muted-foreground py-20 text-center">
						{hasActiveFilters ? "No scores match your filters" : "No scores found"}
					</div>
				) : density === "list" ? (
					<>
						<div className="bg-card overflow-hidden rounded-lg border">
							<div className="w-full overflow-x-auto">
								<Table className="w-full min-w-[1200px] table-fixed">
									<colgroup>
										<col className="w-[64px]" />
										<col className="w-[30%]" />
										<col className="w-[12%]" />
										<col className="w-[8%]" />
										<col className="w-[12%]" />
										<col className="w-[8%]" />
										<col className="w-[10%]" />
										<col className="w-[8%]" />
										<col className="w-[12%]" />
									</colgroup>

									<TableHeader className="[&_tr]:bg-muted/35">
										<TableRow>
											<TableHead className="px-3">Jacket</TableHead>
											<TableHead className="px-3">Song</TableHead>
											<TableHead className="px-3">Difficulty</TableHead>
											<TableHead className="px-3">Level</TableHead>
											<TableHead className="px-3 text-right">Score</TableHead>
											<TableHead className="px-3 text-center">Grade</TableHead>
											<TableHead className="px-3 text-center">Stars</TableHead>
											<TableHead className="px-3 text-right">Rating</TableHead>
											<TableHead className="px-3 text-right">Date</TableHead>
										</TableRow>
									</TableHeader>

									<TableBody>
										{paged.map(score => {
											const dateParts = formatOngekiScorePlaylogDate(score.userPlayDate)
											const playerRating = normalizePlayerRating(score.playerRating)

											return (
												<TableRow key={score.id} className="h-16">
													<TableCell className="px-3 py-2 align-middle">
														<img
															src={`${CDN}/ongeki/jacket/${score.jacketPath}`}
															alt={score.title || "Song jacket"}
															width={44}
															height={44}
															className="block size-11 shrink-0 rounded-sm object-cover"
														/>
													</TableCell>

													<TableCell className="px-3 py-2 align-middle">
														<div className="min-w-0">
															<div className="truncate text-sm font-semibold leading-tight">
																{score.title || "Unknown"}
															</div>
															{score.artist ? (
																<div className="text-muted-foreground mt-1 truncate text-xs leading-tight">
																	{score.artist}
																</div>
															) : null}
														</div>
													</TableCell>

													<TableCell className="text-muted-foreground px-3 py-2 align-middle text-sm">
														{getDifficultyFromOngekiChart(score.chartId ?? 0)}
													</TableCell>

													<TableCell className="px-3 py-2 align-middle font-medium tabular-nums">
														{formatLevel(score.level)}
													</TableCell>

													<TableCell className="px-3 py-2 text-right align-middle font-semibold tabular-nums">
														{(score.techScore ?? 0).toLocaleString()}
													</TableCell>

													<TableCell className="px-3 py-2 text-center align-middle font-medium">
														{getOngekiGrade(score.techScore ?? 0)}
													</TableCell>

													<TableCell className="px-3 py-2 text-center align-middle">
														<PlatinumStars count={score.platinumScoreStar ?? 0} />
													</TableCell>

													<TableCell className="px-3 py-2 text-right align-middle font-medium tabular-nums">
														{playerRating == null ? (
															"—"
														) : (
															<OngekiRatingColors
																rating={playerRating}
																version={version}
																decimals={3}
															/>
														)}
													</TableCell>

													<TableCell className="text-muted-foreground px-3 py-2 text-right align-middle text-sm tabular-nums">
														{dateParts.date === "—" ? "—" : `${dateParts.date} ${dateParts.time}`}
													</TableCell>
												</TableRow>
											)
										})}
									</TableBody>
								</Table>
							</div>
						</div>

						{totalPages > 1 && (
							<div className="mt-4">
								<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
							</div>
						)}
					</>
				) : (
					<>
						<CardGrid className="lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
							{paged.map(score => (
								<OngekiScoreInfoCard
									key={score.id}
									score={score}
									levelColorBadge={ongekiBadgeColors}
									ongekiVersion={version}
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