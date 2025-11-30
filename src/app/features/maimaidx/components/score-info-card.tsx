import { DateTime } from "luxon"

import { MaimaiAchievementBadges } from "@/app/features/maimaidx/components/achievement-badges"
import { Badge } from "@/app/shared/components/ui/badge"
import { Separator } from "@/app/shared/components/ui/separator"
import { Skeleton } from "@/app/shared/components/ui/skeleton"
import { useImageLoading } from "@/app/shared/hooks/use-image-loading"
import { CDN } from "@/app/shared/utils/constants"
import { Mai2Playlog } from "@/app/shared/types"
import { formatLevel } from "@/app/shared/utils/format-level"
import { getMaimaiDxGrade, maimaiDxBadgeColors } from "@/app/shared/utils/maimai"

export type MaimaiDxScoreInfoCardProps = {
	score: Mai2Playlog
	levelColorBadge?: (chartId?: number | undefined) => string
	className?: string
}

export function MaimaiDxScoreInfoCard({ score, className = "" }: MaimaiDxScoreInfoCardProps) {
	const { imageLoaded, onImageLoad } = useImageLoading()
	const grade = getMaimaiDxGrade(score.achievement ?? 0)

	return (
		<div
			className={`bg-card border-border flex h-full w-full flex-col rounded-lg border p-3 shadow-sm transition-all hover:shadow-md ${className}`}
		>
			{/* Top Section: Image, Title, Score */}
			<div className="flex items-start gap-3 mb-2">
				{/* Album Art */}
				<div className="flex-shrink-0">
					<div className="relative h-16 w-16">
						{!imageLoaded && <Skeleton className="absolute inset-0 rounded-md" />}
						<img
							width={64}
							height={64}
							src={`${CDN}/maimaidx/jackets/${score.musicId}.jpg`}
							className="h-16 w-16 rounded-md object-cover"
							onLoad={onImageLoad}
							style={{ display: imageLoaded ? "block" : "none" }}
						/>
					</div>
				</div>

				{/* Title and Info */}
				<div className="flex-1 min-w-0 flex flex-col gap-1.5">
					<h3 className="text-foreground text-base font-semibold leading-snug break-words line-clamp-2">
						{score.title}
					</h3>
					<div className="flex items-center gap-2">
						<span
							className={`inline-flex h-6 items-center rounded-md border-2 px-2.5 py-0.5 text-xs font-bold ${maimaiDxBadgeColors(score.level ?? 0)}`}
						>
							{formatLevel(score.difficulty)}
						</span>
					</div>
				</div>

				{/* Score and Rating */}
				<div className="flex flex-col items-end gap-2.5 flex-shrink-0 text-right">
					<div>
						<div className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider mb-1">
							Achievement
						</div>
						<div className="flex items-baseline gap-1.5">
							<span className="text-foreground text-lg font-bold tabular-nums">
								{((score.achievement ?? 0) / 10000).toFixed(4)}%
							</span>
							<span className="text-foreground text-xs font-semibold">{grade}</span>
						</div>
					</div>
					{score.deluxscore !== null && score.deluxscore !== undefined && (
						<div>
							<div className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider mb-1">
								DX Score
							</div>
							<span className="text-foreground text-base font-semibold tabular-nums">
								{(score.deluxscore ?? 0).toLocaleString()}
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Achievement Badges */}
			<div className="flex items-center gap-2 mb-2">
				<MaimaiAchievementBadges comboStatus={score.comboStatus ?? 0} syncStatus={score.syncStatus ?? 0} />
			</div>

			{score.userPlayDate && (
				<>
					<Separator className="my-1.5" />
					<div className="flex flex-col gap-1.5 min-w-0 w-full">
						{/* Row 1: Date and Time */}
						<div className="flex items-center gap-1.5 flex-wrap">
							<Badge variant="secondary" className="h-5 rounded-md text-xs px-1.5 flex-shrink-0 whitespace-nowrap">
								{DateTime.fromSQL(score.userPlayDate, { zone: "Asia/Tokyo" })
									.toLocal()
									.toLocaleString(DateTime.DATE_SHORT)}
							</Badge>
							<Badge variant="secondary" className="h-5 rounded-md text-xs px-1.5 flex-shrink-0 whitespace-nowrap">
								{DateTime.fromSQL(score.userPlayDate, { zone: "Asia/Tokyo" })
									.toLocal()
									.toLocaleString(DateTime.TIME_SIMPLE)}
							</Badge>
						</div>
					</div>
				</>
			)}
		</div>
	)
}
