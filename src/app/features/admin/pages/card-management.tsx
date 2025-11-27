import { useEffect, useMemo, useState } from "react"

import { useQuery } from "@tanstack/react-query"
import { CreditCard } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { useAdmin } from "@/app/features/admin/hooks"
import { hasAdminAccess } from "@/app/features/admin/utils"
import Header from "@/app/shared/components/common/header"
import { Pagination } from "@/app/shared/components/common/pagination"
import Spinner from "@/app/shared/components/common/spinner"
import { Body, Container } from "@/app/shared/pages/layout/layout"
import { DB } from "@/app/shared/types"
import { api } from "@/app/shared/utils"

const ITEMS_PER_PAGE = 20

const CardManagement = () => {
	const { data: systemAdmin, isLoading: isLoadingAdmin } = useAdmin()
	const adminPerms = hasAdminAccess(systemAdmin)
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()
	const [page, setPage] = useState(1)

	const searchQuery = searchParams.get("search") || ""

	const { data: cardsData, isLoading: isLoadingCards } = useQuery<{ users: DB.AimeCard[] }>({
		queryKey: ["admin", "aime-cards"],
		queryFn: async () => {
			const response = await api.aime.aime_card.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch cards")
			}
			return await response.json()
		},
		enabled: adminPerms
	})

	const { data: usersData, isLoading: isLoadingUsers } = useQuery<{ users: Omit<DB.AimeUser, "password">[] }>({
		queryKey: ["admin", "aime-users"],
		queryFn: async () => {
			const response = await api.aime.aime_user.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch users")
			}
			return await response.json()
		},
		enabled: adminPerms
	})

	useEffect(() => {
		if (!isLoadingAdmin && !adminPerms) {
			navigate("/home", { replace: true })
		}
	}, [systemAdmin, adminPerms, navigate, isLoadingAdmin])

	// Reset to page 1 when search changes
	useEffect(() => {
		setPage(1)
	}, [searchQuery])

	const isLoading = isLoadingCards || isLoadingUsers
	const allCards = cardsData?.users || []
	const users = usersData?.users || []

	const getUserById = (userId: number) => {
		return users.find(u => u.id === userId)
	}

	// Filter cards based on search query
	const filteredCards = useMemo(() => {
		if (!searchQuery.trim()) return allCards

		const normalizedQuery = searchQuery.trim().toLowerCase()

		return allCards.filter(card => {
			const user = getUserById(card.user)
			const username = user?.username || ""
			const accessCode = card.access_code || ""
			const idm = card.idm || ""
			const cardId = card.id.toString()

			return (
				username.toLowerCase().includes(normalizedQuery) ||
				accessCode.toLowerCase().includes(normalizedQuery) ||
				idm.toLowerCase().includes(normalizedQuery) ||
				cardId.includes(normalizedQuery) ||
				card.user.toString().includes(normalizedQuery)
			)
		})
	}, [allCards, searchQuery, users])

	// Paginate filtered cards
	const totalPages = Math.max(1, Math.ceil(filteredCards.length / ITEMS_PER_PAGE))
	const paginatedCards = useMemo(() => {
		const start = (page - 1) * ITEMS_PER_PAGE
		return filteredCards.slice(start, start + ITEMS_PER_PAGE)
	}, [filteredCards, page])

	// Prepare search items for the search component
	const searchItems = useMemo(() => {
		return users
			.filter(user => user.username)
			.map(user => ({
				id: user.id,
				title: user.username || ""
			}))
	}, [users])

	if (isLoadingAdmin) {
		return (
			<Container>
				<Header title="Card Management" />
				<div className="flex h-64 items-center justify-center">
					<Spinner />
				</div>
			</Container>
		)
	}

	if (!adminPerms) {
		return null
	}

	return (
		<Container>
			<Header
				title="Card Management"
				searchProps={{
					items: searchItems,
					searchQuery,
					onSearchChange: value => setSearchParams({ search: value }),
					placeholder: "Search cards...",
					emptyMessage: "No cards found.",
					groupLabel: "Users"
				}}
			/>
			<Body>
				<div className="bg-card text-card-foreground space-y-4 rounded-sm p-6">
					<div className="border-border flex items-center justify-between border-b pb-3">
						<div className="flex items-center gap-2">
							<CreditCard className="text-blue-500" />
							<h2 className="text-lg font-semibold">Aime Cards</h2>
						</div>
						{searchQuery && (
							<div className="text-muted-foreground text-sm">
								{filteredCards.length} {filteredCards.length === 1 ? "card" : "cards"} found
							</div>
						)}
					</div>

					{isLoading ? (
						<div className="flex h-64 items-center justify-center">
							<Spinner />
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<table className="w-full border-collapse">
									<thead>
										<tr className="border-b">
											<th className="p-3 text-left text-sm font-semibold">ID</th>
											<th className="p-3 text-left text-sm font-semibold">User</th>
											<th className="p-3 text-left text-sm font-semibold">Access Code</th>
											<th className="p-3 text-left text-sm font-semibold">Created</th>
											<th className="p-3 text-left text-sm font-semibold">Last Login</th>
										</tr>
									</thead>
									<tbody>
										{paginatedCards.length === 0 ? (
											<tr>
												<td colSpan={5} className="text-muted-foreground p-8 text-center">
													{searchQuery ? "No cards found matching your search" : "No cards found"}
												</td>
											</tr>
										) : (
											paginatedCards.map(card => {
												const user = getUserById(card.user)
												return (
													<tr key={card.id} className="hover:bg-muted/50 border-b transition-colors">
														<td className="p-3 text-sm font-medium">{card.id}</td>
														<td className="p-3 text-sm">
															{user ? (
																<span>
																	<span className="font-medium">{user.username}</span>
																	<span className="text-muted-foreground ml-1">(ID: {user.id})</span>
																</span>
															) : (
																<span className="text-muted-foreground">User ID: {card.user}</span>
															)}
														</td>
														<td className="p-3 font-mono text-sm">{card.access_code || ""}</td>
														<td className="p-3 text-sm">
															{card.created_date ? new Date(card.created_date).toLocaleDateString() : ""}
														</td>
														<td className="p-3 text-sm">
															{card.last_login_date ? new Date(card.last_login_date).toLocaleDateString() : ""}
														</td>
													</tr>
												)
											})
										)}
									</tbody>
								</table>
							</div>

							{filteredCards.length > ITEMS_PER_PAGE && (
								<Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
							)}
						</>
					)}
				</div>
			</Body>
		</Container>
	)
}

export default CardManagement
