import { memo, useMemo, useState } from "react"

import { Medal, Star } from "lucide-react"

import { ChunithmAchievementBadges } from "@/app/features/chunithm/components/achievement-badges"
import { useScoreLeaderboard } from "@/app/features/chunithm/hooks/use-score-leaderboard"
import { CardImage } from "@/app/shared/components/common/card-image"
import { Leaderboard } from "@/app/shared/components/leaderboard"
import { Badge } from "@/app/shared/components/ui/badge"
import { Separator } from "@/app/shared/components/ui/separator"
import { Skeleton } from "@/app/shared/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/shared/components/ui/tooltip"
import { ChunithmPlaylog } from "@/app/shared/types"
import { cn } from "@/app/shared/utils"
import {
	calculateChunithmRating,
	chunithmBadgeColors,
	convertRomVersionToVersion,
	formatSqlDateToLocalParts,
	getChunithmGrade,
	levelToStars
} from "@/app/shared/utils/chunithm"
import { CDN } from "@/app/shared/utils/constants"
import { formatLevel } from "@/app/shared/utils/format-level"
import { convertChunithmScoreRating } from "@/app/shared/utils/profile-rating-utils"
import { getChunithmLogo } from "@/app/shared/utils/version-logos"

import { ChunithmRatingColors } from "./rating-colors"

interface VersionLogoBadgeProps {
	logoUrl: string | null
	tooltip: string
	alt: string
}

const VersionLogoBadge = memo(function VersionLogoBadge({ logoUrl, tooltip, alt }: VersionLogoBadgeProps) {
	if (!logoUrl) return null

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Badge variant="secondary" className="h-6 rounded-sm p-1">
					<img src={logoUrl} alt={alt} className="max-h-5 w-auto object-contain" />
				</Badge>
			</TooltipTrigger>
			<TooltipContent>
				<p>{tooltip}</p>
			</TooltipContent>
		</Tooltip>
	)
})

export type ChunithmScoreInfoCardProps = {
	score: ChunithmPlaylog
	levelColorBadge?: (chartId?: number | undefined) => string
	className?: string
	version?: number
	currentUserId?: number
}

export const ChunithmScoreInfoCard = memo(function ChunithmScoreInfoCard({
	score,
	levelColorBadge,
	className = "",
	version,
	currentUserId
}: ChunithmScoreInfoCardProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)

	const { scoreVersionId, scoreVersionLogo, songVersionLogo, ratingValue, isWorldsEnd, starCount } = useMemo(() => {
		const versionId = convertRomVersionToVersion(score.romVersion)
		return {
			scoreVersionId: versionId,
			scoreVersionLogo: getChunithmLogo.getLogo(versionId),
			songVersionLogo: getChunithmLogo.getLogo(score.songVersion),
			ratingValue: convertChunithmScoreRating(score.playerRating),
			isWorldsEnd: score.chartId === 5,
			starCount: levelToStars(score.level)
		}
	}, [score.romVersion, score.songVersion, score.playerRating, score.chartId, score.level])

	const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useScoreLeaderboard(
		score.musicId ?? 0,
		score.chartId ?? 0,
		100,
		isDialogOpen
	)

	return (
		<div
			className={cn(
				"bg-card border-border flex h-full flex-col gap-3 rounded-sm border p-4 shadow-sm transition-shadow hover:shadow-md",
				className
			)}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 flex-1 items-start gap-3">
					<CardImage
						src={`${CDN}/chunithm/jacket/${score.jacketPath}`}
						alt={score.title ?? ""}
						width={64}
						height={64}
					/>
					<div className="min-w-0 flex-1">
						<div className="text-foreground mb-2 text-xs leading-tight font-bold whitespace-nowrap sm:text-sm md:text-base">
							{score.title}
						</div>
						<Badge
							variant="outline"
							className={cn(
								"flex min-h-[1.5rem] items-center rounded-sm border-2 px-2.5 py-1 text-xs font-bold",
								levelColorBadge ? levelColorBadge(score.chartId ?? undefined) : chunithmBadgeColors(score.chartId ?? 0)
							)}
						>
							{score.level == null || !Number.isFinite(score.level) ? (
								"?"
							) : isWorldsEnd ? (
								<div className="flex items-center gap-0.5">
									{Array.from({ length: starCount }, (_, i) => (
										<Star key={i} className="h-3 w-3 fill-current" />
									))}
								</div>
							) : (
								formatLevel(score.level)
							)}
						</Badge>
					</div>
				</div>

				<div className="flex flex-shrink-0 flex-col items-end gap-2">
					<div className="flex flex-col items-end">
						<span className="text-foreground text-[10px] font-medium tracking-wide uppercase">Score</span>
						<div className="flex items-baseline gap-1.5">
							<span className="text-foreground text-base font-medium tabular-nums">
								{score.score?.toLocaleString() ?? "-"}
							</span>
							<span className="text-foreground text-sm font-medium">{getChunithmGrade(score.score ?? 0)}</span>
						</div>
						<div className="mt-1 h-6">
							{score.skillName ? (
								<Badge
									variant="secondary"
									className="h-6 max-w-full overflow-hidden rounded-sm px-2 text-ellipsis whitespace-nowrap"
								>
									{score.skillName}
								</Badge>
							) : (
								<Skeleton className="h-6 w-16 rounded-sm" />
							)}
						</div>
					</div>
					<div className="flex flex-col items-end">
						<span className="text-foreground text-[10px] font-medium tracking-wide uppercase">Player Rating</span>
						<div className="mt-0.5">
							{ratingValue > 0 && version ? (
								<ChunithmRatingColors rating={ratingValue} version={version} />
							) : (
								<span className="text-foreground text-sm font-medium">-</span>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="flex items-center">
				<ChunithmAchievementBadges
					isFullCombo={score.isFullCombo ?? 0}
					isAllJustice={score.isAllJustice ?? 0}
					isClear={score.isClear ?? 0}
					fullChainKind={score.fullChainKind ?? 0}
					score={score.score ?? 0}
					skillId={score.skillId ?? 0}
				/>
			</div>

			<Separator />
			<div className="text-muted-foreground flex flex-col gap-2 pt-2.5 text-xs font-medium md:flex-row md:items-center md:justify-between md:gap-2 md:pt-0">
				<div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs font-medium md:flex-nowrap">
					{score.userPlayDate ? (
						<>
							<Badge variant="secondary" className="h-6 rounded-sm">
								{formatSqlDateToLocalParts(score.userPlayDate).date}
							</Badge>
							<Badge variant="secondary" className="h-6 rounded-sm">
								{formatSqlDateToLocalParts(score.userPlayDate).time}
							</Badge>
						</>
					) : (
						"—"
					)}
				</div>
				<div className="flex flex-nowrap items-center gap-1.5 md:ml-auto">
					{score.isNewRecord === 1 && (
						<Badge variant="secondary" className="h-6 rounded-sm font-bold uppercase">
							New Record
						</Badge>
					)}
					<VersionLogoBadge
						logoUrl={scoreVersionLogo}
						tooltip="Version the score was set in"
						alt={`Score version ${scoreVersionId ?? "unknown"}`}
					/>
					<VersionLogoBadge
						logoUrl={songVersionLogo}
						tooltip="Version the song originated in"
						alt={`Song version ${score.songVersion ?? "unknown"}`}
					/>
					<Badge
						variant="secondary"
						className="hover:bg-muted/70 h-6 cursor-pointer rounded-sm px-1.5 transition-colors"
						onClick={() => setIsDialogOpen(true)}
					>
						<Medal className="h-4 w-4" />
					</Badge>
				</div>
			</div>

			{isDialogOpen && (
				<Leaderboard
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}
					title="Song Leaderboard"
					description={score.title}
					isLoading={isLoadingLeaderboard}
					chartLevel={leaderboardData?.chart?.level}
					chartBadgeClassName={chunithmBadgeColors(score.chartId ?? 0)}
					totalScores={leaderboardData?.total ?? 0}
					entries={leaderboardData?.leaderboard ?? []}
					currentUserId={currentUserId ?? 0}
					renderRating={entry => {
						const level = leaderboardData?.chart?.level ?? 0
						if (level === 0 || !version) return null
						const entryRating = calculateChunithmRating(level, entry.score) / 100
						return <ChunithmRatingColors rating={entryRating} version={version} />
					}}
				/>
			)}
		</div>
	)
})

export default ChunithmScoreInfoCard

export { formatSqlDateToLocalParts, getChunithmGrade } from "@/app/shared/utils/chunithm"
