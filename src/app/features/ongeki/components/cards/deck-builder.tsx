import { Plus, Save, Trash2 } from "lucide-react"
import { useMemo } from "react"

import { Button } from "@/app/shared/components/ui/button"

import { CDN } from "@/app/shared/utils/constants"
import { cn } from "@/app/shared/utils"
import type { DB } from "@/app/shared/types"

interface DeckBuilderProps {
	deck: DB.OngekiUserDeck
	allCards: (DB.OngekiUserCard & DB.OngekiStaticCards)[]
	activeSlot: number | null
	onSlotClick: (slot: number) => void
	onSave: () => void
	onClearSlot: (slot: number) => void
	isSaving: boolean
}

export function DeckBuilder({
	deck,
	allCards,
	activeSlot,
	onSlotClick,
	onSave,
	onClearSlot,
	isSaving
}: DeckBuilderProps) {
	const slots = useMemo(() => {
		const findCard = (id: number | null) => allCards.find(c => c.cardId === id)
		return [
			{ id: 1, card: findCard(deck.cardId1) },
			{ id: 2, card: findCard(deck.cardId2) },
			{ id: 3, card: findCard(deck.cardId3) }
		]
	}, [deck, allCards])

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Deck {deck.deckId}</h3>
				<Button size="sm" onClick={onSave} disabled={isSaving}>
					<Save className="mr-2 h-4 w-4" />
					{isSaving ? "Saving..." : "Save Deck"}
				</Button>
			</div>

			<div className="flex justify-center">
				<div className="grid grid-cols-3 gap-6 max-w-lg w-full">
				{slots.map(slot => (
					<div key={slot.id} className="space-y-2">
						<div
							onClick={() => onSlotClick(slot.id)}
							className={cn(
								"relative aspect-[3/4] cursor-pointer overflow-hidden rounded-lg border-2 transition-all",
								activeSlot === slot.id
									? "border-primary ring-primary/20 ring-4"
									: "border-muted hover:border-muted-foreground/50",
								!slot.card && "bg-accent/10 flex items-center justify-center border-dashed"
							)}
						>
							{slot.card ? (
								<>
									<img
										src={`${CDN}/ongeki/card/${slot.card.imagePath}`}
										alt={slot.card.name || "Card"}
										className="h-full w-full object-cover"
									/>
									<div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity hover:opacity-100 flex items-center justify-center">
										<p className="text-[10px] font-bold text-white uppercase">Change</p>
									</div>
									<Button
										variant="destructive"
										size="icon"
										className="absolute -top-1 -right-1 h-6 w-6 rounded-full shadow-lg"
										onClick={(e) => {
											e.stopPropagation()
											onClearSlot(slot.id)
										}}
									>
										<Trash2 className="h-3 w-3" />
									</Button>
								</>
							) : (
								<div className="text-center">
									<Plus className="text-muted-foreground mx-auto mb-1 h-6 w-6" />
									<p className="text-muted-foreground text-[10px] font-medium uppercase">Slot {slot.id}</p>
								</div>
							)}
						</div>
						{slot.card && (
							<div className="truncate text-center text-[10px] font-medium">
								{slot.card.name}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
			{activeSlot && (
				<div className="bg-primary/10 rounded-md p-2 text-center text-xs font-medium text-primary animate-pulse">
					Selecting Card for Slot {activeSlot}...
				</div>
			)}
		</div>
	)
}
