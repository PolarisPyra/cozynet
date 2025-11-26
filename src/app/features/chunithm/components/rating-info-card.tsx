import { Star } from "lucide-react"
import { DateTime } from "luxon"

import { ChunithmAchievementBadges } from "@/app/features/chunithm/components/achievement-badges"
import { Badge } from "@/app/shared/components/ui/badge"
import { Separator } from "@/app/shared/components/ui/separator"
import { Skeleton } from "@/app/shared/components/ui/skeleton"
import { useImageLoading } from "@/app/shared/hooks/use-image-loading"
import { ChunithmRating } from "@/app/shared/types"
import { calculateChunithmRating, getChunithmGrade, levelToStars } from "@/app/shared/utils/chunithm"
import { CDN } from "@/app/shared/utils/constants"
import { getChunithmLogo } from "@/app/shared/utils/version-logos"

import { ChunithmRatingColors } from "./rating-colors"

export const ChunithmRatingInfoCard = function ({
	score,
	levelColorBadge,
	className = "",
	isPotential = false
}: ChunithmRatingInfoCardProps) {
	const { imageLoaded, onImageLoad } = useImageLoading()
	const rating = score
	const calculatedRating = calculateChunithmRating(rating.level ?? 0, rating.score ?? 0) / 100
	const logoUrl = getChunithmLogo.getLogo(rating.version)
	const isWorldsEnd = rating.chartId === 5
	const starCount = levelToStars(rating.level)

	const formatLevel = function (level?: number | null, chartId?: number | null) {
		if (level == null) return "?"
		const lvl = chartId === 5 ? (level + 1) / 2 : level
		return Number.isFinite(lvl) ? lvl.toFixed(1) : "?"
	}

	return (
		<div
			className={`bg-card border-border relative flex flex-col gap-3 rounded-sm border p-4 shadow-sm transition-shadow hover:shadow-md ${className}`}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 flex-1 items-start gap-3">
					<div className="relative h-16 w-16 flex-shrink-0">
						{!imageLoaded && <Skeleton className="absolute inset-0 rounded-sm" />}
						<img
							width={72}
							height={72}
							src={`${CDN}/chunithm/jacket/${rating.jacketPath}`}
							className="h-16 w-16 flex-shrink-0 rounded-sm object-cover"
							alt={rating.title ?? ""}
							onLoad={onImageLoad}
							style={{ display: imageLoaded ? "block" : "none" }}
						/>
					</div>
					<div className="min-w-0 flex-1">
						<div className="text-foreground mb-2 text-xs leading-tight font-bold whitespace-nowrap sm:text-sm md:text-base">
							{rating.title}
						</div>
						<span
							className={`inline-flex min-h-[1.5rem] items-center rounded-sm border-2 px-2.5 py-1 text-xs font-bold ${levelColorBadge ? levelColorBadge(rating.chartId ?? undefined) : "text-primary-foreground bg-primary"}`}
						>
							{rating.level == null || !Number.isFinite(rating.level) ? (
								"?"
							) : isWorldsEnd ? (
								<div className="flex items-center gap-0.5">
									{Array.from({ length: starCount }, (_, i) => (
										<Star key={i} className="h-3 w-3 fill-current" />
									))}
								</div>
							) : (
								formatLevel(rating.level, rating.chartId)
							)}
						</span>
					</div>
				</div>

				<div className="flex flex-shrink-0 flex-col items-end gap-1.5">
					{!isPotential && (
						<div className="flex flex-col items-end">
							<span className="text-foreground text-[10px] font-medium tracking-wide uppercase">Score</span>
							<div className="flex items-baseline gap-1.5">
								<span className="text-foreground text-base font-medium tabular-nums">
									{score.score?.toLocaleString() ?? "-"}
								</span>
								<span className="text-foreground text-sm font-medium">{getChunithmGrade(score.score ?? 0)}</span>
							</div>
						</div>
					)}
					<div className="flex flex-col items-end">
						<span className="text-foreground text-[10px] font-medium tracking-wide uppercase">Rating</span>
						<div className="mt-0.5">
							<ChunithmRatingColors rating={calculatedRating} version={rating.version} />
						</div>
					</div>
				</div>
			</div>

			{!isPotential && (
				<div className="flex items-center">
					<ChunithmAchievementBadges
						isFullCombo={rating.isFullCombo ?? 0}
						isAllJustice={rating.isAllJustice ?? 0}
						score={rating.score ?? 0}
						isClear={rating.isClear ?? 0}
						fullChainKind={rating.fullChainKind ?? 0}
						skillId={rating.skillId}
					/>
				</div>
			)}

			{(rating.userPlayDate || logoUrl || (!isPotential && rating.isNewRecord === 1)) && (
				<>
					<Separator />
					<div className="text-muted-foreground flex flex-col gap-2 pt-2.5 text-xs font-medium md:flex-row md:items-center md:justify-between md:gap-0 md:pt-0">
						{!isPotential && rating.userPlayDate && (
							<div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
								<Badge variant="secondary" className="h-6 rounded-sm">
									{DateTime.fromSQL(rating.userPlayDate ?? "", { zone: "Asia/Tokyo" })
										.toLocal()
										.toLocaleString(DateTime.DATE_SHORT)}
								</Badge>
								<Badge variant="secondary" className="h-6 rounded-sm">
									{DateTime.fromSQL(rating.userPlayDate, { zone: "Asia/Tokyo" })
										.toLocal()
										.toLocaleString(DateTime.TIME_SIMPLE)}
								</Badge>
							</div>
						)}
						<div className="flex flex-wrap items-center gap-2 md:ml-auto">
							{!isPotential && rating.isNewRecord === 1 && (
								<Badge variant="secondary" className="h-6 rounded-sm font-bold uppercase">
									New Record
								</Badge>
							)}
							{logoUrl && (
								<Badge variant="secondary" className="h-6 rounded-sm p-1">
									<img src={logoUrl} alt={`Version ${rating.version}`} className="max-h-5 w-auto object-contain" />
								</Badge>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	)
}

export default ChunithmRatingInfoCard

export type ChunithmRatingInfoCardProps = {
	score: ChunithmRating
	levelColorBadge?: (chartId?: number | undefined) => string
	className?: string
	isPotential?: boolean
}
