import { useState } from "react"

import { toast } from "sonner"

import { MaimaiDxScoreInfoCard } from "@/app/features/maimaidx/components/score-info-card"
import { getDefaultScoreFilterValues, useMaimaiDxScoreFiltering, useScoreFilters } from "@/app/features/maimaidx/hooks"
import Header from "@/app/shared/components/common/header"
import { MultiFilter } from "@/app/shared/components/common/multi-filter"
import ResponsiveGrid from "@/app/shared/components/common/responsive-grid"
import Spinner from "@/app/shared/components/common/spinner"
import { Button } from "@/app/shared/components/ui/button"
import { Body, Container, FilterArea } from "@/app/shared/pages/layout/layout"
import type { FilterValues } from "@/app/shared/types"
import { maimaiDxBadgeColors } from "@/app/shared/utils/maimai"

export function MaimaiDxScorePage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<FilterValues>(getDefaultScoreFilterValues())

	const scoreFilters = useScoreFilters()
	const { filteredScores, isLoading } = useMaimaiDxScoreFiltering({
		searchQuery,
		filterValues
	})

	const handleFilterChange = (identifier: string, value: string) => {
		setFilterValues(prev => ({ ...prev, [identifier]: value }))
	}

	const handleClearAll = () => {
		setFilterValues(getDefaultScoreFilterValues())
	}

	const handleExportScores = async () => {
		try {
			// TODO: Implement score exporter for maimai DX
			toast.error("Score export not yet implemented for Maimai DX")
		} catch (error) {
			toast.error("Failed to export scores")
		}
	}

	const searchItems = filteredScores.map(score => ({
		id: score.id,
		title: score.title || ""
	}))

	if (isLoading) return <LoadingState />

	return (
		<Container>
			<Header
				title="Scores"
				searchProps={{
					items: searchItems,
					searchQuery,
					onSearchChange: setSearchQuery,
					placeholder: "Search scores...",
					emptyMessage: "No scores found.",
					groupLabel: "Scores"
				}}
			/>
			<Body>
				<FilterArea>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<MultiFilter
							filters={scoreFilters}
							filterValues={filterValues}
							onFilterChange={handleFilterChange}
							onClearAll={handleClearAll}
						/>
						<Button onClick={handleExportScores} variant="outline" size="sm" className="w-full sm:w-auto">
							Export All Scores
						</Button>
					</div>
				</FilterArea>
				<ResponsiveGrid
					items={filteredScores}
					loading={isLoading}
					levelColorBadge={maimaiDxBadgeColors}
					CardComponent={MaimaiDxScoreInfoCard}
				/>
			</Body>
		</Container>
	)
}

const LoadingState = () => (
	<div className="flex-1">
		<Header title="Scores" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<Spinner size={24} color="#ffffff" />
		</div>
	</div>
)
