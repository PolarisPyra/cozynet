import { useCallback, useEffect, useMemo, useState } from "react"
import { LayoutGrid, Search, Sparkles } from "lucide-react"

import { CardGallery } from "@/app/features/ongeki/components/cards/card-gallery"
import { DeckBuilderDock } from "@/app/features/ongeki/components/cards/deck-builder-dock"
import { cardFilters, useOngekiCards, useOngekiDecks } from "@/app/features/ongeki/hooks"
import Header from "@/app/shared/components/common/header"
import { InlineFilters } from "@/app/shared/components/common/inline-filters"
import Spinner from "@/app/shared/components/common/spinner"
import { Button } from "@/app/shared/components/ui/button"
import { Progress } from "@/app/shared/components/ui/progress"
import { getDefaults, useFiltering } from "@/app/shared/hooks/use-filtering"
import { Body, Container } from "@/app/shared/pages/layout/layout"
import type { DB } from "@/app/shared/types"

export default function OngekiDeckManagementPage() {
	const { data: cardData, isLoading: cardsLoading } = useOngekiCards()
	const { decks, isLoading: decksLoading, updateDeck } = useOngekiDecks()

	const [searchQuery, setSearchQuery] = useState("")
	const [filterValues, setFilterValues] = useState(() => getDefaults(cardFilters))
	const [isDockVisible, setIsDockVisible] = useState(true)

	const [draftDeck, setDraftDeck] = useState<DB.OngekiUserDeck | null>(null)
	const [activeSlot, setActiveSlot] = useState<number | null>(null)

	const cards = useMemo(() => cardData?.cards || [], [cardData])
	const filtered = useFiltering(cards, cardFilters, searchQuery, filterValues, "name")

	// Initialize draft deck
	useEffect(() => {
		if (decks.length > 0 && !draftDeck) {
			setDraftDeck(decks[0])
		}
	}, [decks, draftDeck])

	const stats = useMemo(() => {
		const total = cards.length
		const acquired = cards.filter(c => c.isAcquired === 1).length

		return {
			total,
			acquired,
			percentage: total > 0 ? Math.round((acquired / total) * 100) : 0
		}
	}, [cards])

	const hasChanges = useMemo(() => {
		if (!draftDeck) return false
		const original = decks.find(d => d.deckId === draftDeck.deckId)
		if (!original) return true // Treat as changed if no original found (new deck)
		return (
			draftDeck.cardId1 !== original.cardId1 ||
			draftDeck.cardId2 !== original.cardId2 ||
			draftDeck.cardId3 !== original.cardId3
		)
	}, [draftDeck, decks])

	const handleFilterChange = (id: string, val: string) => {
		setFilterValues(prev => ({ ...prev, [id]: val }))
	}

	const resetFilters = () => {
		setFilterValues(getDefaults(cardFilters))
		setSearchQuery("")
	}

	const handleCardClick = useCallback((card: DB.OngekiUserCard & DB.OngekiStaticCards) => {
		if (!activeSlot || !draftDeck) return

		const newDeck = { ...draftDeck }
		if (activeSlot === 1) newDeck.cardId1 = card.cardId
		if (activeSlot === 2) newDeck.cardId2 = card.cardId
		if (activeSlot === 3) newDeck.cardId3 = card.cardId

		setDraftDeck(newDeck)
		setActiveSlot(null)
		setIsDockVisible(true)
	}, [activeSlot, draftDeck])

	const handleCardDrop = useCallback((card: DB.OngekiUserCard & DB.OngekiStaticCards, slot: number) => {
		if (!draftDeck) return

		const newDeck = { ...draftDeck }
		if (slot === 1) newDeck.cardId1 = card.cardId
		if (slot === 2) newDeck.cardId2 = card.cardId
		if (slot === 3) newDeck.cardId3 = card.cardId

		setDraftDeck(newDeck)
		setIsDockVisible(true)
	}, [draftDeck])

	const handleReset = () => {
		if (!draftDeck) return
		const original = decks.find(d => d.deckId === draftDeck.deckId)
		if (original) {
			setDraftDeck(original)
		}
	}

	const handleClearSlot = (slot: number) => {
		if (!draftDeck) return
		const newDeck = { ...draftDeck }
		if (slot === 1) newDeck.cardId1 = 0
		if (slot === 2) newDeck.cardId2 = 0
		if (slot === 3) newDeck.cardId3 = 0
		setDraftDeck(newDeck)
	}

	const handleDeckSelect = (deck: DB.OngekiUserDeck) => {
		setDraftDeck(deck)
		setActiveSlot(null)
	}

	const handleSave = () => {
		if (!draftDeck) return
		updateDeck.mutate({
			deckId: draftDeck.deckId || 1,
			cardId1: draftDeck.cardId1 || 0,
			cardId2: draftDeck.cardId2 || 0,
			cardId3: draftDeck.cardId3 || 0
		})
	}

	if (cardsLoading || decksLoading) {
		return (
			<Container>
				<Header title="Ongeki" />
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
				title="Deck Builder"
				searchProps={{
					items: cards.map(c => ({ id: c.cardId ?? 0, title: c.name || "" })),
					onSelect: setSearchQuery,
					placeholder: "Quick search character...",
					emptyMessage: "No cards found.",
					groupLabel: "Cards",
					recentStorageKey: "recent:ongeki:cards"
				}}
			/>

			<Body>
				<div className="mb-6 flex justify-center sm:justify-end">
					<InlineFilters
						filters={cardFilters}
						filterValues={filterValues}
						onFilterChange={handleFilterChange}
						onClearAll={resetFilters}
					/>
				</div>
				{/* Modern Stats / Info Bar */}
				<div className="mb-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-6">
					<div className="flex flex-wrap items-center gap-6">
						<div className="flex items-center gap-4">
							<div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
								<LayoutGrid className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h2 className="text-sm font-bold tracking-tight">Team Management</h2>
								<p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
									{filtered.length} Cards Available
								</p>
							</div>
						</div>

						<div className="hidden h-8 w-[1px] bg-border/50 sm:block" />

						<div className="flex items-center gap-4">
							<div className="bg-pink-500/10 flex h-10 w-10 items-center justify-center rounded-xl">
								<Sparkles className="h-5 w-5 text-pink-500" />
							</div>
							<div className="flex flex-col gap-1.5">
								<div className="flex items-center gap-3">
									<span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
										Collection Rate
									</span>
									<span className="text-sm font-bold text-pink-500">{stats.percentage}%</span>
								</div>
								<Progress value={stats.percentage} className="h-1.5 w-32 bg-muted" />
							</div>
						</div>
					</div>

					<div className="flex items-center gap-2">
						{!isDockVisible && (
							<Button
								onClick={() => setIsDockVisible(true)}
								className="h-10 bg-primary text-primary-foreground font-bold px-6"
							>
								Deck Editor
							</Button>
						)}
					</div>
				</div>

				<div className="flex flex-col gap-6 lg:flex-row pb-32">

					{/* Visual Gallery */}
					<div className="flex-1">
						{filtered.length > 0 ? (
							<CardGallery
								cards={filtered}
								itemsPerPage={80}
								onCardClick={handleCardClick}
							/>
						) : (
							<div className="bg-accent/5 flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10">
								<Search className="text-muted-foreground mb-4 h-12 w-12 opacity-20" />
								<p className="text-muted-foreground">No cards found</p>
								<Button variant="link" onClick={resetFilters}>
									Reset Search
								</Button>
							</div>
						)}
					</div>
				</div>

				{/* The Modern Floating Dock */}
				{isDockVisible && draftDeck && (
					<DeckBuilderDock
						deck={draftDeck}
						allDecks={decks}
						onDeckSelect={handleDeckSelect}
						allCards={cards}
						activeSlot={activeSlot}
						onSlotClick={setActiveSlot}
						onSave={handleSave}
						onClearSlot={handleClearSlot}
						isSaving={updateDeck.isPending}
						onClose={() => setIsDockVisible(false)}
						onCardDrop={handleCardDrop}
						onReset={handleReset}
						hasChanges={hasChanges}
					/>
				)}
			</Body>
		</Container>
	)
}
