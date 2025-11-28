import { useState } from "react"

import { toast } from "sonner"

import { OngekiScoreInfoCard } from "@/app/features/ongeki/components/score-info-card"
import { scoreFilters, useOngekiScoreExporter, useOngekiScores, useOngekiVersion } from "@/app/features/ongeki/hooks"
import Header from "@/app/shared/components/common/header"
import { MultiFilter } from "@/app/shared/components/common/multi-filter"
import { Pagination } from "@/app/shared/components/common/pagination"
import Spinner from "@/app/shared/components/common/spinner"
import { Button } from "@/app/shared/components/ui/button"
import { getDefaults, useFiltering } from "@/app/shared/hooks/use-filtering"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import { Body, Container, FilterArea } from "@/app/shared/pages/layout/layout"
import type { FilterValues } from "@/app/shared/types"
import { ongekiBadgeColors } from "@/app/shared/utils/ongeki"

export function OngekiScorePage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaults(scoreFilters))

	const version = useOngekiVersion()
	const { data: scores, isLoading } = useOngekiScores()
	const { data: exportData, isLoading: isLoadingExport, refetch: refetchExport } = useOngekiScoreExporter()

	const filtered = useFiltering(scores || [], scoreFilters, searchQuery, filterValues)
	const { page, setPage, totalPages, paged, total, hasMore } = usePagination(filtered, 20, [searchQuery, filterValues])

	const handleExport = async () => {
		try {
			const result = exportData || (await refetchExport()).data
			if (!result) return toast.error("No data")
			const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" })
			const a = document.createElement("a")
			a.href = URL.createObjectURL(blob)
			a.download = "ongeki_scores.json"
			a.click()
			toast.success("Exported")
		} catch {
			toast.error("Export failed")
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

	return (
		<Container>
			<Header
				title="Scores"
				searchProps={{
					items: filtered.map(s => ({ id: s.id, title: s.title || "" })),
					onSelect: setSearchQuery,
					placeholder: "Search...",
					emptyMessage: "No scores.",
					groupLabel: "Scores"
				}}
			/>
			<Body>
				<FilterArea>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<MultiFilter
							filters={scoreFilters}
							filterValues={filterValues}
							onFilterChange={(id, val) => setFilterValues(p => ({ ...p, [id]: val }))}
							onClearAll={() => setFilterValues(getDefaults(scoreFilters))}
						/>
						<Button onClick={handleExport} variant="outline" size="sm" disabled={isLoadingExport}>
							{isLoadingExport ? "..." : "Export"}
						</Button>
					</div>
				</FilterArea>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{paged.map(score => (
						<OngekiScoreInfoCard key={score.id} score={score} levelColorBadge={ongekiBadgeColors} ongekiVersion={version} />
					))}
				</div>

				{filtered.length === 0 && <div className="text-muted-foreground py-20 text-center">No scores found</div>}

				{hasMore && <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />}
			</Body>
		</Container>
	)
}
