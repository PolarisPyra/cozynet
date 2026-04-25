import RivalCard from "@/app/features/chunithm/components/rival-card"
import { useChunithmVersion } from "@/app/features/chunithm/hooks"
import useRivalsManagement from "@/app/features/chunithm/hooks/use-rivals-management"
import Header from "@/app/shared/components/common/header"
import { Pagination } from "@/app/shared/components/common/pagination"
import Spinner from "@/app/shared/components/common/spinner"
import { STANDARD_PAGE_SIZE } from "@/app/shared/constants/pagination"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import { Body, CardGrid, Container } from "@/app/shared/pages/layout/layout"

export default function ChunithmRivals() {
	const version = useChunithmVersion()
	const { rivalIds, rivalCount, users, filteredRivals, setSearchQuery, handleAddRival, handleRemoveRival, isLoading } =
		useRivalsManagement()

	const { page, setPage, totalPages, paged, hasMore } = usePagination(filteredRivals, STANDARD_PAGE_SIZE)

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
					items: users.map(u => ({ id: u.id, title: u.username || "" })),
					onSelect: setSearchQuery,
					placeholder: "Search...",
					emptyMessage: "No users.",
					groupLabel: "Users"
				}}
			/>
			<Body>
				<CardGrid>
					{paged.map(rival => (
						<RivalCard
							key={rival.id}
							score={rival}
							rivalIds={rivalIds}
							rivalCount={rivalCount}
							onAddRival={handleAddRival}
							onRemoveRival={handleRemoveRival}
						/>
					))}
				</CardGrid>

				{filteredRivals.length === 0 && <div className="text-muted-foreground py-20 text-center">No users found</div>}
				{hasMore && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
			</Body>
		</Container>
	)
}
