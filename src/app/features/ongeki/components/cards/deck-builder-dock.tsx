import { Plus, Save, X } from "lucide-react"
import { useMemo } from "react"

import { Button } from "@/app/shared/components/ui/button"
import { CDN } from "@/app/shared/utils/constants"
import { cn } from "@/app/shared/utils"
import type { DB } from "@/app/shared/types"

interface DeckBuilderDockProps {
	deck: DB.OngekiUserDeck
	allCards: (DB.OngekiUserCard & DB.OngekiStaticCards)[]
	activeSlot: number | null
	onSlotClick: (slot: number) => void
	onSave: () => void
	onClearSlot: (slot: number) => void
	isSaving: boolean
	onClose?: () => void
	onCardDrop?: (card: DB.OngekiUserCard & DB.OngekiStaticCards, slot: number) => void
	onReset?: () => void
	hasChanges?: boolean
}

export function DeckBuilderDock({
	deck,
	allCards,
	activeSlot,
	onSlotClick,
	onSave,
	onClearSlot,
	isSaving,
	onClose,
	onCardDrop,
	onReset,
	hasChanges
}: DeckBuilderDockProps) {
	const slots = useMemo(() => {
		const findCard = (id: number | null) => allCards.find(c => c.cardId === id)
		return [
			{ id: 1, card: findCard(deck.cardId1) },
			{ id: 2, card: findCard(deck.cardId2) },
			{ id: 3, card: findCard(deck.cardId3) }
		]
	}, [deck, allCards])



	return (
		<div className="fixed bottom-6 left-1/2 z-[100] w-full max-w-2xl -translate-x-1/2 px-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
			<div className="bg-background/80 border-primary/20 relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl transition-all hover:border-primary/40">
				{/* Subtle Background Glows */}
				<div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
				<div className="absolute -right-24 -bottom-24 h-48 w-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

				<div className="relative flex items-center gap-6 p-4">
					{/* Left Info */}
					<div className="hidden flex-col justify-center sm:flex shrink-0">
						<span className="text-[10px] font-bold text-primary uppercase tracking-widest">Active Deck</span>
						<h3 className="text-sm font-bold">Slot {deck.deckId}</h3>
					</div>

					{/* Slots Area */}
					<div className="flex flex-1 items-center justify-center gap-3 sm:gap-4">
						{slots.map(slot => (
							<div key={slot.id} className="relative group">
								<div
									onClick={() => onSlotClick(slot.id)}
									onDragOver={(e) => {
										e.preventDefault()
										e.dataTransfer.dropEffect = "move"
									}}
									onDrop={(e) => {
										e.preventDefault()
										const data = e.dataTransfer.getData("application/json")
										if (data) {
											try {
												const card = JSON.parse(data)
												onCardDrop?.(card, slot.id)
											} catch (err) {
												console.error("Failed to parse dropped card", err)
											}
										}
									}}
									className={cn(
										"relative h-16 w-12 sm:h-20 sm:w-16 cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-300",
										activeSlot === slot.id
											? "border-primary ring-4 ring-primary/20 scale-105"
											: "border-white/10 hover:border-white/30",
										!slot.card && "bg-white/5 flex items-center justify-center border-dashed"
									)}
								>
									{slot.card ? (
										<img
											src={`${CDN}/ongeki/card/${slot.card.imagePath}`}
											alt={slot.card.name || "Card"}
											className="h-full w-full object-cover"
										/>
									) : (
										<Plus className="text-white/20 h-5 w-5" />
									)}

									{activeSlot === slot.id && (
										<div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[2px]">
											<div className="h-2 w-2 rounded-full bg-white animate-pulse" />
										</div>
									)}
								</div>

								{slot.card && (
									<button
										onClick={(e) => {
											e.stopPropagation()
											onClearSlot(slot.id)
										}}
										className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100 shadow-lg"
									>
										<X className="h-3 w-3" />
									</button>
								)}
							</div>
						))}
					</div>

					{/* Actions */}
					<div className="flex flex-col gap-2 shrink-0">
						<Button
							size="sm"
							onClick={onSave}
							disabled={isSaving || !hasChanges}
							className={cn(
								"h-9 px-4 font-bold transition-all duration-300",
								hasChanges && !isSaving ? "" : "opacity-50 grayscale cursor-not-allowed"
							)}
						>
							{isSaving && hasChanges ? (
								<div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							) : (
								<>
									<Save className="mr-2 h-4 w-4" />
									Save
								</>
							)}
						</Button>
						<div className="flex flex-col">
							<Button
								variant="ghost"
								size="sm"
								onClick={onReset}
								disabled={!hasChanges}
								className={cn(
									"h-6 text-[9px] uppercase font-bold transition-colors",
									hasChanges ? "text-muted-foreground hover:text-destructive" : "text-muted-foreground/30 cursor-not-allowed"
								)}
							>
								Reset
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={onClose}
								className="h-6 text-[9px] uppercase font-bold text-muted-foreground hover:text-foreground"
							>
								Minimize
							</Button>
						</div>
					</div>
				</div>

				{/* Selection Hint */}
				{activeSlot && (
					<div className="bg-primary/20 border-t border-primary/20 py-1 text-center">
						<span className="text-[9px] font-bold text-primary uppercase tracking-widest animate-pulse">
							Select a card from the gallery above to fill Slot {activeSlot}
						</span>
					</div>
				)}
			</div>
		</div>
	)
}
