import { useParams } from "react-router-dom"

import { useScoreLeaderboard } from "@/app/features/chunithm/hooks/use-score-leaderboard"
import Header from "@/app/shared/components/common/header"
import Spinner from "@/app/shared/components/common/spinner"
import { Badge } from "@/app/shared/components/ui/badge"
import { Card } from "@/app/shared/components/ui/card"
import { Body, Container } from "@/app/shared/pages/layout/layout"
import { chunithmBadgeColors } from "@/app/shared/utils/chunithm"
import { CDN } from "@/app/shared/utils/constants"

const ChunithmSongLeaderboard = () => {
	const { musicId, chartId } = useParams<{ musicId: string; chartId: string }>()
	const { data, isLoading } = useScoreLeaderboard(
		parseInt(musicId || "0"),
		parseInt(chartId || "0")
	)

	if (isLoading) {
		return (
			<Container>
				<Header title="Song Leaderboard" />
				<div className="flex h-[calc(100vh-64px)] items-center justify-center">
					<Spinner />
				</div>
			</Container>
		)
	}

	if (!data || !data.song) {
		return (
			<Container>
				<Header title="Song Leaderboard" />
				<Body className="flex items-center justify-center">
					<p className="text-muted-foreground">No data available</p>
				</Body>
			</Container>
		)
	}

	const chartIdNum = parseInt(chartId || "0")
	const badgeColor = chunithmBadgeColors(chartIdNum)

	return (
		<Container>
			<Header title="Song Leaderboard" />
			<Body className="mx-auto max-w-5xl">
				{/* Song Header */}
				<Card className="mb-6 p-6">
					<div className="flex items-start gap-4">
						<img
							src={`${CDN}/chunithm/jacket/${data.song.jacketPath}`}
							alt={data.song.title}
							className="h-24 w-24 rounded-sm object-cover"
						/>
						<div className="flex-1">
							<h2 className="text-foreground mb-2 text-2xl font-bold">{data.song.title}</h2>
							<p className="text-muted-foreground mb-3 text-sm">{data.song.artist}</p>
							{data.chart && (
								<Badge
									variant="outline"
									className={`${badgeColor} rounded-sm border-2 px-3 py-1 text-sm font-bold`}
								>
									Level {data.chart.level.toFixed(1)}
								</Badge>
							)}
						</div>
					</div>
				</Card>

				{/* Leaderboard */}
				<div className="space-y-2">
					<h3 className="text-foreground mb-4 text-lg font-semibold">
						Top Scores ({data.total})
					</h3>
					{data.leaderboard.length === 0 ? (
						<Card className="p-8 text-center">
							<p className="text-muted-foreground">No scores recorded yet</p>
						</Card>
					) : (
						data.leaderboard.map((entry, index) => (
							<Card
								key={`${entry.userId}-${index}`}
								className="hover:bg-muted/50 p-4 transition-colors"
							>
								<div className="flex items-center justify-between gap-4">
									<div className="flex items-center gap-4">
										<div className="text-muted-foreground min-w-[2rem] text-center text-lg font-bold">
											#{index + 1}
										</div>
										<div>
											<p className="text-foreground font-semibold">{entry.username}</p>
											<div className="mt-1 flex items-center gap-2">
												{entry.isFullCombo && (
													<Badge variant="secondary" className="text-xs">
														FC
													</Badge>
												)}
												{entry.isAllJustice && (
													<Badge variant="secondary" className="text-xs">
														AJ
													</Badge>
												)}
												<span className="text-muted-foreground text-xs">
													{entry.rank}
												</span>
											</div>
										</div>
									</div>
									<div className="text-right">
										<p className="text-foreground text-xl font-bold">
											{entry.score.toLocaleString()}
										</p>
										<p className="text-muted-foreground text-xs">
											{new Date(entry.playDate).toLocaleDateString()}
										</p>
									</div>
								</div>
							</Card>
						))
					)}
				</div>
			</Body>
		</Container>
	)
}

export default ChunithmSongLeaderboard

