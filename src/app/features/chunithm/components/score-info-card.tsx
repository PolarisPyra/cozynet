import { memo, useMemo, useState } from "react"

import { Medal, Star } from "lucide-react"

import { ChunithmAchievementBadges } from "@/app/features/chunithm/components/achievement-badges"
import { useScoreLeaderboard } from "@/app/features/chunithm/hooks/use-score-leaderboard"
import { CardImage } from "@/app/shared/components/common/card-image"
import { Leaderboard } from "@/app/shared/components/leaderboard"
import { Badge } from "@/app/shared/components/ui/badge"
import { Separator } from "@/app/shared/components/ui/separator"
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
				<Badge variant="secondary" className="h-5 rounded-sm p-0.5">
					<img src={logoUrl} alt={alt} className="max-h-4 w-auto object-contain" />
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
		const calculatedRating =
			score.score != null && score.level != null ? calculateChunithmRating(score.level, score.score) / 100 : null
		return {
			scoreVersionId: versionId,
			scoreVersionLogo: getChunithmLogo.getLogo(versionId),
			songVersionLogo: getChunithmLogo.getLogo(score.songVersion),
			ratingValue: calculatedRating ?? convertChunithmScoreRating(score.playerRating),
			isWorldsEnd: score.chartId === 5,
			starCount: levelToStars(score.level)
		}
	}, [score.romVersion, score.songVersion, score.playerRating, score.chartId, score.level, score.score])

	const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useScoreLeaderboard(
		score.musicId ?? 0,
		score.chartId ?? 0,
		100,
		isDialogOpen
	)

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
					<CardImage
						src={`${CDN}/chunithm/jacket/${score.jacketPath}`}
						alt={score.title ?? ""}
						width={64}
						height={64}
						className="w-16 h-16 rounded-md"
					/>
				</div>

				{/* Title and Info */}
				<div className="flex-1 min-w-0 flex flex-col gap-1.5">
					<h3 className="text-foreground text-base font-semibold leading-snug break-words line-clamp-2">
						{score.title}
					</h3>
					<div className="flex items-center gap-2">
						<Badge
							variant="outline"
							className={cn(
								"inline-flex h-6 items-center rounded-md border-2 px-2.5 py-0.5 text-xs font-bold",
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

				{/* Score and Rating */}
				<div className="flex flex-col items-end gap-2.5 flex-shrink-0 text-right">
					<div>
						<div className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider mb-1">
							Score
						</div>
						<div className="flex items-baseline gap-1.5">
							<span className="text-foreground text-lg font-bold tabular-nums">
								{score.score?.toLocaleString() ?? "-"}
							</span>
							<span className="text-foreground text-xs font-semibold">{getChunithmGrade(score.score ?? 0)}</span>
						</div>
					</div>
					<div>
						<div className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider mb-1">
							Player Rating
						</div>
						<div>
							{ratingValue > 0 ? (
								(version || scoreVersionId) ? (
									<ChunithmRatingColors rating={ratingValue} version={version || scoreVersionId} />
								) : (
									<span className="text-foreground text-sm font-semibold">{ratingValue.toFixed(2)}</span>
								)
							) : (
								<span className="text-foreground text-xs font-medium text-muted-foreground">-</span>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Achievement Badges */}
			<div className="flex flex-col gap-2 mb-2">
				<div className="flex items-center gap-2">
					<ChunithmAchievementBadges
						isFullCombo={score.isFullCombo ?? 0}
						isAllJustice={score.isAllJustice ?? 0}
						isClear={score.isClear ?? 0}
						fullChainKind={score.fullChainKind ?? 0}
						score={score.score ?? 0}
						skillId={score.skillId ?? 0}
					/>
				</div>
				{score.skillName && (
					<Badge
						variant="secondary"
						className="h-5 rounded-md px-2 text-xs w-fit"
					>
						{score.skillName}
					</Badge>
				)}
			</div>

			<Separator className="my-1.5" />

			{/* Footer */}
			<div className="flex flex-col gap-1.5 min-w-0 w-full">
				<div className="flex items-center gap-1.5 flex-wrap">
					{score.userPlayDate ? (
						<>
							<Badge variant="secondary" className="h-5 rounded-md text-xs px-1.5 flex-shrink-0 whitespace-nowrap">
								{formatSqlDateToLocalParts(score.userPlayDate).date}
							</Badge>
							<Badge variant="secondary" className="h-5 rounded-md text-xs px-1.5 flex-shrink-0 whitespace-nowrap">
								{formatSqlDateToLocalParts(score.userPlayDate).time}
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
					{score.isNewRecord === 1 && (
						<Badge variant="secondary" className="h-5 rounded-md text-xs font-semibold uppercase px-2 flex-shrink-0 whitespace-nowrap">
							New Record
						</Badge>
					)}
				</div>
				<div className="flex items-center gap-1.5 flex-wrap">
					{score.isImported === 1 ? (
						<Badge variant="secondary" className="h-5 rounded-md px-2 text-xs font-medium">
							Imported
						</Badge>
					) : (
						<VersionLogoBadge
							logoUrl={scoreVersionLogo}
							tooltip="Version the score was set in"
							alt={`Score version ${scoreVersionId ?? "unknown"}`}
						/>
					)}
					<VersionLogoBadge
						logoUrl={songVersionLogo}
						tooltip="Version the song originated in"
						alt={`Song version ${score.songVersion ?? "unknown"}`}
					/>
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

