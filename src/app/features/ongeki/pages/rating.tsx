import { useEffect, useState } from "react"

import { LayoutGrid, List } from "lucide-react"

import { OngekiRatingDisplay } from "@/app/features/ongeki/components/rating-display"
import { OngekiRatingInfoCard } from "@/app/features/ongeki/components/rating-info-card"
import { ratingFilters, useOngekiRatingData, useOngekiVersion } from "@/app/features/ongeki/hooks"
import Header from "@/app/shared/components/common/header"
import { MultiFilter } from "@/app/shared/components/common/multi-filter"
import Spinner from "@/app/shared/components/common/spinner"
import { Button } from "@/app/shared/components/ui/button"
import { Card, CardContent } from "@/app/shared/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/shared/components/ui/table"
import { getDefaults, useFiltering } from "@/app/shared/hooks/use-filtering"
import { Body, CardGrid, Container, FilterArea } from "@/app/shared/pages/layout/layout"
import type { FilterValues, OngekiRating } from "@/app/shared/types"
import { CDN } from "@/app/shared/utils/constants"
import { formatLevel } from "@/app/shared/utils/format-level"
import {
	calculateOngekiRating,
	getDifficultyFromOngekiChart,
	getOngekiGrade,
	ongekiBadgeColors
} from "@/app/shared/utils/ongeki"

const ONGEKI_RATING_DENSITY_KEY = "ongeki-rating-density"

export function OngekiRatingFrames() {
	const version = useOngekiVersion()
	const filters = ratingFilters(version || 0)

	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaults(filters))
	const [density, setDensity] = useState<"list" | "grid">(() => {
		try {
			const saved = localStorage.getItem(ONGEKI_RATING_DENSITY_KEY)
			if (saved === "grid" || saved === "comfortable") return "grid"
			return "list"
		} catch {
			return "list"
		}
	})

	const activeTab = filterValues.category || "base"
	const { getActiveData, getActiveLoading, playerRatingValue, highestRatingValue, ratingDecimals } = useOngekiRatingData(version || 0, activeTab)

	const data = getActiveData(activeTab)
	const isLoading = getActiveLoading(activeTab)
	const filtered = useFiltering(data || [], filters, searchQuery, filterValues)

	useEffect(() => {
		localStorage.setItem(ONGEKI_RATING_DENSITY_KEY, density)
	}, [density])

	if (!version) {
		return (
			<Container>
				<Header title="Rating" />
				<Body>
					<div className="text-muted-foreground py-20 text-center">Set your version in settings first</div>
				</Body>
			</Container>
		)
	}

	if (isLoading) {
		return (
			<Container>
				<Header title="Rating" />
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
				title="Rating"
				searchProps={{
					items: filtered.map((rating: OngekiRating, index: number) => ({ id: index, title: rating.title || "" })),
					onSelect: setSearchQuery,
					placeholder: "Search...",
					emptyMessage: "No ratings.",
					groupLabel: "Ratings"
				}}
			/>

			<Body>
				<Card className="mb-4 rounded-sm">
					<CardContent className="px-4 py-2">
						<OngekiRatingDisplay
							playerRating={playerRatingValue}
							highestRating={highestRatingValue}
							ratingDecimals={ratingDecimals}
						/>
					</CardContent>
				</Card>

				<FilterArea>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<MultiFilter
							filters={filters}
							filterValues={filterValues}
							onFilterChange={(id, val) => setFilterValues(prev => ({ ...prev, [id]: val }))}
							onClearAll={() => setFilterValues(getDefaults(filters))}
						/>

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
				</FilterArea>

				{filtered.length === 0 ? (
					<div className="text-muted-foreground py-20 text-center">No ratings found</div>
				) : density === "list" ? (
					<div className="bg-card overflow-hidden rounded-lg border">
						<Table className="min-w-[800px] w-full">
							<colgroup>
								<col className="w-16" />
								<col className="w-[34%]" />
								<col className="w-[14%]" />
								<col className="w-[10%]" />
								<col className="w-[16%]" />
								<col className="w-[10%]" />
								<col className="w-[12%]" />
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
								</TableRow>
							</TableHeader>

							<TableBody>
								{filtered.map((rating, index) => {
									const score = rating.techScoreMax ?? null
									const calculatedRating =
										rating.level != null && score != null
											? calculateOngekiRating(rating.level, score) / 100
											: null

									return (
										<TableRow key={`${rating.musicId ?? index}-${rating.chartId ?? 0}`}>
											<TableCell className="h-16">
												<img
													src={`${CDN}/ongeki/jacket/${rating.jacketPath}`}
													alt={rating.title || "Song jacket"}
													width={44}
													height={44}
													className="block size-11 shrink-0 rounded-sm object-cover"
												/>
											</TableCell>

											<TableCell className="h-16 max-w-80 truncate text-sm font-semibold leading-none">
												{rating.title || "Unknown"}
											</TableCell>

											<TableCell className="text-muted-foreground h-16 leading-none">
												{getDifficultyFromOngekiChart(rating.chartId ?? 0)}
											</TableCell>

											<TableCell className="h-16 font-medium leading-none">{formatLevel(rating.level)}</TableCell>

											<TableCell className="h-16 text-right font-semibold leading-none">
												{score == null ? "—" : score.toLocaleString()}
											</TableCell>

											<TableCell className="h-16 font-medium leading-none">
												{score == null ? "—" : getOngekiGrade(score)}
											</TableCell>

											<TableCell className="h-16 text-right font-medium leading-none">
												{calculatedRating == null ? "—" : calculatedRating.toFixed(3)}
											</TableCell>
										</TableRow>
									)
								})}
							</TableBody>
						</Table>
					</div>
				) : (
					<CardGrid className="lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
						{filtered.map((rating: OngekiRating, index: number) => (
							<OngekiRatingInfoCard
								key={index}
								score={rating}
								levelColorBadge={ongekiBadgeColors}
								ongekiVersion={version}
								isRecommend={filterValues.category === "next"}
								activeTab={activeTab}
							/>
						))}
					</CardGrid>
				)}
			</Body>
		</Container>
	)
}