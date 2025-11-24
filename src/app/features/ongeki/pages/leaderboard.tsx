import { useState } from "react"

import LeaderboardCard from "@/app/features/ongeki/components/leaderboard-card"
import { useLeaderboard, useOngekiVersion } from "@/app/features/ongeki/hooks"
import Header from "@/app/shared/components/common/header"
import ResponsiveGrid from "@/app/shared/components/common/responsive-grid"
import Spinner from "@/app/shared/components/common/spinner"
import { Body, Container } from "@/app/shared/pages/layout/layout"

const OngekiLeaderboard = () => {
	const version = useOngekiVersion()
	const { data: leaderboard = [], isLoading: isLoadingLeaderboard } = useLeaderboard()
	const [searchQuery, setSearchQuery] = useState("")

	const validLeaderboard = leaderboard
		.filter(player => player.userName !== null && player.playerRating !== null)
		.map(player => ({
			userName: player.userName!,
			playerRating: player.playerRating!,
			newPlayerRating: player.newPlayerRating,
			rank: player.rank
		}))

	const filteredLeaderboard = validLeaderboard.filter(player =>
		player.userName?.toLowerCase().includes(searchQuery.toLowerCase())
	)

	const searchItems = validLeaderboard.map(player => ({
		id: player.rank,
		title: player.userName || ""
	}))

	if (isLoadingLeaderboard) return <LoadingState />
	if (!version) return <NoVersionState />

	return (
		<Container>
			<Header
				title="Leaderboard"
				searchProps={{
					items: searchItems,
					searchQuery,
					onSearchChange: setSearchQuery,
					placeholder: "Search players...",
					emptyMessage: "No players found.",
					groupLabel: "Players"
				}}
			/>
			<Body>
				<ResponsiveGrid items={filteredLeaderboard} CardComponent={LeaderboardCard} />
			</Body>
		</Container>
	)
}

const LoadingState = () => (
	<Container>
		<Header title="Leaderboard" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<Spinner size={24} />
		</div>
	</Container>
)

const NoVersionState = () => (
	<Container>
		<Header title="Leaderboard" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<p className="text-primary">Please set your Ongeki version in settings first</p>
		</div>
	</Container>
)

export default OngekiLeaderboard
