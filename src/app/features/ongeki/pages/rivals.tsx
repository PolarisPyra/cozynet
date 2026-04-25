import { useMemo, useState } from "react"

import { toast } from "sonner"

import { useAddRival, useOngekiVersion, useRemoveRival, useRivalCount, useRivalUsers, useRivals } from "@/app/features/ongeki/hooks"
import Header from "@/app/shared/components/common/header"
import { Pagination } from "@/app/shared/components/common/pagination"
import { RivalInfoCard } from "@/app/shared/components/common/rival-info-card"
import Spinner from "@/app/shared/components/common/spinner"
import { STANDARD_PAGE_SIZE } from "@/app/shared/constants/pagination"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import { Body, CardGrid, Container } from "@/app/shared/pages/layout/layout"

export function OngekiRivals() {
	const [searchQuery, setSearchQuery] = useState("")

	const version = useOngekiVersion()
	const { data: rivalIds = [], isLoading: isLoadingRivals } = useRivals()
	const { data: rivalCount = 0, isLoading: isLoadingCount } = useRivalCount()
	const { data: users = [], isLoading: isLoadingUsers } = useRivalUsers()
	const { mutate: addRival } = useAddRival()
	const { mutate: removeRival } = useRemoveRival()

	const filtered = useMemo(
		() => users.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase())),
		[users, searchQuery]
	)

	const { page, setPage, totalPages, paged, hasMore } = usePagination(filtered, STANDARD_PAGE_SIZE, [searchQuery])

	const handleAdd = (id: number) => {
		if (rivalCount >= 3) return toast.error("Max 3 rivals")
		addRival(id, { onSuccess: () => toast.success("Added"), onError: () => toast.error("Failed") })
	}

	const handleRemove = (id: number) => {
		removeRival(id, { onSuccess: () => toast.success("Removed"), onError: () => toast.error("Failed") })
	}

	const isLoading = isLoadingRivals || isLoadingCount || isLoadingUsers

	if (!version) {
		return (
			<Container>
				<Header title="Rivals" />
				<Body>
					<div className="text-muted-foreground py-20 text-center">Set your version first</div>
				</Body>
			</Container>
		)
	}

	if (isLoading) {
		return (
			<Container>
				<Header title="Rivals" />
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
				title={`Rivals ${rivalCount}/3`}
				searchProps={{
					items: users.map(u => ({ id: u.id, title: u.username })),
					onSelect: setSearchQuery,
					placeholder: "Search...",
					emptyMessage: "No users.",
					groupLabel: "Users"
				}}
			/>
			<Body>
				<CardGrid>
					{paged.map(user => (
						<RivalInfoCard
							key={user.id}
							user={user}
							isRival={rivalIds.includes(user.id)}
							onAddRival={handleAdd}
							onRemoveRival={handleRemove}
							rivalCount={rivalCount}
						/>
					))}
				</CardGrid>

				{filtered.length === 0 && <div className="text-muted-foreground py-20 text-center">No users found</div>}
				{hasMore && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
			</Body>
		</Container>
	)
}
