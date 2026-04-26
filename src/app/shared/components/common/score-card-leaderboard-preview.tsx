import { Users } from "lucide-react"

import { Avatar, AvatarFallback } from "@/app/shared/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/shared/components/ui/tooltip"
import { cn } from "@/app/shared/utils"

interface ScoreCardLeaderboardPreviewProps {
	topFourEntries: any[]
	isLoading: boolean
	onViewAll: () => void
}

const getRankRingClass = (rank: number) => {
	if (rank === 1) return "border-foreground/45"
	if (rank === 2) return "border-foreground/30"
	if (rank === 3) return "border-foreground/20"
	return "border-background"
}

export function ScoreCardLeaderboardPreview({
	topFourEntries,
	isLoading,
	onViewAll
}: ScoreCardLeaderboardPreviewProps) {
	return (
		<div className="flex items-center justify-end gap-2">
			<span className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">Top 4</span>

			<div className="flex -space-x-2">
				{isLoading ? (
					Array.from({ length: 4 }, (_, i) => (
						<div key={i} className="bg-muted h-6 w-6 rounded-full border-2 border-background" />
					))
				) : topFourEntries.length > 0 ? (
					topFourEntries.slice(0, 4).map((entry, index) => (
						<Tooltip key={`${entry.userId}-${index}`}>
							<TooltipTrigger asChild>
								<Avatar
									className={cn("h-6 w-6 border-2", getRankRingClass(index + 1))}
									style={{ zIndex: 20 - index }}
								>
									<AvatarFallback className="text-[10px] font-semibold">
										{entry.username.charAt(0).toUpperCase() || "?"}
									</AvatarFallback>
								</Avatar>
							</TooltipTrigger>

							<TooltipContent>
								<p>
									{entry.username} · #{index + 1}
								</p>
							</TooltipContent>
						</Tooltip>
					))
				) : (
					<div className="text-muted-foreground flex items-center gap-1 text-xs">
						<Users className="h-3.5 w-3.5" />
						<span>No leaderboard data yet</span>
					</div>
				)}
			</div>

			<button
				type="button"
				className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-semibold transition-colors"
				onClick={onViewAll}
			>
				... View all
			</button>
		</div>
	)
}
