import { useEffect, useState } from "react"

import ChunithmRatingInfoCard from "@/app/features/chunithm/components/rating-info-card"
import { ratingFilters, useChunithmRatingData, useChunithmVersion } from "@/app/features/chunithm/hooks"
import Header from "@/app/shared/components/common/header"
import { MultiFilter } from "@/app/shared/components/common/multi-filter"
import { Pagination } from "@/app/shared/components/common/pagination"
import Spinner from "@/app/shared/components/common/spinner"
import { getDefaults, useFiltering } from "@/app/shared/hooks/use-filtering"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import { Body, Container, FilterArea } from "@/app/shared/pages/layout/layout"
import type { FilterValues } from "@/app/shared/types"
import { chunithmBadgeColors } from "@/app/shared/utils/chunithm"

export default function ChunithmRatingPage() {
	const version = useChunithmVersion()
	const filters = ratingFilters(version || 0)
	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaults(filters))

	const activeTab = filterValues.tab || "base"
	const { getActiveData, getActiveLoading } = useChunithmRatingData(activeTab)
	const data = getActiveData(activeTab)
	const isLoading = getActiveLoading(activeTab)

	const filtered = useFiltering(data || [], filters, searchQuery, filterValues)
	const { page, setPage, totalPages, paged, total, hasMore } = usePagination(filtered, 20, [searchQuery, filterValues])

	useEffect(() => {
		if (version) {
			const newFilters = ratingFilters(version)
			const validTabs = newFilters.find(f => f.identifier === "tab")?.options.map(o => o.value) || []
			if (filterValues.tab && !validTabs.includes(filterValues.tab)) {
				setFilterValues(getDefaults(newFilters))
			}
		}
	}, [version, filterValues.tab])

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
					items: filtered.slice(0, 100).map((r, i) => ({ id: i, title: r.title || "" })),
					searchQuery,
					onSearchChange: setSearchQuery,
					placeholder: "Search...",
					emptyMessage: "No ratings.",
					groupLabel: "Ratings"
				}}
			/>
			<Body>
				<FilterArea>
					<MultiFilter
						filters={filters}
						filterValues={filterValues}
						onFilterChange={(id, val) => setFilterValues(p => ({ ...p, [id]: val }))}
						onClearAll={() => setFilterValues(getDefaults(filters))}
					/>
				</FilterArea>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{paged.map((rating, idx) => (
						<ChunithmRatingInfoCard
							key={idx}
							score={rating}
							levelColorBadge={chunithmBadgeColors}
							isPotential={filterValues.tab === "potential"}
						/>
					))}
				</div>

				{filtered.length === 0 && <div className="text-muted-foreground py-20 text-center">No ratings found</div>}

				{hasMore && <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />}
			</Body>
		</Container>
	)
}
