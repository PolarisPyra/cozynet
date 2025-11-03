import { Calendar, Clock } from "lucide-react"
import { DateTime } from "luxon"

import { MaimaiAchievementBadges } from "@/components/maimaidx/achievement-badges"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useImageLoading } from "@/hooks/use-image-loading"
import { CDN } from "@/lib/constants"
import { Mai2Playlog } from "@/shared/types"
import { getMaimaiDxGrade, maimaiDxBadgeColors } from "@/utils/maimai"

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
			className={`bg-card border-border flex h-full flex-col gap-3 rounded-sm border p-4 shadow-sm transition-shadow hover:shadow-md ${className}`}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 flex-1 items-start gap-3">
					<div className="relative h-16 w-16 flex-shrink-0">
						{!imageLoaded && <Skeleton className="absolute inset-0 rounded-sm" />}
						<img
							width={64}
							height={64}
							src={`${CDN}/maimaidx/jackets/${score.musicId}.jpg`}
							className="h-16 w-16 rounded-sm object-cover"
							onLoad={onImageLoad}
							style={{ display: imageLoaded ? "block" : "none" }}
						/>
					</div>
					<div className="min-w-0 flex-1">
						<div className="text-foreground mb-2 text-xs leading-tight font-bold whitespace-nowrap sm:text-sm md:text-base">
							{score.title}
						</div>
						<span
							className={`inline-block rounded-sm px-2.5 py-1 text-xs font-bold ${maimaiDxBadgeColors(score.level ?? 0)}`}
						>
							{score.difficulty ?? 0}
						</span>
					</div>
				</div>

				<div className="flex flex-shrink-0 flex-col items-end gap-1.5">
					<div className="flex flex-col items-end">
						<span className="text-foreground text-[10px] font-medium tracking-wide uppercase">Achievement</span>
						<div className="flex items-baseline gap-1.5">
							<span className="text-foreground text-base font-medium tabular-nums">
								{((score.achievement ?? 0) / 10000).toFixed(4)}%
							</span>
							<span className="text-foreground text-sm font-medium">{grade}</span>
						</div>
					</div>
					{score.deluxscore !== null && score.deluxscore !== undefined && (
						<div className="flex flex-col items-end">
							<span className="text-foreground text-[10px] font-medium tracking-wide uppercase">DX Score</span>
							<span className="text-foreground text-base font-medium tabular-nums">
								{(score.deluxscore ?? 0).toLocaleString()}
							</span>
						</div>
					)}
				</div>
			</div>

			<div className="flex items-center">
				<MaimaiAchievementBadges comboStatus={score.comboStatus ?? 0} syncStatus={score.syncStatus ?? 0} />
			</div>

			{score.userPlayDate && (
				<>
					<Separator />
					<div className="text-muted-foreground flex items-center gap-3 pt-2.5 text-xs font-medium">
						<div className="flex items-center gap-1.5">
							<Calendar className="h-3.5 w-3.5" strokeWidth={2} />
							<span className="leading-none">
								{DateTime.fromSQL(score.userPlayDate, { zone: "Asia/Tokyo" })
									.toLocal()
									.toLocaleString(DateTime.DATE_SHORT)}
							</span>
						</div>
						<div className="flex items-center gap-1.5">
							<Clock className="h-3.5 w-3.5" strokeWidth={2} />
							<span className="leading-none">
								{DateTime.fromSQL(score.userPlayDate, { zone: "Asia/Tokyo" })
									.toLocal()
									.toLocaleString(DateTime.TIME_SIMPLE)}
							</span>
						</div>
					</div>
				</>
			)}
		</div>
	)
}
