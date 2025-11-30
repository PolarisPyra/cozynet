import { useState } from "react"

import { ArrowLeft, Medal } from "lucide-react"

import { useOngekiVersion } from "@/app/features/ongeki/hooks"
import { useScoreLeaderboard } from "@/app/features/ongeki/hooks/use-score-leaderboard"
import { CardImage } from "@/app/shared/components/common/card-image"
import Spinner from "@/app/shared/components/common/spinner"
import { Badge } from "@/app/shared/components/ui/badge"
import { Button } from "@/app/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/shared/components/ui/dialog"
import { Separator } from "@/app/shared/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/shared/components/ui/tooltip"
import { useCurrentUser } from "@/app/shared/hooks/users/use-current-user"
import { StaticMusic } from "@/app/shared/types"
import { CDN } from "@/app/shared/utils/constants"
import {
	calculateOngekiGekForceRating,
	calculateOngekiRating,
	formatOngekiLevel,
	ongekiBadgeColors
} from "@/app/shared/utils/ongeki"
import { getOngekiLogo } from "@/app/shared/utils/version-logos"
import { cn } from "@/app/shared/utils"

import { OngekiRatingColors } from "./rating-colors"

type CardProps = {
	score: StaticMusic
	levelColorBadge?: (chartId?: number | undefined) => string
	className?: string
	jacketArt?: string
}

export function SongInfoCard({ score, levelColorBadge, jacketArt }: CardProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [selectedChartId, setSelectedChartId] = useState<number | null>(null)
	const song = score
	const ongekiVersion = useOngekiVersion() ?? 0
	const currentUser = useCurrentUser()
	const logoUrl = getOngekiLogo.getLogo(song.version)

	const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useScoreLeaderboard(
		song.songId ?? 0,
		selectedChartId ?? 0,
		100,
		isDialogOpen && selectedChartId !== null
	)

	const handleLeaderboardClick = (chartId: number) => {
		setSelectedChartId(chartId)
	}

	const handleBackToSelection = () => {
		setSelectedChartId(null)
	}

	const handleDialogClose = (open: boolean) => {
		setIsDialogOpen(open)
		if (!open) {
			setSelectedChartId(null)
		}
	}

	return (
		<div className={cn("bg-card border-border flex min-h-[180px] flex-col rounded-lg border p-3 shadow-sm transition-all hover:shadow-md")}>
			<div className="flex items-start gap-3 mb-2">
				<CardImage
					src={`${CDN}/${jacketArt}/${score.jacketPath ?? ""}`}
					alt={song.title ?? ""}
					width={72}
					height={72}
					className="w-16 h-16 rounded-md"
				/>
				<div className="min-w-0 flex-1">
					<h3 className="text-foreground text-base font-semibold leading-snug break-words line-clamp-2 mb-1">
						{song.title ?? ""}
					</h3>
					<div className="text-muted-foreground mb-0.5 line-clamp-1 text-xs">
						{song.artist ?? "Unknown"}
					</div>
					<div className="text-muted-foreground text-xs whitespace-nowrap">{song.genre ?? "N/A"}</div>
				</div>
			</div>

			<div className="flex min-h-[2rem] flex-wrap items-start gap-2 mb-2">
				{(song.charts || []).map((c, idx) => {
					const levelData = formatOngekiLevel(c)

					return (
						<Badge
							key={`${String(c.chartId)}-${String(c.level)}-${idx}`}
							variant="outline"
							className={cn(
								"inline-flex h-6 items-center rounded-md border-2 px-2.5 py-0.5 text-xs font-bold",
								levelColorBadge ? levelColorBadge(c.chartId ?? undefined) : ongekiBadgeColors(c.chartId ?? 0)
							)}
						>
							{levelData.value}
						</Badge>
					)
				})}
			</div>

			<Separator className="my-1.5" />

			<div className="flex flex-col gap-1.5 min-w-0 w-full">
				<div className="flex items-center gap-1.5 flex-wrap justify-end">
					{logoUrl && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Badge variant="secondary" className="h-5 rounded-sm p-0.5">
									<img src={logoUrl} alt="Version Logo" className="max-h-4 w-auto object-contain" />
								</Badge>
							</TooltipTrigger>
							<TooltipContent>
								<p>Version the song originated in</p>
							</TooltipContent>
						</Tooltip>
					)}
					<Badge
						variant="secondary"
						className="hover:bg-muted/70 h-5 cursor-pointer rounded-md px-1 transition-colors flex-shrink-0"
						onClick={() => setIsDialogOpen(true)}
					>
						<Medal className="h-3.5 w-3.5" />
					</Badge>
				</div>
			</div>

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
									const levelData = formatOngekiLevel(c)
									const chartName = ["Basic", "Advanced", "Expert", "Master", "Lunatic"][c.chartId ?? 0]

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
												className={cn(
													"inline-flex h-6 items-center rounded-md border-2 px-2.5 py-0.5 text-xs font-bold",
													levelColorBadge ? levelColorBadge(c.chartId ?? undefined) : ongekiBadgeColors(c.chartId ?? 0)
												)}
											>
												{levelData.value}
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
												className={`${ongekiBadgeColors(selectedChartId)} rounded-sm border-2 px-3 py-1 text-sm font-bold`}
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
												const isRefresh = ongekiVersion >= 8
												const level = leaderboardData.chart?.level ?? 0
												const isUserScore = entry.userId === currentUser.userId
												const rank = index + 1
												const getRankBgColor = () => {
													if (rank === 1) return "bg-yellow-500"
													if (rank === 2) return "bg-slate-400"
													if (rank === 3) return "bg-teal-500"
													return "bg-muted"
												}
												const calculatedRating =
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
																<p className="text-foreground text-lg font-bold">{entry.score.toLocaleString()}</p>
																{calculatedRating !== null && (
																	<div className="mt-0.5">
																		<OngekiRatingColors
																			rating={calculatedRating}
																			version={ongekiVersion}
																			decimals={isRefresh ? 3 : 2}
																		/>
																	</div>
																)}
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
