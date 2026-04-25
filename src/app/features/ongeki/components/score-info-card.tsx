import { useMemo, useState } from "react"

import { Users } from "lucide-react"

import { OngekiAchievementBadges } from "@/app/features/ongeki/components/achievement-badges"
import { useScoreLeaderboard } from "@/app/features/ongeki/hooks/use-score-leaderboard"
import { useOngekiScoreRating } from "@/app/features/ongeki/hooks/use-score-rating"
import { CardImage } from "@/app/shared/components/common/card-image"
import { Leaderboard } from "@/app/shared/components/leaderboard"
import { Avatar, AvatarFallback } from "@/app/shared/components/ui/avatar"
import { Badge } from "@/app/shared/components/ui/badge"
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
		scoreVersion: score.scoreVersion,
		version: ongekiVersion,
		platinumScoreStar: score.platinumScoreStar
	})

	const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useScoreLeaderboard(
		score.musicId ?? 0,
		score.chartId ?? 0,
		100,
		isDialogOpen
	)
	const { data: previewLeaderboardData, isLoading: isLoadingPreviewLeaderboard } = useScoreLeaderboard(
		score.musicId ?? 0,
		score.chartId ?? 0,
		4
	)
	const topFourEntries = previewLeaderboardData?.leaderboard ?? []
	const maxMetaBadges = 4
	const playDateParts = formatOngekiScorePlaylogDate(score.userPlayDate)
	const metaBadges = [
		...(score.userPlayDate
			? [
					{ key: "date", label: playDateParts.date },
					{ key: "time", label: playDateParts.time }
				]
			: []),
		...(score.isTechNewRecord === 1 ? [{ key: "new-score-record", label: "New Score Record" }] : []),
		...(score.isBattleNewRecord === 1 ? [{ key: "new-battle-record", label: "New Battle Record" }] : [])
	]
	const visibleMetaBadges = metaBadges.slice(0, maxMetaBadges)
	const hiddenMetaBadgesCount = Math.max(0, metaBadges.length - maxMetaBadges)

	const songVersionLogo = useMemo(() => {
		return getOngekiLogo.getLogo(score.earliest_version)
	}, [score.earliest_version])

	const getRankRingClass = (rank: number) => {
		if (rank === 1) return "border-foreground/45"
		if (rank === 2) return "border-foreground/30"
		if (rank === 3) return "border-foreground/20"
		return "border-background"
	}

	return (
		<div
			className={cn(
				"bg-card border-border/60 flex h-full w-full flex-col rounded-xl border p-3 shadow-sm",
				className
			)}
		>
			{/* Top Section: Image, Title, Score */}
			<div className="flex items-start gap-3">
				{/* Album Art */}
				<div className="flex-shrink-0">
					<CardImage
						src={`${CDN}/ongeki/jacket/${score.jacketPath}`}
						alt={score.title}
						width={64}
						height={64}
						className="h-14 w-14 rounded-md"
					/>
				</div>

				{/* Title and Info */}
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					<h3 className="text-foreground text-sm font-semibold leading-tight break-words line-clamp-2">
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
				<div className="flex flex-shrink-0 flex-col items-end gap-2 text-right">
					<div className="flex flex-wrap justify-end gap-1.5">
						{score.isImported === 1 ? (
							<Badge variant="secondary" className="h-5 rounded-md px-2 text-xs font-medium">
								Imported
							</Badge>
						) : (
							<VersionLogoBadge
								logoUrl={songVersionLogo}
								tooltip="Version the song originated in"
								alt={`Song version ${score.earliest_version ?? "unknown"}`}
							/>
						)}
					</div>
					<div>
						<div className="text-muted-foreground mb-0.5 text-[9px] font-medium tracking-[0.08em] uppercase">
							Tech Score
						</div>
						{score.techScore != null ? (
							score.techScore >= 1010000 ? (
								<div className="flex flex-col items-end gap-0.5">
									<span className="text-foreground text-base font-bold tabular-nums">1,010,000</span>
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
						<div className="text-muted-foreground mb-0.5 text-[9px] font-medium tracking-[0.08em] uppercase">
							Player Rating
						</div>
						<div>
							{calculatedRating !== null ? (
								<OngekiRatingColors rating={calculatedRating} version={ongekiVersion} decimals={isRefresh ? 3 : 2} />
							) : (
								<span className="text-foreground text-xs font-medium text-muted-foreground">-</span>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="border-border/60 mt-3 space-y-2.5 border-t pt-2.5">
				<div className="flex flex-wrap items-center gap-1.5">
					<OngekiAchievementBadges
						isFullCombo={score.isFullCombo ?? 0}
						isAllBreak={score.isAllBreak ?? 0}
						isFullBell={score.isFullBell ?? 0}
						techScore={score.techScore ?? 0}
					/>
					<div className="ml-auto flex h-5 items-center">
					<PlatinumStars count={score.platinumScoreStar ?? 0} />
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-1.5">
					{visibleMetaBadges.length > 0 ? (
						<>
							{visibleMetaBadges.map(badge => (
								<Badge
									key={badge.key}
									variant="secondary"
									className={cn(
										"h-5 rounded-md text-xs px-1.5 flex-shrink-0 whitespace-nowrap",
										(badge.key === "new-score-record" || badge.key === "new-battle-record") &&
											"px-2 font-semibold uppercase"
									)}
								>
									{badge.label}
								</Badge>
							))}
							{hiddenMetaBadgesCount > 0 && (
								<Badge variant="secondary" className="h-5 flex-shrink-0 rounded-md px-2 text-xs font-semibold">
									+{hiddenMetaBadgesCount}
								</Badge>
							)}
						</>
					) : (
						<span className="text-muted-foreground text-xs flex-shrink-0">—</span>
					)}
				</div>

				<div className="flex items-center justify-end gap-2 pt-0.5">
					<span className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">Top 4</span>
					<div className="flex -space-x-2">
						{isLoadingPreviewLeaderboard ? (
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
						onClick={() => setIsDialogOpen(true)}
					>
						... View all
					</button>
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
