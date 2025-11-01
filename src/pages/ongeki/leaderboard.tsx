import { useState } from "react"

import Header from "@/components/common/header"
import { OngekiRatingColors } from "@/components/common/rating-colors"
import ResponsiveGrid from "@/components/common/responsive-grid"
import Spinner from "@/components/common/spinner"
import { useLeaderboard, useOngekiVersion } from "@/hooks/ongeki"
import { Body, Container } from "@/pages/layout/layout"

interface LeaderboardPlayer {
	userName: string
	playerRating: number
	newPlayerRating: number | null
	rank: number
}

export function OngekiLeaderboard() {
	const [searchQuery, setSearchQuery] = useState("")

	const { data: leaderboard = [], isLoading: isLoadingLeaderboard } = useLeaderboard()
	const version = useOngekiVersion()
	const isRefreshOrAbove = Number(version) >= 8

	// Filter out players with null userName or playerRating and convert to the expected type
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

	const LeaderboardCard = ({ score }: { score: LeaderboardPlayer }) => {
		const ratingValue =
			isRefreshOrAbove && score.newPlayerRating !== null ? score.newPlayerRating / 1000 : score.playerRating / 100

		return (
			<div className="bg-card flex items-center justify-between rounded-sm border p-4 transition-colors">
				<div className="flex items-center gap-4">
					<span className="text-primary text-2xl font-bold">#{score.rank}</span>
					<div>
						<div className="text-foreground font-medium">{score.userName}</div>
						<div className="flex items-center gap-2">
							<span className="text-muted-foreground text-sm">Rating:</span>
							<OngekiRatingColors
								rating={ratingValue}
								decimals={isRefreshOrAbove ? 3 : 2}
								isRefresh={isRefreshOrAbove}
							/>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (isLoadingLeaderboard) {
		return (
			<Container>
				<Header title="Leaderboard" />
				<div className="flex h-[calc(100vh-64px)] items-center justify-center">
					<Spinner />
				</div>
			</Container>
		)
	}

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
			{version ? (
				<Body>
					<ResponsiveGrid items={filteredLeaderboard} CardComponent={LeaderboardCard} />
				</Body>
			) : (
				<div className="flex h-[calc(100vh-64px)] items-center justify-center">
					<p className="text-primary">Please set your Ongeki version in settings first</p>
				</div>
			)}
		</Container>
	)
}
