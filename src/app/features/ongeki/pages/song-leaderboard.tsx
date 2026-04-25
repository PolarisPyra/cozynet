import { useParams } from "react-router-dom"

import { useScoreLeaderboard } from "@/app/features/ongeki/hooks/use-score-leaderboard"
import { useOngekiVersion } from "@/app/features/ongeki/hooks/use-version"
import { OngekiRatingColors } from "@/app/features/ongeki/components/rating-colors"
import Header from "@/app/shared/components/common/header"
import Spinner from "@/app/shared/components/common/spinner"
import { Badge } from "@/app/shared/components/ui/badge"
import { Card } from "@/app/shared/components/ui/card"
import { Body, Container } from "@/app/shared/pages/layout/layout"
import { CDN } from "@/app/shared/utils/constants"
import { calculateOngekiGekForceRating, calculateOngekiRating, ongekiBadgeColors } from "@/app/shared/utils/ongeki"

const OngekiSongLeaderboard = () => {
	const { musicId, chartId } = useParams<{ musicId: string; chartId: string }>()
	const version = useOngekiVersion()
	const { data, isLoading } = useScoreLeaderboard(parseInt(musicId || "0"), parseInt(chartId || "0"))

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
	const badgeColor = ongekiBadgeColors(chartIdNum)
	const isRefresh = Number(version) >= 8

	return (
		<Container>
			<Header title="Song Leaderboard" />
			<Body className="mx-auto max-w-5xl">
				<Card className="mb-6 p-6">
					<div className="flex items-start gap-4">
						<img
							src={`${CDN}/ongeki/jacket/${data.song.jacketPath}`}
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

				<div className="space-y-2">
					<h3 className="text-foreground mb-4 text-lg font-semibold">Top Scores ({data.total})</h3>
					{data.leaderboard.length === 0 ? (
						<Card className="p-8 text-center">
							<p className="text-muted-foreground">No scores recorded yet</p>
						</Card>
					) : (
						data.leaderboard.map((entry, index) => {
							const level = data.chart?.level ?? 0
							const rating =
								level > 0
									? isRefresh
										? calculateOngekiGekForceRating(
												level,
												entry.score,
												entry.isFullCombo ?? 0,
												entry.isAllBreak ?? 0,
												entry.isFullBell ?? 0
											) / 1000
										: calculateOngekiRating(level, entry.score) / 100
									: null

							return (
								<Card key={`${entry.userId}-${index}`} className="hover:bg-muted/50 p-4 transition-colors">
									<div className="flex items-center justify-between gap-4">
										<div className="flex items-center gap-4">
											<div className="text-muted-foreground min-w-[2rem] text-center text-lg font-bold">
												#{index + 1}
											</div>
											<div>
												<p className="text-foreground font-semibold">{entry.username}</p>
												<div className="mt-1 flex items-center gap-2">
													{entry.isAllBreak > 0 && (
														<Badge variant="secondary" className="text-xs">
															AB
														</Badge>
													)}
													{entry.isFullBell > 0 && (
														<Badge variant="secondary" className="text-xs">
															FB
														</Badge>
													)}
													{entry.isFullCombo > 0 && entry.isAllBreak === 0 && (
														<Badge variant="secondary" className="text-xs">
															FC
														</Badge>
													)}
												</div>
											</div>
										</div>
										<div className="text-right">
											<p className="text-foreground text-xl font-bold">{entry.score.toLocaleString()}</p>
											{rating !== null && version && (
												<div className="mt-0.5">
													<OngekiRatingColors
														rating={rating}
														version={version}
														decimals={isRefresh ? 3 : 2}
													/>
												</div>
											)}
											<p className="text-muted-foreground text-xs">
												{new Date(entry.playDate).toLocaleDateString()}
											</p>
										</div>
									</div>
								</Card>
							)
						})
					)}
				</div>
			</Body>
		</Container>
	)
}

export default OngekiSongLeaderboard
