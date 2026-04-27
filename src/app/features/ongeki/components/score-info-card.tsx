import { OngekiAchievementBadges } from "@/app/features/ongeki/components/achievement-badges"
import { CardImage } from "@/app/shared/components/common/card-image"
import { Leaderboard } from "@/app/shared/components/leaderboard"
import { Badge } from "@/app/shared/components/ui/badge"
import { Separator } from "@/app/shared/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/shared/components/ui/tooltip"
import { OngekiPlaylog } from "@/app/shared/types"
import { cn } from "@/app/shared/utils"
import { CDN } from "@/app/shared/utils/constants"
import { formatLevel } from "@/app/shared/utils/format-level"
import {
	calculateOngekiGekForceRating,
	calculateOngekiRating,
	ongekiBadgeColors
} from "@/app/shared/utils/ongeki"

import { useOngekiScoreCard } from "../hooks/use-ongeki-score-card"
import { OngekiRatingColors } from "./rating-colors"
import { ScoreCardLeaderboardPreview } from "@/app/shared/components/common/score-card-leaderboard-preview"

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

const PlatinumStars = ({ count }: { count: number }) => {
	const safeCount = Math.max(0, Math.min(5, count || 0))
	const starUrl = (filled: boolean) => `${CDN}/ongeki/badges/${filled ? "filled" : "base"}/pstar.webp`

	return (
		<div className="flex items-center gap-0.5 md:gap-1">
			{Array.from({ length: 5 }, (_, i) => {
				const filled = i < safeCount

				return (
					<img
						key={i}
						aria-hidden
						className="inline-block h-3 w-3 object-contain md:h-4 md:w-4"
						src={starUrl(filled)}
						alt={filled ? "Filled Star" : "Empty Star"}
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
	const {
		isDialogOpen,
		setIsDialogOpen,
		currentUser,
		calculatedRating,
		isRefresh,
		leaderboardData,
		isLoadingLeaderboard,
		isLoadingPreviewLeaderboard,
		topFourEntries,
		songVersionLogo,
		metaBadges
	} = useOngekiScoreCard({ score, ongekiVersion })

	return (
		<div
			className={cn(
				"bg-card border-border flex h-full w-full flex-col rounded-lg border p-3 shadow-sm transition-all hover:shadow-md",
				className
			)}
		>
			<div className="mb-2 flex items-start gap-3">
				<div className="flex-shrink-0">
					<CardImage
						src={`${CDN}/ongeki/jacket/${score.jacketPath}`}
						alt={score.title ?? ""}
						width={72}
						height={72}
						className="h-16 w-16 rounded-md object-cover"
					/>
				</div>

				<div className="flex min-w-0 flex-1 flex-col gap-1.5">
					<h3 className="text-foreground line-clamp-2 break-words text-base font-semibold leading-snug">
						{score.title ?? ""}
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

				<div className="flex flex-shrink-0 flex-col items-end gap-2.5 text-right">
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

					<div>
						<div className="text-muted-foreground mb-0.5 text-[9px] font-medium tracking-[0.08em] uppercase">
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
						<div className="text-muted-foreground mb-0.5 text-[9px] font-medium tracking-[0.08em] uppercase">
							Player Rating
						</div>

						<div>
							{calculatedRating !== null ? (
								<OngekiRatingColors rating={calculatedRating} version={ongekiVersion} decimals={isRefresh ? 3 : 2} />
							) : (
								<span className="text-muted-foreground text-xs font-medium">-</span>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="mb-2 flex items-end justify-between gap-2">
				<OngekiAchievementBadges
					isFullCombo={score.isFullCombo ?? 0}
					isAllBreak={score.isAllBreak ?? 0}
					isFullBell={score.isFullBell ?? 0}
					techScore={score.techScore ?? 0}
				/>

				<PlatinumStars count={score.platinumScoreStar ?? 0} />
			</div>

			{metaBadges.length > 0 && (
				<>
					<Separator className="my-1.5" />

					<div className="min-w-0 overflow-hidden">
						<div className="flex w-full flex-nowrap items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-0.5">
							{metaBadges.map(badge => (
								<Badge
									key={badge.key}
									variant="secondary"
									className={cn(
										"h-5 shrink-0 whitespace-nowrap rounded-md px-1.5 text-xs",
										(badge.key === "new-score-record" || badge.key === "new-battle-record") &&
										"px-2 font-semibold uppercase"
									)}
								>
									{badge.label}
								</Badge>
							))}
						</div>
					</div>
				</>
			)}

			<Separator className="my-2" />

			<ScoreCardLeaderboardPreview
				topFourEntries={topFourEntries}
				isLoading={isLoadingPreviewLeaderboard}
				onViewAll={() => setIsDialogOpen(true)}
			/>

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