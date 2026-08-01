import { useState } from "react"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, CreditCard, LoaderCircle, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/app/shared/components/ui/badge"
import { Button } from "@/app/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/shared/components/ui/card"
import { Input } from "@/app/shared/components/ui/input"
import { api } from "@/app/shared/utils"

type UserCard = {
	id: number
	access_code: string
	idm: string | null
	is_locked: boolean
	is_banned: boolean
	card_type: "allnet" | "eamuse"
	is_primary: boolean
}

const formatCardNumber = (value: string) => value.replace(/(.{4})/g, "$1 ").trim()

const getErrorMessage = async (response: Response, fallback: string) => {
	const body = (await response.json().catch(() => ({}))) as { message?: string; error?: string }
	return body.message || body.error || fallback
}

export function CardManagement() {
	const [accessCode, setAccessCode] = useState("")
	const [eamuseAccessCode, setEamuseAccessCode] = useState("")
	const queryClient = useQueryClient()
	const cardsQuery = useQuery({
		queryKey: ["users", "cards"],
		queryFn: async () => {
			const response = await api.users.cards.$get()
			if (!response.ok) throw new Error(await getErrorMessage(response, "Failed to load cards"))
			return (await response.json()).cards as UserCard[]
		}
	})

	const bindMutation = useMutation({
		mutationFn: async ({
			accessCode: value,
			eamuseAccessCode: eamuseValue
		}: {
			accessCode?: string
			eamuseAccessCode?: string
		}) => {
			const response = await api.users.cards.bind.$post({
				json: { ...(value ? { accessCode: value } : {}), ...(eamuseValue ? { eamuseAccessCode: eamuseValue } : {}) }
			})
			if (!response.ok) throw new Error(await getErrorMessage(response, "Failed to add card"))
		},
		onSuccess: async () => {
			setAccessCode("")
			setEamuseAccessCode("")
			await queryClient.invalidateQueries({ queryKey: ["users", "cards"] })
			toast.success("Card added to your account")
		},
		onError: error => toast.error(error.message)
	})

	const unbindMutation = useMutation({
		mutationFn: async ({
			accessCode: value,
			eamuseAccessCode: eamuseValue
		}: {
			accessCode?: string
			eamuseAccessCode?: string
		}) => {
			const response = await api.users.cards.unbind.$post({
				json: {
					...(value ? { accessCode: value } : {}),
					...(eamuseValue ? { eamuseAccessCode: eamuseValue } : {})
				}
			})
			if (!response.ok) throw new Error(await getErrorMessage(response, "Failed to remove card"))
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["users", "cards"] })
			toast.success("Card removed from your account")
		},
		onError: error => toast.error(error.message)
	})

	const cards = cardsQuery.data ?? []
	const canSubmit =
		(accessCode.trim().length === 20 || /^E004[0-9A-Fa-f]{12}$/.test(eamuseAccessCode.trim())) &&
		!bindMutation.isPending

	const addCardSection = (
		<div className="border-border space-y-4 border-b pb-6">
			<div className="flex items-center justify-between gap-3">
				<div>
					<h3 className="text-base font-semibold">Add Card</h3>
					<p className="text-muted-foreground mt-1 text-sm">Bind another card to this account.</p>
				</div>
			</div>
			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
				<form
					className="space-y-3"
					onSubmit={event => {
						event.preventDefault()
						if (canSubmit)
							bindMutation.mutate({
								accessCode: accessCode.trim() || undefined,
								eamuseAccessCode: eamuseAccessCode.trim() || undefined
							})
					}}
				>
					<label htmlFor="account-card-number" className="text-sm font-medium">
						ALL.NET Access Code
					</label>
					<Input
						id="account-card-number"
						value={accessCode}
						onChange={event => setAccessCode(event.target.value)}
						placeholder="Enter ALL.NET access code"
						maxLength={20}
						inputMode="numeric"
						className="w-full"
					/>
					<label htmlFor="account-eamuse-code" className="text-sm font-medium">
						e-amusement Code (E004)
					</label>
					<Input
						id="account-eamuse-code"
						value={eamuseAccessCode}
						onChange={event => setEamuseAccessCode(event.target.value.toUpperCase())}
						placeholder="E004..."
						maxLength={16}
						className="w-full font-mono"
					/>
					<Button type="submit" className="w-full" disabled={!canSubmit} aria-label="Add card">
						{bindMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
						Add Card
					</Button>
				</form>
				<div className="text-muted-foreground space-y-2 text-sm lg:pt-7">
					<p className="text-foreground font-medium">Before you add a card</p>
					<ul className="list-disc space-y-1 pl-5">
						<li>Add the card here before using it to create a new game account.</li>
						<li>A card already bound to another account cannot be claimed.</li>
						<li>Additional cards are kept on the account for later use.</li>
						<li>Removing a card does not delete your game profiles or scores.</li>
					</ul>
				</div>
			</div>
		</div>
	)

	return (
		<div className="space-y-4">
			<Card className="rounded-md shadow-none">
				<CardHeader className="border-border flex items-center gap-2 border-b px-4 py-3 sm:px-6">
					<CreditCard className="text-muted-foreground h-5 w-5" />
					<div>
						<CardTitle className="text-lg">Card Management</CardTitle>
						<p className="text-muted-foreground mt-1 text-sm">Manage the cards bound to your account.</p>
					</div>
				</CardHeader>
				<CardContent className="space-y-4 p-4 sm:p-6">
					{addCardSection}
					<div className="space-y-3">
						<h3 className="text-base font-semibold">My Cards</h3>
						{cardsQuery.isLoading ? (
							<div className="text-muted-foreground flex items-center gap-2 py-6 text-sm">
								<LoaderCircle className="h-4 w-4 animate-spin" /> Loading cards...
							</div>
						) : cards.length === 0 ? (
							<p className="text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm">
								No cards bound yet.
							</p>
						) : (
							<div className="grid gap-3 lg:grid-cols-2">
								{cards.map(card => {
									const blocked = card.is_locked || card.is_banned
									return (
										<div key={`${card.card_type}-${card.id}`} className="bg-muted/30 overflow-hidden rounded-md border">
											<div className="flex items-center justify-between gap-3 border-b px-4 py-3">
												<span className="text-sm font-semibold">{card.is_primary ? "Primary Card" : "My Card"}</span>
												<Badge variant={blocked ? "destructive" : "secondary"} className="rounded-sm text-xs">
													{card.is_banned
														? "Banned"
														: card.is_locked
															? "Locked"
															: card.card_type === "allnet"
																? "ALL.NET"
																: "eAMUSEMENT"}
												</Badge>
											</div>
											<div className="divide-y text-sm">
												<div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-3 px-4 py-3">
													<span className="text-muted-foreground font-medium">
														{card.card_type === "allnet" ? "ALL.NET Access Code" : "e-amusement Code"}
													</span>
													<code className="truncate text-right text-xs sm:text-sm">
														{formatCardNumber(card.access_code)}
													</code>
												</div>
											</div>
											<div className="flex justify-end border-t px-4 py-3">
												<Button
													variant="destructive"
													size="sm"
													disabled={unbindMutation.isPending}
													onClick={() => {
														if (window.confirm("Remove this card from your account?"))
															unbindMutation.mutate(
																card.card_type === "allnet"
																	? { accessCode: card.access_code }
																	: { eamuseAccessCode: card.access_code }
															)
													}}
												>
													<Trash2 className="h-4 w-4" /> Remove
												</Button>
											</div>
										</div>
									)
								})}
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
