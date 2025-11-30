import { OngekiAchievementBadges } from "@/app/features/ongeki/components/achievement-badges"
import { Badge } from "@/app/shared/components/ui/badge"
import { Separator } from "@/app/shared/components/ui/separator"
import { Skeleton } from "@/app/shared/components/ui/skeleton"
import { useOngekiRatingInfo } from "@/app/features/ongeki/hooks/use-rating-info"
import { useImageLoading } from "@/app/shared/hooks/use-image-loading"
import { CDN } from "@/app/shared/utils/constants"
import { OngekiRating } from "@/app/shared/types"
import { formatOngekiScorePlaylogDate } from "@/app/shared/utils/ongeki"

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

export type OngekiRatingInfoCardProps = {
	score: OngekiRating
	levelColorBadge?: (chartId?: number | undefined) => string
	className?: string
	isRecommend?: boolean
	ongekiVersion?: number
}

export function OngekiRatingInfoCard(props: OngekiRatingInfoCardProps) {
	const { imageLoaded, onImageLoad } = useImageLoading()
	const { score, levelColorBadge, className = "", isRecommend = false, ongekiVersion } = props
	const rating = score

	const { calculatedRating, isRefresh } = useOngekiRatingInfo({
		playerRating: undefined,
		techScore: rating.techScoreMax,
		level: rating.level,
		isFullCombo: rating.isFullCombo,
		isAllBreak: rating.isAllBreake,
		isFullBell: rating.isFullBell,
		ongekiVersion
	})

	const formatLevel = (level?: number | null) => {
		if (level == null) return "?"
		return Number.isFinite(level) ? level.toFixed(1) : "?"
	}

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
							width={72}
							height={72}
							src={`${CDN}/ongeki/jacket/${rating.jacketPath ?? ""}`}
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
						{rating.title ?? ""}
					</h3>
					<div className="flex items-center gap-2">
						<span
							className={`inline-flex h-6 items-center rounded-md border-2 px-2.5 py-0.5 text-xs font-bold ${levelColorBadge ? levelColorBadge(rating.chartId ?? undefined) : "text-primary-foreground bg-primary"}`}
						>
							{formatLevel(rating.level)}
						</span>
					</div>
				</div>

				{/* Score and Rating */}
				<div className="flex flex-col items-end gap-2.5 flex-shrink-0 text-right">
					{!isRecommend && (
						<div>
							<div className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider mb-1">
								Tech Score
							</div>
							{rating.techScoreMax != null ? (
								rating.techScoreMax >= 1010000 ? (
									<div className="flex flex-col items-end gap-0.5">
										<span className="text-foreground text-lg font-bold tabular-nums">1,010,000</span>
										<span className="text-muted-foreground text-xs font-medium tabular-nums">
											(AB+: +{(rating.techScoreMax - 1010000).toLocaleString()})
										</span>
									</div>
								) : (
									<span className="text-foreground text-lg font-bold tabular-nums">
										{rating.techScoreMax.toLocaleString()}
									</span>
								)
							) : (
								<span className="text-foreground text-sm font-semibold tabular-nums">-</span>
							)}
						</div>
					)}
					<div>
						<div className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider mb-1">
							Rating
						</div>
						<div>
							{calculatedRating !== null ? (
								<OngekiRatingColors
									rating={calculatedRating}
									version={rating.version ?? 0}
									decimals={isRefresh ? 3 : 2}
								/>
							) : (
								<span className="text-foreground text-xs font-medium text-muted-foreground">-</span>
							)}
						</div>
					</div>
				</div>
			</div>

			{!isRecommend && (
				<div className="flex items-end justify-between gap-2 mb-2">
					<OngekiAchievementBadges
						isFullCombo={rating.isFullCombo ?? 0}
						isAllBreak={rating.isAllBreake ?? 0}
						isFullBell={rating.isFullBell ?? 0}
						techScore={rating.techScoreMax ?? 0}
					/>
					<PlatinumStars count={rating.platinumScoreStar ?? 0} />
				</div>
			)}

			{!isRecommend && rating.userPlayDate && (
				<>
					<Separator className="my-1.5" />
					<div className="flex flex-col gap-1.5 min-w-0 w-full">
						<div className="flex items-center gap-1.5 flex-wrap">
							{(() => {
								const { date, time } = formatOngekiScorePlaylogDate(rating.userPlayDate)
								return (
									<>
										<Badge variant="secondary" className="h-5 rounded-md text-xs px-1.5 flex-shrink-0 whitespace-nowrap">
											{date}
										</Badge>
										<Badge variant="secondary" className="h-5 rounded-md text-xs px-1.5 flex-shrink-0 whitespace-nowrap">
											{time}
										</Badge>
									</>
								)
							})()}
						</div>
						{(rating.isTechNewRecord === 1 || rating.isBattleNewRecord === 1) && (
							<div className="flex items-center gap-1.5 flex-wrap">
								{rating.isTechNewRecord === 1 && (
									<Badge
										variant="secondary"
										className="h-5 rounded-md text-xs font-semibold uppercase px-2 flex-shrink-0 whitespace-nowrap"
									>
										New Score Record
									</Badge>
								)}
								{rating.isBattleNewRecord === 1 && (
									<Badge
										variant="secondary"
										className="h-5 rounded-md text-xs font-semibold uppercase px-2 flex-shrink-0 whitespace-nowrap"
									>
										New Battle Record
									</Badge>
								)}
							</div>
						)}
					</div>
				</>
			)}
		</div>
	)
}

export default OngekiRatingInfoCard
