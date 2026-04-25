import { useEffect, useMemo, useState } from "react"

import { LayoutGrid, List, Upload } from "lucide-react"
import { toast } from "sonner"

import { ChunithmKamaiImportDialog } from "@/app/features/chunithm/components/kamai-import-dialog"
import ChunithmScoreInfoCard from "@/app/features/chunithm/components/score-info-card"
import { scoreFilters, useChunithmScores, useScoreExporter } from "@/app/features/chunithm/hooks"
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
import { chunithmBadgeColors, formatSqlDateToLocalParts, getChunithmGrade, getDifficultyFromChunithmChart } from "@/app/shared/utils/chunithm"
import { CDN } from "@/app/shared/utils/constants"
import { formatLevel } from "@/app/shared/utils/format-level"

const SCORES_DENSITY_KEY = "scores-density"

export default function ChunithmScorePage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaults(scoreFilters))
	const [isExporting, setIsExporting] = useState(false)
	const [density, setDensity] = useState<"list" | "grid">(() => {
		try {
			const saved = localStorage.getItem(SCORES_DENSITY_KEY)
			if (saved === "grid" || saved === "comfortable") return "grid"
			return "list"
		} catch {
			return "list"
		}
	})

	useEffect(() => {
		localStorage.setItem(SCORES_DENSITY_KEY, density)
	}, [density])

	const { data: scores, isLoading } = useChunithmScores()
	const { refetch: fetchExport } = useScoreExporter()

	const defaults = getDefaults(scoreFilters)
	const filtered = useFiltering(scores || [], scoreFilters, searchQuery, filterValues)
	const { page, setPage, totalPages, paged } = usePagination(filtered, STANDARD_PAGE_SIZE, [searchQuery, filterValues])

	const searchItems = useMemo(() => (scores || []).map(score => ({ id: score.id, title: score.title || "" })), [scores])

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
			a.download = `chunithm_kamai_export_${new Date().toISOString().split("T")[0]}.json`

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
					groupLabel: "Scores",
					recentStorageKey: "recent:chunithm:scores"
				}}
			/>

			<Body>
				<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
					<div className="flex flex-wrap gap-2">
						<Button onClick={handleExport} variant="outline" size="sm" disabled={isExporting}>
							<Upload className="h-4 w-4" />
							{isExporting ? "Exporting..." : "Export to Kamai"}
						</Button>

						<ChunithmKamaiImportDialog existingScores={scores || []} />
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
							<Table className="min-w-full">
								<colgroup>
									<col className="w-16" />
									<col className="w-[26%]" />
									<col className="w-[12%]" />
									<col className="w-[8%]" />
									<col className="w-[14%]" />
									<col className="w-[8%]" />
									<col className="w-[10%]" />
									<col className="w-[18%]" />
								</colgroup>

								<TableHeader className="[&_tr]:bg-muted/35">
									<TableRow>
										<TableHead>Jacket</TableHead>
										<TableHead>Song</TableHead>
										<TableHead>Difficulty</TableHead>
										<TableHead>Level</TableHead>
										<TableHead className="text-right">Score</TableHead>
										<TableHead>Grade</TableHead>
										<TableHead className="text-right">Rating</TableHead>
										<TableHead>Date</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody>
									{paged.map(score => {
										const dateParts = formatSqlDateToLocalParts(score.userPlayDate)
										const rating = score.playerRating == null ? "—" : (score.playerRating / 100).toFixed(2)

										return (
											<TableRow key={score.id}>
												<TableCell className="h-16">
													<img
														src={`${CDN}/chunithm/jacket/${score.jacketPath}`}
														alt={score.title || "Song jacket"}
														width={44}
														height={44}
														className="block size-11 shrink-0 rounded-sm object-cover"
													/>
												</TableCell>

												<TableCell className="h-16 max-w-80 truncate text-sm font-semibold leading-none">
													{score.title || "Unknown"}
												</TableCell>

												<TableCell className="text-muted-foreground h-16 leading-none">
													{getDifficultyFromChunithmChart(score.chartId ?? 0)}
												</TableCell>

												<TableCell className="h-16 font-medium leading-none">{formatLevel(score.level)}</TableCell>

												<TableCell className="h-16 text-right font-semibold leading-none">
													{(score.score ?? 0).toLocaleString()}
												</TableCell>

												<TableCell className="h-16 font-medium leading-none">{getChunithmGrade(score.score ?? 0)}</TableCell>

												<TableCell className="h-16 text-right font-medium leading-none">{rating}</TableCell>

												<TableCell className="text-muted-foreground h-16 leading-none">
													{dateParts.date === "—" ? "—" : `${dateParts.date} ${dateParts.time}`}
												</TableCell>
											</TableRow>
										)
									})}
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
						<CardGrid className="lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
							{paged.map(score => (
								<ChunithmScoreInfoCard key={score.id} score={score} levelColorBadge={chunithmBadgeColors} />
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