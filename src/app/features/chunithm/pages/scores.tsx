import { useState } from "react"

import { toast } from "sonner"

import ChunithmScoreInfoCard from "@/app/features/chunithm/components/score-info-card"
import {
	type ChunithmFilterValues,
	getDefaultScoreFilterValues,
	useNewScoreFiltering as useChunithmScoreFiltering,
	useScoreExporter,
	useScoreFilters
} from "@/app/features/chunithm/hooks"
import Header from "@/app/shared/components/common/header"
import { MultiFilter } from "@/app/shared/components/common/multi-filter"
import ResponsiveGrid from "@/app/shared/components/common/responsive-grid"
import Spinner from "@/app/shared/components/common/spinner"
import { Button } from "@/app/shared/components/ui/button"
import { Body, Container, FilterArea } from "@/app/shared/pages/layout/layout"
import { chunithmBadgeColors } from "@/app/shared/utils/chunithm"

const ChunithmScorePage = () => {
	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState<ChunithmFilterValues>(getDefaultScoreFilterValues())

	const scoreFilters = useScoreFilters()
	const { filteredScores, isLoading } = useChunithmScoreFiltering({ searchQuery, filterValues })
	const { data: exportData, isLoading: isLoadingExport, refetch: refetchExport } = useScoreExporter()

	const handleFilterChange = (identifier: string, value: string) => {
		setFilterValues(prev => ({ ...prev, [identifier]: value }))
	}

	const handleClearAll = () => {
		setFilterValues(getDefaultScoreFilterValues())
	}

	const handleExportScores = async () => {
		try {
			// Fetch data if not already loaded
			let data = exportData
			if (!data) {
				const result = await refetchExport()
				data = result.data
			}

			if (!data) {
				toast.error("No score data available")
				return
			}

			const blob = new Blob([JSON.stringify(data, null, 2)], {
				type: "application/json"
			})
			const url = URL.createObjectURL(blob)
			const link = document.createElement("a")
			link.href = url
			link.download = "chunithm_scores_export.json"
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			URL.revokeObjectURL(url)

			toast.success("Successfully exported scores")
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
						<Button
							onClick={handleExportScores}
							variant="custom"
							disabled={isLoadingExport}
							className="w-full sm:w-auto"
						>
							{isLoadingExport ? "Exporting..." : "Export All Scores"}
						</Button>
					</div>
				</FilterArea>
				<ResponsiveGrid
					items={filteredScores}
					loading={isLoading}
					levelColorBadge={chunithmBadgeColors}
					CardComponent={ChunithmScoreInfoCard}
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

export default ChunithmScorePage
