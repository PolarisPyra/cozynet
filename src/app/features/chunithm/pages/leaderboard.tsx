import { useMemo, useState } from "react"

import LeaderboardCard from "@/app/features/chunithm/components/leaderboard-card"
import { useChunithmVersion, useLeaderboard } from "@/app/features/chunithm/hooks"
import Header from "@/app/shared/components/common/header"
import { Pagination } from "@/app/shared/components/common/pagination"
import Spinner from "@/app/shared/components/common/spinner"
import { STANDARD_PAGE_SIZE } from "@/app/shared/constants/pagination"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import { Body, CardGrid, Container } from "@/app/shared/pages/layout/layout"

export default function ChunithmLeaderboard() {
	const version = useChunithmVersion()
	const { data: leaderboard = [], isLoading } = useLeaderboard()
	const [searchQuery, setSearchQuery] = useState("")

	const valid = useMemo(
		() =>
			leaderboard
				.filter(p => p.userName && p.playerRating !== null)
				.map(p => ({ userName: p.userName!, playerRating: p.playerRating!, rank: p.rank })),
		[leaderboard]
	)

	const filtered = useMemo(
		() => valid.filter(p => p.userName.toLowerCase().includes(searchQuery.toLowerCase())),
		[valid, searchQuery]
	)

	const { page, setPage, totalPages, paged, hasMore } = usePagination(filtered, STANDARD_PAGE_SIZE, [searchQuery])

	if (!version) {
		return (
			<Container>
				<Header title="Leaderboard" />
				<Body>
					<div className="text-muted-foreground py-20 text-center">Set your version first</div>
				</Body>
			</Container>
		)
	}

	if (isLoading) {
		return (
			<Container>
				<Header title="Leaderboard" />
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
				title="Leaderboard"
				searchProps={{
					items: valid.map(p => ({ id: p.rank, title: p.userName })),
					onSelect: setSearchQuery,
					placeholder: "Search...",
					emptyMessage: "No players.",
					groupLabel: "Players"
				}}
			/>
			<Body>
				<CardGrid>
					{paged.map(player => (
						<LeaderboardCard key={player.rank} score={player} />
					))}
				</CardGrid>

				{filtered.length === 0 && <div className="text-muted-foreground py-20 text-center">No players found</div>}
				{hasMore && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
			</Body>
		</Container>
	)
}
