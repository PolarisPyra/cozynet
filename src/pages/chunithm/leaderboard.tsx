import { useState } from "react"

import LeaderboardCard from "@/components/chunithm/leaderboard-card"
import Header from "@/components/common/header"
import ResponsiveGrid from "@/components/common/responsive-grid"
import Spinner from "@/components/common/spinner"
import { useChunithmVersion, useLeaderboard } from "@/hooks/chunithm"
import { Body, Container } from "@/pages/layout/layout"

const ChunithmLeaderboard = () => {
	const version = useChunithmVersion()
	const { data: leaderboard = [], isLoading: isLoadingLeaderboard } = useLeaderboard()
	const [searchQuery, setSearchQuery] = useState("")

	// Filter out players with null userName or playerRating and convert to the expected type
	const validLeaderboard = leaderboard
		.filter(player => player.userName !== null && player.playerRating !== null)
		.map(player => ({
			userName: player.userName!,
			playerRating: player.playerRating!,
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
	<div className="relative flex-1 overflow-auto">
		<Header title="Leaderboard" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<Spinner size={24} />
		</div>
	</div>
)

const NoVersionState = () => (
	<div className="relative flex-1 overflow-auto">
		<Header title="Leaderboard" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<p className="text-primary">Please set your Chunithm version in settings first</p>
		</div>
	</div>
)

export default ChunithmLeaderboard
