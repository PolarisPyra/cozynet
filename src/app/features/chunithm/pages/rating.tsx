import { useEffect, useMemo, useState } from "react"


import ChunithmRatingInfoCard from "@/app/features/chunithm/components/rating-info-card"
import { ratingFilters, useChunithmRatingData, useChunithmVersion } from "@/app/features/chunithm/hooks"
import { DensityToggle } from "@/app/shared/components/common/density-toggle"
import Header from "@/app/shared/components/common/header"
import { InlineFilters } from "@/app/shared/components/common/inline-filters"
import Spinner from "@/app/shared/components/common/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/shared/components/ui/table"
import { getDefaults, useFiltering } from "@/app/shared/hooks/use-filtering"
import { Body, CardGrid, Container } from "@/app/shared/pages/layout/layout"
import type { ChunithmRating, FilterValues } from "@/app/shared/types"
import { chunithmBadgeColors, calculateChunithmRating, getChunithmGrade, getDifficultyFromChunithmChart } from "@/app/shared/utils/chunithm"
import { ChunithmRatingColors } from "@/app/features/chunithm/components/rating-colors"
import { CDN } from "@/app/shared/utils/constants"
import { formatLevel } from "@/app/shared/utils/format-level"

const CHUNITHM_RATING_DENSITY_KEY = "chunithm-rating-density"

const getLevelSortValue = (rating: ChunithmRating): number => {
	if (rating.level == null || !Number.isFinite(rating.level) || rating.chartId === 5) {
		return Number.POSITIVE_INFINITY
	}

	return rating.level
}

export default function ChunithmRatingPage() {
	const version = useChunithmVersion()
	const filters = ratingFilters(version || 0)

	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaults(filters))
	const [density, setDensity] = useState<"list" | "grid">(() => {
		try {
			const saved = localStorage.getItem(CHUNITHM_RATING_DENSITY_KEY)
			if (saved === "grid" || saved === "comfortable") return "grid"
			return "list"
		} catch {
			return "list"
		}
	})

	const activeTab = filterValues.tab || "base"
	const { getActiveData, getActiveLoading } = useChunithmRatingData(activeTab)
	const data = getActiveData(activeTab)
	const isLoading = getActiveLoading(activeTab)

	const filtered = useFiltering(data || [], filters, searchQuery, filterValues)

	const sorted = useMemo(() => {
		const list = [...filtered]
		const sortMode = filterValues.sort || "default"

		if (sortMode === "floor") {
			list.sort((a, b) => getLevelSortValue(a) - getLevelSortValue(b))
		} else if (sortMode === "ceiling") {
			list.sort((a, b) => getLevelSortValue(b) - getLevelSortValue(a))
		}

		return list
	}, [filtered, filterValues.sort])

	useEffect(() => {
		if (!version) return

		const newFilters = ratingFilters(version)
		const validTabs = newFilters.find(filter => filter.identifier === "tab")?.options.map(option => option.value) || []

		if (filterValues.tab && !validTabs.includes(filterValues.tab)) {
			setFilterValues(getDefaults(newFilters))
		}
	}, [version, filterValues.tab])

	useEffect(() => {
		localStorage.setItem(CHUNITHM_RATING_DENSITY_KEY, density)
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
					items: sorted.map((rating: ChunithmRating, index: number) => ({ id: index, title: rating.title || "" })),
					onSelect: setSearchQuery,
					placeholder: "Search...",
					emptyMessage: "No ratings.",
					groupLabel: "Ratings"
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
						<DensityToggle density={density} onChange={setDensity} />
						<InlineFilters
							filters={filters}
							filterValues={filterValues}
							onFilterChange={(id, val) => setFilterValues(prev => ({ ...prev, [id]: val }))}
							onClearAll={() => setFilterValues(getDefaults(filters))}
						/>
					</div>
				</div>

				{sorted.length === 0 ? (
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
								{sorted.map((rating, index) => (
									<TableRow key={`${rating.musicId ?? index}-${rating.chartId ?? 0}`}>
										<TableCell className="h-16">
											<img
												src={`${CDN}/chunithm/jacket/${rating.jacketPath}`}
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
											{getDifficultyFromChunithmChart(rating.chartId ?? 0)}
										</TableCell>

										<TableCell className="h-16 font-medium leading-none">{formatLevel(rating.level)}</TableCell>

										<TableCell className="h-16 text-right font-semibold leading-none">
											{(rating.score ?? 0).toLocaleString()}
										</TableCell>

										<TableCell className="h-16 font-medium leading-none">{getChunithmGrade(rating.score ?? 0)}</TableCell>

										<TableCell className="h-16 text-right font-medium leading-none">
											<ChunithmRatingColors
												rating={
													rating.level != null && rating.score != null
														? calculateChunithmRating(rating.level, rating.score) / 100
														: 0
												}
												version={rating.version ?? version}
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				) : (
					<CardGrid className="lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
						{sorted.map((rating: ChunithmRating, index: number) => (
							<ChunithmRatingInfoCard
								key={index}
								score={rating}
								levelColorBadge={chunithmBadgeColors}
								isPotential={filterValues.tab === "potential"}
							/>
						))}
					</CardGrid>
				)}
			</Body>
		</Container>
	)
}