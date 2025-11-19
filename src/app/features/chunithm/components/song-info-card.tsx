import { useState } from "react"

import { ArrowLeft, Medal, Star } from "lucide-react"

import { useScoreLeaderboard } from "@/app/features/chunithm/hooks/use-score-leaderboard"
import { CardImage } from "@/app/shared/components/common/card-image"
import Spinner from "@/app/shared/components/common/spinner"
import { Badge } from "@/app/shared/components/ui/badge"
import { Button } from "@/app/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/shared/components/ui/dialog"
import { useCurrentUser } from "@/app/shared/hooks/users/use-current-user"
import { StaticMusic } from "@/app/shared/types"
import { chunithmBadgeColors, levelToStars } from "@/app/shared/utils/chunithm"
import { CDN } from "@/app/shared/utils/constants"
import { getChunithmLogo } from "@/app/shared/utils/version-logos"

export const SongInfoCard = function ({ score, levelColorBadge, jacketArt }: CardProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [selectedChartId, setSelectedChartId] = useState<number | null>(null)
	const song = score
	const logoUrl = getChunithmLogo.getLogo(song.version)
	const currentUser = useCurrentUser()

	const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useScoreLeaderboard(
		song.songId ?? 0,
		selectedChartId ?? 0,
		100,
		isDialogOpen && selectedChartId !== null
	)

	const formatLevel = (level: number) => {
		return level.toFixed(1)
	}

	const handleLeaderboardClick = (chartId: number) => {
		setSelectedChartId(chartId)
	}

	const handleBackToSelection = () => {
		setSelectedChartId(null)
	}

	const handleDialogClose = (open: boolean) => {
		setIsDialogOpen(open)
		if (!open) {
			// Reset to difficulty selection when dialog closes
			setSelectedChartId(null)
		}
	}

	return (
		<div className="bg-card border-border flex min-h-[180px] flex-col gap-3 rounded-sm border p-4 shadow-sm transition-shadow hover:shadow-md">
			<div className="flex items-start gap-3">
				<CardImage src={`${CDN}/${jacketArt}/${song.jacketPath}`} alt={song.title ?? ""} width={72} height={72} />
				<div className="min-w-0 flex-1">
					<div className="text-foreground mb-1 text-xs leading-tight font-bold whitespace-nowrap sm:text-sm md:text-base">
						{song.title}
					</div>
					<div className="text-muted-foreground mb-0.5 line-clamp-1 text-[10px] sm:text-xs">
						{song.artist || "Unknown"}
					</div>
					<div className="text-muted-foreground text-xs whitespace-nowrap">{song.genre || "N/A"}</div>
				</div>
			</div>

			<div className="mt-3 flex min-h-[2rem] flex-wrap items-start gap-2">
				{(song.charts || []).map((c, idx) => {
					const isWorldsEnd = c.chartId === 5
					const starCount = levelToStars(c.level)
					return (
						<Badge
							key={`${String(c.chartId)}-${String(c.level)}-${idx}`}
							variant="outline"
							className={`flex min-h-[1.5rem] items-center rounded-sm border-2 px-2.5 py-1 text-xs font-bold ${
								levelColorBadge ? levelColorBadge(c.chartId ?? undefined) : chunithmBadgeColors(c.chartId ?? 0)
							}`}
						>
							{isWorldsEnd ? (
								<div className="flex items-center gap-0.5">
									{Array.from({ length: starCount }, (_, i) => (
										<Star key={i} className="h-3 w-3 fill-current" />
									))}
								</div>
							) : (
								formatLevel(c.level!)
							)}
						</Badge>
					)
				})}
			</div>

			{logoUrl && (
				<div className="border-border/50 flex justify-end gap-2 border-t pt-2.5">
					<Badge variant="secondary" className="h-6 rounded-sm p-1">
						<img src={logoUrl} alt="Version Logo" className="max-h-5 w-auto object-contain" />
					</Badge>
					<Badge
						variant="secondary"
						className="hover:bg-muted/70 h-6 cursor-pointer rounded-sm px-1.5 transition-colors"
						onClick={() => setIsDialogOpen(true)}
					>
						<Medal className="h-4 w-4" />
					</Badge>
				</div>
			)}

			<Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
				<DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
					{selectedChartId === null ? (
						<>
							<DialogHeader>
								<DialogTitle>View Leaderboard</DialogTitle>
								<DialogDescription>Select a difficulty to view the leaderboard for this song</DialogDescription>
							</DialogHeader>
							<div className="grid gap-3 py-4">
								{(song.charts || []).map((c, idx) => {
									const isWorldsEnd = c.chartId === 5
									const starCount = levelToStars(c.level)
									const chartName = ["Basic", "Advanced", "Expert", "Master", "Ultima", "World's End"][c.chartId ?? 0]

									return (
										<Button
											key={`${String(c.chartId)}-${String(c.level)}-${idx}`}
											variant="outline"
											className="flex h-auto items-center justify-between p-4"
											onClick={() => handleLeaderboardClick(c.chartId ?? 0)}
										>
											<span className="text-base font-semibold">{chartName}</span>
											<Badge
												variant="outline"
												className={`flex min-h-[1.5rem] items-center rounded-sm border-2 px-2.5 py-1 text-xs font-bold ${
													levelColorBadge
														? levelColorBadge(c.chartId ?? undefined)
														: chunithmBadgeColors(c.chartId ?? 0)
												}`}
											>
												{isWorldsEnd ? (
													<div className="flex items-center gap-0.5">
														{Array.from({ length: starCount }, (_, i) => (
															<Star key={i} className="h-3 w-3 fill-current" />
														))}
													</div>
												) : (
													formatLevel(c.level!)
												)}
											</Badge>
										</Button>
									)
								})}
							</div>
						</>
					) : (
						<>
							<DialogHeader>
								<div className="flex items-center gap-2">
									<Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBackToSelection}>
										<ArrowLeft className="h-4 w-4" />
									</Button>
									<div className="flex flex-col gap-1">
										<DialogTitle>Song Leaderboard</DialogTitle>
										<DialogDescription>{song.title}</DialogDescription>
									</div>
								</div>
							</DialogHeader>

							{isLoadingLeaderboard ? (
								<div className="flex h-64 items-center justify-center">
									<Spinner />
								</div>
							) : leaderboardData ? (
								<div className="space-y-3 pb-4">
									{leaderboardData.chart && (
										<div className="-mt-2 mb-2">
											<Badge
												variant="outline"
												className={`${chunithmBadgeColors(selectedChartId)} rounded-sm border-2 px-3 py-1 text-sm font-bold`}
											>
												Level {leaderboardData.chart.level.toFixed(1)}
											</Badge>
										</div>
									)}

									<p className="text-muted-foreground text-sm">Top {leaderboardData.total} Scores</p>

									{leaderboardData.leaderboard.length === 0 ? (
										<div className="bg-muted/50 rounded-sm p-8 text-center">
											<p className="text-muted-foreground">No scores recorded yet</p>
										</div>
									) : (
										<div className="space-y-2">
											{leaderboardData.leaderboard.map((entry, index) => {
												const isUserScore = entry.userId === currentUser.id
												const rank = index + 1
												const getRankBgColor = () => {
													if (rank === 1) return "bg-yellow-500"
													if (rank === 2) return "bg-slate-400"
													if (rank === 3) return "bg-teal-500"
													return "bg-muted"
												}

												return (
													<div
														key={`${entry.userId}-${index}`}
														className={`rounded-sm p-3 transition-colors ${
															isUserScore
																? "bg-primary/20 border-primary hover:bg-primary/30 border-2"
																: "bg-muted/30 hover:bg-muted/50"
														}`}
													>
														<div className="flex items-center justify-between gap-4">
															<div className="flex items-center gap-3">
																<div
																	className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm text-sm font-bold text-white ${getRankBgColor()}`}
																>
																	{rank}
																</div>
																<div>
																	<p
																		className={`text-sm font-semibold ${isUserScore ? "text-primary" : "text-foreground"}`}
																	>
																		{entry.username}
																	</p>
																	<div className="mt-1 flex items-center gap-2">
																		{entry.isFullCombo > 0 && entry.isAllJustice === 0 && (
																			<Badge variant="secondary" className="text-xs">
																				FC
																			</Badge>
																		)}
																		{entry.isAllJustice > 0 && (
																			<Badge variant="secondary" className="text-xs">
																				AJ
																			</Badge>
																		)}
																	</div>
																</div>
															</div>
															<div className="text-right">
																<p className="text-foreground text-lg font-bold">{entry.score.toLocaleString()}</p>
																<p className="text-muted-foreground text-xs">
																	{new Date(entry.playDate).toLocaleDateString()}
																</p>
															</div>
														</div>
													</div>
												)
											})}
										</div>
									)}
								</div>
							) : (
								<div className="bg-muted/50 rounded-sm p-8 text-center">
									<p className="text-muted-foreground">Failed to load leaderboard</p>
								</div>
							)}
						</>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default SongInfoCard

type CardProps = {
	score: StaticMusic
	levelColorBadge?: (chartId?: number | undefined) => string
	className?: string
	jacketArt?: string
}
