import { useMemo } from "react"

import { scoreFilters, usePopnScores } from "@/app/features/popn/hooks"
import { DensityToggle } from "@/app/shared/components/common/density-toggle"
import Header from "@/app/shared/components/common/header"
import { InlineFilters } from "@/app/shared/components/common/inline-filters"
import { Pagination } from "@/app/shared/components/common/pagination"
import Spinner from "@/app/shared/components/common/spinner"
import { Badge } from "@/app/shared/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/shared/components/ui/table"
import { useScorePageState } from "@/app/shared/hooks/use-score-page-state"
import { Body, CardGrid, Container } from "@/app/shared/pages/layout/layout"
import { formatPopnDate, getDifficultyFromPopnChart, popnBadgeColors } from "@/app/shared/utils/popn"

export function PopnScoresPage() {
	const { data: scores, isLoading } = usePopnScores()
	const {
		setSearchQuery,
		filterValues,
		density,
		setDensity,
		page,
		setPage,
		totalPages,
		paged,
		hasActiveFilters,
		showEmptyState,
		handleFilterChange,
		resetFilters
	} = useScorePageState({
		data: scores,
		filters: scoreFilters,
		storageKey: "popn-scores-density",
		defaultDensity: "grid"
	})
	const searchItems = useMemo(() => (scores || []).map(score => ({ id: score.id, title: score.title || "" })), [scores])

	if (isLoading)
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

	return (
		<Container>
			<Header
				title="Scores"
				searchProps={{
					items: searchItems,
					onSelect: setSearchQuery,
					placeholder: "Search scores...",
					emptyMessage: "No scores found.",
					groupLabel: "Scores"
				}}
			/>
			<Body>
				<div className="mb-4 flex flex-wrap items-center justify-center gap-4 sm:justify-between">
					<InlineFilters
						filters={scoreFilters}
						filterValues={filterValues}
						onFilterChange={handleFilterChange}
						onClearAll={resetFilters}
					/>
					<DensityToggle density={density} onChange={setDensity} />
				</div>
				{showEmptyState ? (
					<div className="text-muted-foreground py-20 text-center">
						{hasActiveFilters ? "No scores match your filters" : "No scores found"}
					</div>
				) : density === "list" ? (
					<>
						<div className="bg-card overflow-hidden rounded-lg border">
							<div className="w-full overflow-x-auto">
								<Table className="w-full min-w-[1000px] table-fixed">
									<TableHeader className="[&_tr]:bg-muted/35">
										<TableRow>
											<TableHead>Song</TableHead>
											<TableHead>Difficulty</TableHead>
											<TableHead>Level</TableHead>
										<TableHead>Score</TableHead>
										<TableHead>Combo</TableHead>
										<TableHead>Clear Rank</TableHead>
										<TableHead>Date</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{paged.map(score => (
											<TableRow key={score.id}>
												<TableCell className="font-semibold">
													{score.title || `Song ${score.music_num ?? "—"}`}
												</TableCell>
												<TableCell>{getDifficultyFromPopnChart(score.chartId ?? score.sheet_num ?? 0)}</TableCell>
												<TableCell>{score.difficulty ?? "—"}</TableCell>
												<TableCell className="font-semibold tabular-nums">
													{score.score?.toLocaleString() ?? "—"}
												</TableCell>
														<TableCell>{score.combo ?? "—"}</TableCell>
														<TableCell>{score.clear_rank ?? "—"}</TableCell>
														<TableCell className="text-muted-foreground">{formatPopnDate(score.playdate)}</TableCell>
											</TableRow>
										))}
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
								<div
									key={score.id}
									className="bg-card border-border flex h-full w-full flex-col rounded-lg border p-4 shadow-sm"
								>
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<h3 className="line-clamp-2 text-base font-semibold">
												{score.title || `Song ${score.music_num ?? "—"}`}
											</h3>
											<p className="text-muted-foreground mt-1 text-xs">{score.artist || "Unknown"}</p>
										</div>
										<Badge
											variant="outline"
											className={`border-2 ${popnBadgeColors(score.chartId ?? score.sheet_num ?? undefined)}`}
										>
											{getDifficultyFromPopnChart(score.chartId ?? score.sheet_num ?? 0)}
										</Badge>
									</div>
									<div className="mt-5 grid grid-cols-2 gap-3 text-sm">
										<div>
											<div className="text-muted-foreground text-xs">Score</div>
											<div className="font-semibold tabular-nums">{score.score?.toLocaleString() ?? "—"}</div>
										</div>
										<div>
											<div className="text-muted-foreground text-xs">Level</div>
											<div className="font-semibold">{score.difficulty ?? "—"}</div>
										</div>
													<div>
														<div className="text-muted-foreground text-xs">Combo</div>
														<div className="font-semibold">{score.combo ?? "—"}</div>
													</div>
											</div>
									<div className="text-muted-foreground mt-auto pt-4 text-xs">{formatPopnDate(score.playdate)}</div>
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

export default PopnScoresPage
