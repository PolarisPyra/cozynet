import { useMemo, useState } from "react"
import { Filter, Search } from "lucide-react"

import { CardGallery } from "@/app/features/ongeki/components/cards/card-gallery"
import { cardFilters, useOngekiCards } from "@/app/features/ongeki/hooks"
import Header from "@/app/shared/components/common/header"
import { InlineFilters } from "@/app/shared/components/common/inline-filters"
import Spinner from "@/app/shared/components/common/spinner"
import { Button } from "@/app/shared/components/ui/button"
import { Card, CardContent } from "@/app/shared/components/ui/card"
import { getDefaults, useFiltering } from "@/app/shared/hooks/use-filtering"
import { Body, Container } from "@/app/shared/pages/layout/layout"

export default function OngekiCardPage() {
	const { data, isLoading } = useOngekiCards()
	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState(() => getDefaults(cardFilters))
	const [showFilters, setShowFilters] = useState(false)

	const cards = useMemo(() => data?.cards || [], [data])

	const filtered = useFiltering(cards, cardFilters, searchQuery, filterValues, "name")

	const stats = useMemo(() => {
		const total = cards.length
		const acquired = cards.filter(c => c.isAcquired === 1).length
		const ssr = cards.filter(c => c.rarity === 3).length
		const acquiredSsr = cards.filter(c => c.rarity === 3 && c.isAcquired === 1).length

		return {
			total,
			acquired,
			ssr,
			acquiredSsr,
			percentage: total > 0 ? Math.round((acquired / total) * 100) : 0
		}
	}, [cards])

	const handleFilterChange = (id: string, val: string) => {
		setFilterValues(prev => ({ ...prev, [id]: val }))
	}

	const resetFilters = () => {
		setFilterValues(getDefaults(cardFilters))
		setSearchQuery("")
	}

	if (isLoading) {
		return (
			<Container>
				<Header title="Cards" />
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
				title="Cards"
				searchProps={{
					items: cards.map(c => ({ id: c.cardId ?? 0, title: c.name || "" })),
					onSelect: setSearchQuery,
					placeholder: "Search by character name...",
					emptyMessage: "No cards found.",
					groupLabel: "Cards",
					recentStorageKey: "recent:ongeki:cards"
				}}
			/>

			<Body>
				{/* Collector's Summary Dashboard */}
				<div className="mb-6">
					<Card className="bg-accent/5 max-w-md">
						<CardContent className="pt-6">
							<div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Completion</div>
							<div className="mt-1 flex items-baseline gap-2">
								<span className="text-2xl font-bold">{stats.percentage}%</span>
								<span className="text-muted-foreground text-sm">
									({stats.acquired}/{stats.total})
								</span>
							</div>
							<div className="bg-muted mt-3 h-1.5 w-full overflow-hidden rounded-full">
								<div
									className="h-full bg-primary transition-all duration-500"
									style={{ width: `${stats.percentage}%` }}
								/>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="flex items-center gap-2">
						<Button
							variant={showFilters ? "secondary" : "outline"}
							size="sm"
							onClick={() => setShowFilters(!showFilters)}
							className="h-9"
						>
							<Filter className="mr-2 h-4 w-4" />
							Filters
							{(searchQuery || Object.values(filterValues).some(v => v !== "all")) && (
								<span className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
									!
								</span>
							)}
						</Button>

						{showFilters && (
							<Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 text-muted-foreground">
								Reset
							</Button>
						)}
					</div>

					<div className="text-muted-foreground text-sm">
						Showing <span className="text-foreground font-medium">{filtered.length}</span> cards
					</div>
				</div>

				<div className="flex flex-col gap-6 lg:flex-row">
					{/* Tactical Sidebar (Conditional) */}
					{showFilters && (
						<aside className="sticky top-20 w-full shrink-0 self-start lg:w-64">
							<Card>
								<CardContent className="p-4">
									<InlineFilters
										filters={cardFilters}
										filterValues={filterValues}
										onFilterChange={handleFilterChange}
										onClearAll={resetFilters}
										isVertical
									/>
								</CardContent>
							</Card>
						</aside>
					)}

					{/* Visual Gallery */}
					<div className="flex-1">
						{filtered.length > 0 ? (
							<CardGallery cards={filtered} itemsPerPage={80} />
						) : (
							<div className="bg-accent/5 flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed">
								<Search className="text-muted-foreground mb-4 h-12 w-12 opacity-20" />
								<p className="text-muted-foreground">No cards matching your criteria</p>
								<Button variant="link" onClick={resetFilters}>
									Clear all filters
								</Button>
							</div>
						)}
					</div>
				</div>
			</Body>
		</Container>
	)
}
