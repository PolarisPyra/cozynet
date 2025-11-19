import { ReactNode } from "react"

import Spinner from "@/app/shared/components/common/spinner"
import { Badge } from "@/app/shared/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/shared/components/ui/dialog"

interface LeaderboardEntryData {
	userId: number
	username: string
	score: number
	playDate: string
	isFullCombo?: number
	isAllBreak?: number
	isAllBell?: number
	isFullBell?: number
	isAllJustice?: number
}

interface LeaderboardProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	description?: string
	isLoading: boolean
	chartLevel?: number
	chartBadgeClassName?: string
	totalScores: number
	entries: LeaderboardEntryData[]
	currentUserId: number
	renderRating?: (entry: LeaderboardEntryData, index: number) => ReactNode
	emptyMessage?: string
}

function RankBadge({ rank }: { rank: number }) {
	const getRankBgColor = () => {
		if (rank === 1) return "bg-yellow-500"
		if (rank === 2) return "bg-slate-400"
		if (rank === 3) return "bg-teal-500"
		return "bg-muted"
	}

	return (
		<div
			className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm text-sm font-bold text-white ${getRankBgColor()}`}
		>
			{rank}
		</div>
	)
}

export function Leaderboard({
	open,
	onOpenChange,
	title,
	description,
	isLoading,
	chartLevel,
	chartBadgeClassName,
	totalScores,
	entries,
	currentUserId,
	renderRating,
	emptyMessage = "No scores recorded yet"
}: LeaderboardProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
				<DialogHeader className="gap-1">
					<DialogTitle>{title}</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>

				{isLoading ? (
					<div className="flex h-64 items-center justify-center">
						<Spinner />
					</div>
				) : entries.length === 0 ? (
					<div className="bg-muted/50 rounded-sm p-8 text-center">
						<p className="text-muted-foreground">{emptyMessage}</p>
					</div>
				) : (
					<div className="space-y-3 pb-4">
						{chartLevel !== undefined && chartBadgeClassName && (
							<div className="-mt-2 mb-2">
								<Badge
									variant="outline"
									className={`${chartBadgeClassName} rounded-sm border-2 px-3 py-1 text-sm font-bold`}
								>
									Level {chartLevel.toFixed(1)}
								</Badge>
							</div>
						)}

						<p className="text-muted-foreground text-sm">Top {totalScores} Scores</p>

						<div className="space-y-2">
							{entries.map((entry, index) => {
								const isUserScore = entry.userId === currentUserId
								const rank = index + 1
								const rating = renderRating ? renderRating(entry, index) : undefined

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
												<RankBadge rank={rank} />
												<div>
													<p className={`text-sm font-semibold ${isUserScore ? "text-primary" : "text-foreground"}`}>
														{entry.username}
													</p>
													<div className="mt-1 flex items-center gap-2">
														{entry.isAllBreak !== undefined && entry.isAllBreak > 0 && (
															<Badge variant="secondary" className="text-xs">
																AB
															</Badge>
														)}
														{((entry.isAllBell !== undefined && entry.isAllBell > 0) ||
															(entry.isFullBell !== undefined && entry.isFullBell > 0)) && (
															<Badge variant="secondary" className="text-xs">
																FB
															</Badge>
														)}
														{entry.isAllJustice !== undefined && entry.isAllJustice > 0 && (
															<Badge variant="secondary" className="text-xs">
																AJ
															</Badge>
														)}
														{entry.isFullCombo !== undefined &&
															entry.isFullCombo > 0 &&
															(entry.isAllBreak === undefined || entry.isAllBreak === 0) &&
															(entry.isAllJustice === undefined || entry.isAllJustice === 0) && (
																<Badge variant="secondary" className="text-xs">
																	FC
																</Badge>
															)}
													</div>
												</div>
											</div>
											<div className="text-right">
												<p className="text-foreground text-lg font-bold">{entry.score.toLocaleString()}</p>
												{rating && <div className="mt-0.5">{rating}</div>}
												<p className="text-muted-foreground text-xs">{new Date(entry.playDate).toLocaleDateString()}</p>
											</div>
										</div>
									</div>
								)
							})}
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
