import { useState } from "react"

import { Medal } from "lucide-react"

import { OngekiAchievementBadges } from "@/app/features/ongeki/components/achievement-badges"
import { useScoreLeaderboard } from "@/app/features/ongeki/hooks/use-score-leaderboard"
import { useOngekiScoreRating } from "@/app/features/ongeki/hooks/use-score-rating"
import { CardImage } from "@/app/shared/components/common/card-image"
import { Leaderboard } from "@/app/shared/components/leaderboard"
import { Badge } from "@/app/shared/components/ui/badge"
import { Separator } from "@/app/shared/components/ui/separator"
import { useCurrentUser } from "@/app/shared/hooks/users/use-current-user"
import { OngekiPlaylog } from "@/app/shared/types"
import { CDN } from "@/app/shared/utils/constants"
import { formatLevel } from "@/app/shared/utils/format-level"
import {
	calculateOngekiGekForceRating,
	calculateOngekiRating,
	formatOngekiScorePlaylogDate,
	ongekiBadgeColors
} from "@/app/shared/utils/ongeki"

import { OngekiRatingColors } from "./rating-colors"

interface PlatinumStarsProps {
	count: number
}

const PlatinumStars = function ({ count }: PlatinumStarsProps) {
	const starUrl = (filled: boolean) => `${CDN}/ongeki/badges/${filled ? "filled" : "base"}/pstar.webp`

	return (
		<div className="flex items-center gap-0.5 md:gap-1">
			{Array.from({ length: 5 }, (_, i) => {
				const filled = i < count
				return (
					<span
						key={i}
						aria-hidden
						className="inline-block h-3 w-3 md:h-4 md:w-4"
						style={{
							WebkitMaskImage: `url(${starUrl(filled)})`,
							maskImage: `url(${starUrl(filled)})`,
							WebkitMaskRepeat: "no-repeat",
							maskRepeat: "no-repeat",
							WebkitMaskSize: "contain",
							maskSize: "contain",
							backgroundColor: filled ? "var(--foreground)" : "var(--muted-foreground)"
						}}
					/>
				)
			})}
		</div>
	)
}

export type OngekiScoreInfoCardProps = {
	score: OngekiPlaylog
	levelColorBadge?: (chartId?: number | undefined) => string
	className?: string
	ongekiVersion: number
}

export function OngekiScoreInfoCard({
	score,
	levelColorBadge,
	className = "",
	ongekiVersion
}: OngekiScoreInfoCardProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const currentUser = useCurrentUser()
	const { calculatedRating, isRefresh } = useOngekiScoreRating({
		playerRating: score.playerRating,
		techScore: score.techScore,
		level: score.level,
		isFullCombo: score.isFullCombo,
		isAllBreak: score.isAllBreak,
		isFullBell: score.isFullBell,
		version: ongekiVersion,
		platinumScoreStar: score.platinumScoreStar
	})

	const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useScoreLeaderboard(
		score.musicId ?? 0,
		score.chartId ?? 0,
		100,
		isDialogOpen
	)

	return (
		<div
			className={`bg-card border-border flex h-full flex-col gap-3 rounded-sm border p-4 shadow-sm transition-shadow hover:shadow-md ${className}`}
		>
			<div className="flex flex-1 flex-col gap-3">
				<div className="flex items-start justify-between gap-3">
					<div className="flex min-w-0 flex-1 items-start gap-3">
						<CardImage src={`${CDN}/ongeki/jacket/${score.jacketPath}`} alt={score.title} width={72} height={72} />
						<div className="min-w-0 flex-1">
							<div className="text-foreground mb-2 text-xs leading-tight font-bold whitespace-nowrap sm:text-sm md:text-base">
								{score.title}
							</div>
							<span
								className={`inline-block rounded-sm border-2 px-2.5 py-1 text-xs font-bold ${levelColorBadge ? levelColorBadge(score.chartId ?? undefined) : "text-primary-foreground bg-primary"}`}
							>
								{formatLevel(score.level)}
							</span>
						</div>
					</div>

					<div className="flex flex-shrink-0 flex-col items-end gap-2">
						<div className="flex flex-col items-end">
							<span className="text-foreground text-[10px] font-medium tracking-wide uppercase">Tech Score</span>
							{score.techScore != null ? (
								score.techScore >= 1010000 ? (
									<div className="flex flex-col items-end gap-0.5">
										<span className="text-foreground text-base font-medium tabular-nums">1,010,000</span>
										<span className="text-muted-foreground text-xs font-medium tabular-nums">
											(AB+: +{(score.techScore - 1010000).toLocaleString()})
										</span>
									</div>
								) : (
									<span className="text-foreground text-base font-medium tabular-nums">
										{score.techScore.toLocaleString()}
									</span>
								)
							) : (
								<span className="text-foreground text-base font-medium tabular-nums">-</span>
							)}
						</div>
						<div className="flex flex-col items-end">
							<span className="text-foreground text-[10px] font-medium tracking-wide uppercase">Player Rating</span>
							<div className="mt-0.5">
								{calculatedRating !== null ? (
									<OngekiRatingColors rating={calculatedRating} version={ongekiVersion} decimals={isRefresh ? 3 : 2} />
								) : (
									<span className="text-foreground text-sm font-medium">-</span>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-end justify-between">
					<OngekiAchievementBadges
						isFullCombo={score.isFullCombo ?? 0}
						isAllBreak={score.isAllBreak ?? 0}
						isFullBell={score.isFullBell ?? 0}
						techScore={score.techScore ?? 0}
					/>
					<PlatinumStars count={score.platinumScoreStar ?? 0} />
				</div>
			</div>

			<Separator />
			<div className="text-muted-foreground flex flex-col gap-2 text-xs font-medium md:flex-row md:items-center md:justify-between">
				<div className="flex flex-wrap items-center gap-1.5">
					{score.userPlayDate ? (
						<>
							<Badge variant="secondary" className="h-6 rounded-sm whitespace-nowrap">
								{formatOngekiScorePlaylogDate(score.userPlayDate).date}
							</Badge>
							<Badge variant="secondary" className="h-6 rounded-sm whitespace-nowrap">
								{formatOngekiScorePlaylogDate(score.userPlayDate).time}
							</Badge>
						</>
					) : (
						<span>—</span>
					)}
				</div>
				<div className="flex flex-wrap items-center gap-2 md:justify-end">
					{score.isTechNewRecord === 1 && (
						<Badge
							variant="secondary"
							className="h-6 rounded-sm px-2 text-[10px] font-bold whitespace-nowrap uppercase"
						>
							New Score Record
						</Badge>
					)}
					{score.isBattleNewRecord === 1 && (
						<Badge
							variant="secondary"
							className="h-6 rounded-sm px-2 text-[10px] font-bold whitespace-nowrap uppercase"
						>
							New Battle Record
						</Badge>
					)}
					<Badge
						variant="secondary"
						className="hover:bg-muted/70 h-6 cursor-pointer rounded-sm px-1.5 transition-colors"
						onClick={() => setIsDialogOpen(true)}
					>
						<Medal className="h-4 w-4" />
					</Badge>
				</div>
			</div>

			<Leaderboard
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				title="Song Leaderboard"
				description={score.title}
				isLoading={isLoadingLeaderboard}
				chartLevel={leaderboardData?.chart?.level}
				chartBadgeClassName={ongekiBadgeColors(score.chartId ?? 0)}
				totalScores={leaderboardData?.total ?? 0}
				entries={leaderboardData?.leaderboard ?? []}
				currentUserId={currentUser.userId}
				renderRating={entry => {
					const level = leaderboardData?.chart?.level ?? 0
					if (level === 0) return null
					const isRefresh = ongekiVersion >= 8
					const entryRating = isRefresh
						? calculateOngekiGekForceRating(
								level,
								entry.score,
								entry.isFullCombo ?? 0,
								entry.isAllBreak ?? 0,
								entry.isFullBell ?? 0
							) / 1000
						: calculateOngekiRating(level, entry.score) / 100
					return <OngekiRatingColors rating={entryRating} version={ongekiVersion} decimals={isRefresh ? 3 : 2} />
				}}
			/>
		</div>
	)
}
