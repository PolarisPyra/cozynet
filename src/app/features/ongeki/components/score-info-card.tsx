import { useMemo, useState } from "react"

import { Medal } from "lucide-react"

import { OngekiAchievementBadges } from "@/app/features/ongeki/components/achievement-badges"
import { useScoreLeaderboard } from "@/app/features/ongeki/hooks/use-score-leaderboard"
import { useOngekiScoreRating } from "@/app/features/ongeki/hooks/use-score-rating"
import { CardImage } from "@/app/shared/components/common/card-image"
import { Leaderboard } from "@/app/shared/components/leaderboard"
import { Badge } from "@/app/shared/components/ui/badge"
import { Separator } from "@/app/shared/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/shared/components/ui/tooltip"
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
import { cn } from "@/app/shared/utils"
import { getOngekiLogo } from "@/app/shared/utils/version-logos"

import { OngekiRatingColors } from "./rating-colors"

interface VersionLogoBadgeProps {
	logoUrl: string | null
	tooltip: string
	alt: string
}

const VersionLogoBadge = ({ logoUrl, tooltip, alt }: VersionLogoBadgeProps) => {
	if (!logoUrl) return null

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Badge variant="secondary" className="h-5 rounded-sm p-0.5">
					<img src={logoUrl} alt={alt} className="max-h-4 w-auto object-contain" />
				</Badge>
			</TooltipTrigger>
			<TooltipContent>
				<p>{tooltip}</p>
			</TooltipContent>
		</Tooltip>
	)
}

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

	const songVersionLogo = useMemo(() => {
		return getOngekiLogo.getLogo(score.songVersion)
	}, [score.songVersion])

	return (
		<div
			className={cn(
				"bg-card border-border flex h-full w-full flex-col rounded-lg border p-3 shadow-sm transition-all hover:shadow-md",
				className
			)}
		>
			{/* Top Section: Image, Title, Score */}
			<div className="flex items-start gap-3 mb-2">
				{/* Album Art */}
				<div className="flex-shrink-0">
					<CardImage src={`${CDN}/ongeki/jacket/${score.jacketPath}`} alt={score.title} width={72} height={72} className="w-16 h-16 rounded-md" />
				</div>

				{/* Title and Info */}
				<div className="flex-1 min-w-0 flex flex-col gap-1.5">
					<h3 className="text-foreground text-base font-semibold leading-snug break-words line-clamp-2">
						{score.title}
					</h3>
					<div className="flex items-center gap-2">
						<span
							className={cn(
								"inline-flex h-6 items-center rounded-md border-2 px-2.5 py-0.5 text-xs font-bold",
								levelColorBadge ? levelColorBadge(score.chartId ?? undefined) : "text-primary-foreground bg-primary"
							)}
						>
							{formatLevel(score.level)}
						</span>
					</div>
				</div>

				{/* Score and Rating */}
				<div className="flex flex-col items-end gap-2.5 flex-shrink-0 text-right">
					<div>
						<div className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider mb-1">
							Tech Score
						</div>
						{score.techScore != null ? (
							score.techScore >= 1010000 ? (
								<div className="flex flex-col items-end gap-0.5">
									<span className="text-foreground text-lg font-bold tabular-nums">1,010,000</span>
									<span className="text-muted-foreground text-xs font-medium tabular-nums">
										(AB+: +{(score.techScore - 1010000).toLocaleString()})
									</span>
								</div>
							) : (
								<span className="text-foreground text-lg font-bold tabular-nums">
									{score.techScore.toLocaleString()}
								</span>
							)
						) : (
							<span className="text-foreground text-sm font-semibold tabular-nums">-</span>
						)}
					</div>
					<div>
						<div className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider mb-1">
							Rating
						</div>
						<div>
							{calculatedRating !== null ? (
								// Individual song scores always use old tier thresholds (16.0 for rainbow) regardless of version
								<OngekiRatingColors rating={calculatedRating} version={0} decimals={isRefresh ? 3 : 2} />
							) : (
								<span className="text-foreground text-xs font-medium text-muted-foreground">-</span>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Achievement Badges */}
			<div className="flex items-end justify-between gap-2 mb-2">
				<OngekiAchievementBadges
					isFullCombo={score.isFullCombo ?? 0}
					isAllBreak={score.isAllBreak ?? 0}
					isFullBell={score.isFullBell ?? 0}
					techScore={score.techScore ?? 0}
				/>
				<PlatinumStars count={score.platinumScoreStar ?? 0} />
			</div>

			<Separator className="my-1.5" />
			{/* Footer */}
			<div className="flex flex-col gap-1.5 min-w-0 w-full">
				<div className="flex items-center gap-1.5 flex-wrap">
					{score.userPlayDate ? (
						<>
							<Badge variant="secondary" className="h-5 rounded-md text-xs px-1.5 flex-shrink-0 whitespace-nowrap">
								{formatOngekiScorePlaylogDate(score.userPlayDate).date}
							</Badge>
							<Badge variant="secondary" className="h-5 rounded-md text-xs px-1.5 flex-shrink-0 whitespace-nowrap">
								{formatOngekiScorePlaylogDate(score.userPlayDate).time}
							</Badge>
						</>
					) : (
						<span className="text-muted-foreground text-xs flex-shrink-0">—</span>
					)}
					<Badge
						variant="secondary"
						className="hover:bg-muted/70 h-5 cursor-pointer rounded-md px-1 transition-colors flex-shrink-0"
						onClick={() => setIsDialogOpen(true)}
					>
						<Medal className="h-3.5 w-3.5" />
					</Badge>
				</div>
				<div className="flex items-center gap-1.5 flex-wrap">
					{score.isTechNewRecord === 1 && (
						<Badge
							variant="secondary"
							className="h-5 rounded-md text-xs font-semibold uppercase px-2 flex-shrink-0 whitespace-nowrap"
						>
							New Score Record
						</Badge>
					)}
					{score.isBattleNewRecord === 1 && (
						<Badge
							variant="secondary"
							className="h-5 rounded-md text-xs font-semibold uppercase px-2 flex-shrink-0 whitespace-nowrap"
						>
							New Battle Record
						</Badge>
					)}
				</div>
				<div className="flex items-center gap-1.5 flex-wrap">
					<VersionLogoBadge
						logoUrl={songVersionLogo}
						tooltip="Version the song originated in"
						alt={`Song version ${score.songVersion ?? "unknown"}`}
					/>
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
					// Individual song scores always use old tier thresholds (16.0 for rainbow) regardless of version
					return <OngekiRatingColors rating={entryRating} version={0} decimals={isRefresh ? 3 : 2} />
				}}
			/>
		</div>
	)
}
