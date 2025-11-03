import { OngekiAchievementBadges } from "@/components/ongeki/achievement-badges"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useOngekiRatingInfo } from "@/hooks/ongeki/use-rating-info"
import { useImageLoading } from "@/hooks/use-image-loading"
import { CDN } from "@/lib/constants"
import { OngekiRating } from "@/shared/types"
import { formatOngekiScorePlaylogDate } from "@/utils/ongeki"

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
			className={`bg-card border-border flex h-full flex-col justify-between gap-3 rounded-sm border p-4 shadow-sm transition-shadow hover:shadow-md ${className}`}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 flex-1 items-start gap-3">
					<div className="relative h-16 w-16 flex-shrink-0">
						{!imageLoaded && <Skeleton className="absolute inset-0 rounded-sm" />}
						<img
							width={72}
							height={72}
							src={`${CDN}/ongeki/jacket/${rating.jacketPath ?? ""}`}
							className="h-16 w-16 flex-shrink-0 rounded-sm object-cover"
							alt={rating.title ?? ""}
							onLoad={onImageLoad}
							style={{ display: imageLoaded ? "block" : "none" }}
						/>
					</div>
					<div className="min-w-0 flex-1">
						<div className="text-foreground mb-2 text-xs leading-tight font-bold whitespace-nowrap sm:text-sm md:text-base">
							{rating.title ?? ""}
						</div>
						<span
							className={`inline-block rounded-sm border-2 px-2.5 py-1 text-xs font-bold ${levelColorBadge ? levelColorBadge(rating.chartId ?? undefined) : "text-primary-foreground bg-primary"}`}
						>
							{formatLevel(rating.level)}
						</span>
					</div>
				</div>

				<div className="flex flex-shrink-0 flex-col items-end gap-1.5">
					{!isRecommend && (
						<div className="flex flex-col items-end">
							<span className="text-foreground text-[10px] font-medium tracking-wide whitespace-nowrap uppercase">
								Tech Score
							</span>
							{rating.techScoreMax != null ? (
								rating.techScoreMax >= 1010000 ? (
									<div className="flex flex-col items-end gap-0.5">
										<span className="text-foreground text-base font-medium whitespace-nowrap tabular-nums">
											1,010,000
										</span>
										<span className="text-muted-foreground text-xs font-medium whitespace-nowrap tabular-nums">
											(AB+: +{(rating.techScoreMax - 1010000).toLocaleString()})
										</span>
									</div>
								) : (
									<span className="text-foreground text-base font-medium whitespace-nowrap tabular-nums">
										{rating.techScoreMax.toLocaleString()}
									</span>
								)
							) : (
								<span className="text-foreground text-base font-medium whitespace-nowrap tabular-nums">-</span>
							)}
						</div>
					)}
					<div className="flex flex-col items-end">
						<span className="text-foreground text-[10px] font-medium tracking-wide whitespace-nowrap uppercase">
							Rating
						</span>
						<div className="mt-0.5">
							{calculatedRating !== null ? (
								<OngekiRatingColors
									rating={calculatedRating}
									version={rating.version ?? 0}
									decimals={isRefresh ? 3 : 2}
								/>
							) : (
								<span className="text-foreground text-sm font-medium">-</span>
							)}
						</div>
					</div>
				</div>
			</div>

			{!isRecommend && (
				<div className="flex items-end justify-between">
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
					<Separator />
					<div className="text-muted-foreground flex flex-col gap-2 pt-2.5 text-xs font-medium md:flex-row md:items-center md:justify-between md:pt-0">
						<div className="flex flex-wrap items-center gap-1.5">
							{(() => {
								const { date, time } = formatOngekiScorePlaylogDate(rating.userPlayDate)
								return (
									<>
										<Badge variant="secondary" className="h-6 rounded-sm whitespace-nowrap">
											{date}
										</Badge>
										<Badge variant="secondary" className="h-6 rounded-sm whitespace-nowrap">
											{time}
										</Badge>
									</>
								)
							})()}
						</div>
						<div className="flex flex-wrap items-center gap-2 md:justify-end">
							{rating.isTechNewRecord === 1 && (
								<Badge
									variant="secondary"
									className="h-6 rounded-sm px-2 text-[10px] font-bold whitespace-nowrap uppercase"
								>
									New Score Record
								</Badge>
							)}
							{rating.isBattleNewRecord === 1 && (
								<Badge
									variant="secondary"
									className="h-6 rounded-sm px-2 text-[10px] font-bold whitespace-nowrap uppercase"
								>
									New Battle Record
								</Badge>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	)
}

export default OngekiRatingInfoCard
