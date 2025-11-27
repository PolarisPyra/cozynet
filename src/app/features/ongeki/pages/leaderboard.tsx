import { useMemo, useState } from "react"

import LeaderboardCard from "@/app/features/ongeki/components/leaderboard-card"
import { useLeaderboard, useOngekiVersion } from "@/app/features/ongeki/hooks"
import Header from "@/app/shared/components/common/header"
import { Pagination } from "@/app/shared/components/common/pagination"
import Spinner from "@/app/shared/components/common/spinner"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import { Body, Container } from "@/app/shared/pages/layout/layout"

export default function OngekiLeaderboard() {
	const version = useOngekiVersion()
	const { data: leaderboard = [], isLoading } = useLeaderboard()
	const [searchQuery, setSearchQuery] = useState("")

	const valid = useMemo(
		() =>
			leaderboard
				.filter(p => p.userName && p.playerRating !== null)
				.map(p => ({ userName: p.userName!, playerRating: p.playerRating!, newPlayerRating: p.newPlayerRating, rank: p.rank })),
		[leaderboard]
	)

	const filtered = useMemo(
		() => valid.filter(p => p.userName.toLowerCase().includes(searchQuery.toLowerCase())),
		[valid, searchQuery]
	)

	const { page, setPage, totalPages, paged, total, hasMore } = usePagination(filtered, 20, [searchQuery])

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
					items: valid.slice(0, 100).map(p => ({ id: p.rank, title: p.userName })),
					searchQuery,
					onSearchChange: setSearchQuery,
					placeholder: "Search...",
					emptyMessage: "No players.",
					groupLabel: "Players"
				}}
			/>
			<Body>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{paged.map(player => (
						<LeaderboardCard key={player.rank} score={player} />
					))}
				</div>

				{filtered.length === 0 && <div className="text-muted-foreground py-20 text-center">No players found</div>}

				{hasMore && <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />}
			</Body>
		</Container>
	)
}
