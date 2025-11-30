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
			className={`bg-card border-border relative flex h-full w-full flex-col rounded-lg border p-3 shadow-sm transition-all hover:shadow-md ${className}`}
		>
			{/* Top Section: Image, Title, Score */}
			<div className="flex items-start gap-3 mb-2">
				{/* Album Art */}
				<div className="flex-shrink-0">
					<div className="relative h-16 w-16">
						{!imageLoaded && <Skeleton className="absolute inset-0 rounded-md" />}
						<img
							width={72}
							height={72}
							src={`${CDN}/chunithm/jacket/${rating.jacketPath}`}
							className="h-16 w-16 rounded-md object-cover"
							alt={rating.title ?? ""}
							onLoad={onImageLoad}
							style={{ display: imageLoaded ? "block" : "none" }}
						/>
					</div>
				</div>

				{/* Title and Info */}
				<div className="flex-1 min-w-0 flex flex-col gap-1.5">
					<h3 className="text-foreground text-base font-semibold leading-snug break-words line-clamp-2">
						{rating.title}
					</h3>
					<div className="flex items-center gap-2">
						<span
							className={`inline-flex h-6 items-center rounded-md border-2 px-2.5 py-0.5 text-xs font-bold ${levelColorBadge ? levelColorBadge(rating.chartId ?? undefined) : "text-primary-foreground bg-primary"}`}
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

				{/* Score and Rating */}
				<div className="flex flex-col items-end gap-2.5 flex-shrink-0 text-right">
					{!isPotential && (
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
					)}
					<div>
						<div className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider mb-1">
							Rating
						</div>
						<div>
							<ChunithmRatingColors rating={calculatedRating} version={rating.version} />
						</div>
					</div>
				</div>
			</div>

			{!isPotential && (
				<div className="flex items-center gap-2 mb-2">
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
					<Separator className="my-1.5" />
					<div className="flex flex-col gap-1.5 min-w-0 w-full">
						{!isPotential && rating.userPlayDate && (
							<div className="flex items-center gap-1.5 flex-wrap">
								<Badge variant="secondary" className="h-5 rounded-md text-xs px-1.5 flex-shrink-0 whitespace-nowrap">
									{DateTime.fromSQL(rating.userPlayDate ?? "", { zone: "Asia/Tokyo" })
										.toLocal()
										.toLocaleString(DateTime.DATE_SHORT)}
								</Badge>
								<Badge variant="secondary" className="h-5 rounded-md text-xs px-1.5 flex-shrink-0 whitespace-nowrap">
									{DateTime.fromSQL(rating.userPlayDate, { zone: "Asia/Tokyo" })
										.toLocal()
										.toLocaleString(DateTime.TIME_SIMPLE)}
								</Badge>
							</div>
						)}
						{!isPotential && rating.isNewRecord === 1 && (
							<div className="flex items-center gap-1.5 flex-wrap">
								<Badge variant="secondary" className="h-5 rounded-md text-xs font-semibold uppercase px-2 flex-shrink-0 whitespace-nowrap">
									New Record
								</Badge>
							</div>
						)}
						{logoUrl && (
							<div className="flex items-center gap-1.5 flex-wrap">
								<Badge variant="secondary" className="h-5 rounded-sm p-0.5 flex-shrink-0">
									<img src={logoUrl} alt={`Version ${rating.version}`} className="max-h-4 w-auto object-contain" />
								</Badge>
							</div>
						)}
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
