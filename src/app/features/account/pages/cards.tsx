import { useState } from "react"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CreditCard, Eye, EyeOff, Pencil, Plus, Shuffle, X } from "lucide-react"
import { toast } from "sonner"

import Header from "@/app/shared/components/common/header"
import { Button } from "@/app/shared/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/app/shared/components/ui/dialog"
import { Input } from "@/app/shared/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/shared/components/ui/popover"
import { Body, Container } from "@/app/shared/pages/layout/layout"
import { DB } from "@/app/shared/types"
import { api } from "@/app/shared/utils"

const CardsPage = () => {
	const queryClient = useQueryClient()
	const [hiddenCards, setHiddenCards] = useState<Record<number, boolean>>({})
	const [bindDialogOpen, setBindDialogOpen] = useState(false)
	const [unbindDialogOpen, setUnbindDialogOpen] = useState<number | null>(null)
	const [changeAccessCodeDialogOpen, setChangeAccessCodeDialogOpen] = useState<number | null>(null)
	const [bindAccessCode, setBindAccessCode] = useState("")
	const [changeAccessCode, setChangeAccessCode] = useState("")
	const [hoveredIcon, setHoveredIcon] = useState<{ cardId: number; type: "eye" | "copy" | "edit" } | null>(null)

	const { data: cardsData, isLoading } = useQuery<{ cards: DB.AimeCard[] }>({
		queryKey: ["user", "cards"],
		queryFn: async () => {
			const response = await api.users.cards.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch cards")
			}
			return await response.json()
		}
	})

	const bindCard = useMutation({
		mutationFn: async (accessCode: string) => {
			const response = await api.users.cards.bind.$post({
				json: { accessCode }
			})
			if (!response.ok) {
				const error = (await response.json()) as { message?: string }
				throw new Error(error.message || "Failed to bind card")
			}
			return await response.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user", "cards"] })
			setBindDialogOpen(false)
			setBindAccessCode("")
			toast.success("Card bound successfully")
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to bind card")
		}
	})

	const unbindCard = useMutation({
		mutationFn: async (accessCode: string) => {
			const response = await api.users.cards.unbind.$post({
				json: { accessCode }
			})
			if (!response.ok) {
				const error = (await response.json()) as { message?: string }
				throw new Error(error.message || "Failed to unbind card")
			}
			return await response.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user", "cards"] })
			setUnbindDialogOpen(null)
			toast.success("Card unbound successfully")
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to unbind card")
		}
	})

	const toggleCardVisibility = (cardId: number) => {
		setHiddenCards(prev => ({
			...prev,
			[cardId]: !prev[cardId]
		}))
	}

	const formatAccessCode = (accessCode: string, hidden: boolean) => {
		if (hidden) {
			return accessCode.substring(0, 4) + "****************"
		}
		return accessCode
	}

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text)
		toast.success("Copied to clipboard")
	}

	const generateAccessCode = () => {
		// Generate a random 20-digit access code
		const digits = Array.from({ length: 20 }, () => Math.floor(Math.random() * 10)).join("")
		setBindAccessCode(digits)
	}

	const cards = cardsData?.cards || []

	return (
		<Container>
			<Header title="Card Management" />
			<Body>
				<div className="mb-4 space-y-4">
					<div className="bg-card text-card-foreground rounded-sm p-4">
						<div className="mb-2 flex items-center gap-2">
							<CreditCard className="text-blue-500" />
							<h2 className="text-lg font-semibold">My Cards</h2>
						</div>
						<p className="text-muted-foreground text-sm">
							Manage your Aime cards. You can bind, unbind, and set default cards here.
						</p>
					</div>

					{isLoading ? (
						<div className="flex h-64 items-center justify-center">
							<div className="text-muted-foreground">Loading cards...</div>
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2">
							{cards.map(card => {
								const isHidden = hiddenCards[card.id] ?? true
								const displayCode = formatAccessCode(card.access_code || "", isHidden)
								const fullCode = card.access_code || ""

								return (
									<div key={card.id} className="bg-card text-card-foreground rounded-sm border p-4">
										<div className="mb-3 flex items-center justify-between">
											<div className="flex items-center gap-2">
												<CreditCard className="h-5 w-5 text-blue-500" />
												<span className="font-semibold">Card #{card.id}</span>
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setUnbindDialogOpen(card.id)}
												className="text-destructive hover:text-destructive"
											>
												<X className="h-4 w-4" />
											</Button>
										</div>

										<div className="mb-3 space-y-2">
											<div>
												<label className="text-muted-foreground mb-1 block text-sm font-medium">Access Code</label>
												<div className="flex items-center gap-2">
													<code className="bg-muted flex-1 rounded px-2 py-1 font-mono text-sm">{displayCode}</code>
													<Popover
														open={hoveredIcon?.cardId === card.id && hoveredIcon?.type === "eye"}
														onOpenChange={() => {}}
													>
														<PopoverTrigger asChild>
															<Button
																variant="ghost"
																size="sm"
																onClick={() => toggleCardVisibility(card.id)}
																onMouseEnter={() => setHoveredIcon({ cardId: card.id, type: "eye" })}
																onMouseLeave={() => setHoveredIcon(null)}
																onBlur={e => e.currentTarget.blur()}
																className="h-8 w-8 p-0 focus-visible:ring-0 focus-visible:outline-none"
															>
																{isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
															</Button>
														</PopoverTrigger>
														<PopoverContent
															className="w-auto p-2 text-xs"
															side="top"
															onMouseEnter={() => setHoveredIcon({ cardId: card.id, type: "eye" })}
															onMouseLeave={() => setHoveredIcon(null)}
														>
															{isHidden ? "Show access code" : "Hide access code"}
														</PopoverContent>
													</Popover>
													<Popover
														open={hoveredIcon?.cardId === card.id && hoveredIcon?.type === "copy"}
														onOpenChange={() => {}}
													>
														<PopoverTrigger asChild>
															<Button
																variant="ghost"
																size="sm"
																onClick={() => copyToClipboard(fullCode)}
																onMouseEnter={() => setHoveredIcon({ cardId: card.id, type: "copy" })}
																onMouseLeave={() => setHoveredIcon(null)}
																onBlur={e => e.currentTarget.blur()}
																className="h-8 w-8 p-0 focus-visible:ring-0 focus-visible:outline-none"
															>
																<CreditCard className="h-4 w-4" />
															</Button>
														</PopoverTrigger>
														<PopoverContent
															className="w-auto p-2 text-xs"
															side="top"
															onMouseEnter={() => setHoveredIcon({ cardId: card.id, type: "copy" })}
															onMouseLeave={() => setHoveredIcon(null)}
														>
															Copy access code to clipboard
														</PopoverContent>
													</Popover>
													<Popover
														open={hoveredIcon?.cardId === card.id && hoveredIcon?.type === "edit"}
														onOpenChange={() => {}}
													>
														<PopoverTrigger asChild>
															<Button
																variant="ghost"
																size="sm"
																onClick={() => {
																	setChangeAccessCode(fullCode)
																	setChangeAccessCodeDialogOpen(card.id)
																}}
																onMouseEnter={() => setHoveredIcon({ cardId: card.id, type: "edit" })}
																onMouseLeave={() => setHoveredIcon(null)}
																onBlur={e => e.currentTarget.blur()}
																className="h-8 w-8 p-0 focus-visible:ring-0 focus-visible:outline-none"
															>
																<Pencil className="h-4 w-4" />
															</Button>
														</PopoverTrigger>
														<PopoverContent
															className="w-auto p-2 text-xs"
															side="top"
															onMouseEnter={() => setHoveredIcon({ cardId: card.id, type: "edit" })}
															onMouseLeave={() => setHoveredIcon(null)}
														>
															Change access code
														</PopoverContent>
													</Popover>
												</div>
											</div>

											<div className="text-muted-foreground text-xs">
												Created: {card.created_date ? new Date(card.created_date).toLocaleDateString() : "N/A"}
											</div>
											{card.last_login_date && (
												<div className="text-muted-foreground text-xs">
													Last Login: {new Date(card.last_login_date).toLocaleDateString()}
												</div>
											)}
										</div>

										{/* Unbind Dialog */}
										<Dialog
											open={unbindDialogOpen === card.id}
											onOpenChange={open => setUnbindDialogOpen(open ? card.id : null)}
										>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>Unbind Card</DialogTitle>
													<DialogDescription>
														Are you sure you want to unbind this card? This action cannot be undone.
													</DialogDescription>
												</DialogHeader>
												<DialogFooter>
													<Button variant="outline" onClick={() => setUnbindDialogOpen(null)}>
														Cancel
													</Button>
													<Button
														variant="destructive"
														onClick={() => unbindCard.mutate(fullCode)}
														disabled={unbindCard.isPending}
													>
														{unbindCard.isPending ? "Unbinding..." : "Unbind"}
													</Button>
												</DialogFooter>
											</DialogContent>
										</Dialog>

										{/* Change Access Code Dialog */}
										<Dialog
											open={changeAccessCodeDialogOpen === card.id}
											onOpenChange={open => setChangeAccessCodeDialogOpen(open ? card.id : null)}
										>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>Change Access Code</DialogTitle>
													<DialogDescription>Update the access code for this card.</DialogDescription>
												</DialogHeader>
												<div className="space-y-4">
													<Input
														value={changeAccessCode}
														onChange={e => setChangeAccessCode(e.target.value)}
														placeholder="Enter 20-digit access code"
														maxLength={20}
													/>
												</div>
												<DialogFooter>
													<Button variant="outline" onClick={() => setChangeAccessCodeDialogOpen(null)}>
														Cancel
													</Button>
													<Button
														onClick={() => {
															// Note: This endpoint doesn't exist yet - you'll need to add it
															toast.info("Change access code feature coming soon")
															setChangeAccessCodeDialogOpen(null)
														}}
													>
														Update
													</Button>
												</DialogFooter>
											</DialogContent>
										</Dialog>
									</div>
								)
							})}

							{/* Add Card Button */}
							<Dialog open={bindDialogOpen} onOpenChange={setBindDialogOpen}>
								<DialogTrigger asChild>
									<button className="bg-card text-card-foreground hover:bg-muted/50 flex h-full min-h-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed transition-colors">
										<Plus className="text-muted-foreground h-8 w-8" />
										<span className="text-muted-foreground font-medium">Bind New Card</span>
									</button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Bind Card</DialogTitle>
										<DialogDescription>
											Enter the 20-digit access code to bind a new card to your account.
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-4">
										<div className="flex gap-2">
											<Input
												value={bindAccessCode}
												onChange={e => {
													const value = e.target.value
													if (/^\d{0,20}$/.test(value)) {
														setBindAccessCode(value)
													}
												}}
												placeholder="Enter 20-digit access code"
												maxLength={20}
												inputMode="numeric"
												className="flex-1"
											/>
											<Button type="button" variant="outline" onClick={generateAccessCode} className="shrink-0">
												<Shuffle className="h-4 w-4" />
											</Button>
										</div>
									</div>
									<DialogFooter>
										<Button variant="outline" onClick={() => setBindDialogOpen(false)}>
											Cancel
										</Button>
										<Button
											onClick={() => bindCard.mutate(bindAccessCode)}
											disabled={bindCard.isPending || bindAccessCode.length !== 20}
										>
											{bindCard.isPending ? "Binding..." : "Bind Card"}
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</div>
					)}
				</div>
			</Body>
		</Container>
	)
}

export default CardsPage
