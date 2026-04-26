import { useMemo } from "react"

import { OngekiAchievementBadges } from "@/app/features/ongeki/components/achievement-badges"
import { Badge } from "@/app/shared/components/ui/badge"
import { Separator } from "@/app/shared/components/ui/separator"
import { Skeleton } from "@/app/shared/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/shared/components/ui/tooltip"
import { useImageLoading } from "@/app/shared/hooks/use-image-loading"
import { OngekiRating } from "@/app/shared/types"
import { CDN } from "@/app/shared/utils/constants"
import {
	calculateOngekiGekForceRating,
	calculateOngekiPlatinumRating,
	calculateOngekiRating,
	formatOngekiScorePlaylogDate
} from "@/app/shared/utils/ongeki"
import { getOngekiLogo } from "@/app/shared/utils/version-logos"

import { OngekiRatingColors } from "./rating-colors"

interface PlatinumStarsProps {
	count: number
}

const PlatinumStars = ({ count }: PlatinumStarsProps) => {
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

export type OngekiRatingInfoCardProps = {
	score: OngekiRating
	levelColorBadge?: (chartId?: number | undefined) => string
	className?: string
	isRecommend?: boolean
	ongekiVersion?: number
	activeTab?: string
}

export function OngekiRatingInfoCard(props: OngekiRatingInfoCardProps) {
	const { imageLoaded, onImageLoad } = useImageLoading()
	const { score, levelColorBadge, className = "", isRecommend = false, ongekiVersion, activeTab } = props
	const rating = score

	const isRefresh = (ongekiVersion ?? 8) >= 8
	const isPScoreMode = activeTab === "pscore"
	const logoUrl = getOngekiLogo.getLogo(rating.version)

	const calculatedRating = useMemo<number | null>(() => {
		if (rating.techScoreMax != null && rating.level != null) {
			return isRefresh
				? calculateOngekiGekForceRating(
					rating.level,
					rating.techScoreMax,
					rating.isFullCombo ?? 0,
					rating.isAllBreake ?? 0,
					rating.isFullBell ?? 0
				) / 1000
				: calculateOngekiRating(rating.level, rating.techScoreMax) / 100
		}

		return null
	}, [rating.techScoreMax, rating.level, rating.isFullCombo, rating.isAllBreake, rating.isFullBell, isRefresh])

	const calculatedPlatinumRating = useMemo<number | null>(() => {
		if (rating.level != null && rating.platinumScoreStar != null) {
			return calculateOngekiPlatinumRating(rating.level, rating.platinumScoreStar) / 1000
		}

		return null
	}, [rating.level, rating.platinumScoreStar])

	const metaBadges = [
		...(!isRecommend && rating.userPlayDate
			? (() => {
				const { date, time } = formatOngekiScorePlaylogDate(rating.userPlayDate)

				return [
					{ key: "date", label: date },
					{ key: "time", label: time }
				]
			})()
			: []),
		...(!isRecommend && rating.isTechNewRecord === 1 ? [{ key: "new-score-record", label: "New Score Record" }] : []),
		...(!isRecommend && rating.isBattleNewRecord === 1 ? [{ key: "new-battle-record", label: "New Battle Record" }] : [])
	]

	const formatLevel = (level?: number | null) => {
		if (level == null) return "?"
		return Number.isFinite(level) ? level.toFixed(1) : "?"
	}

	return (
		<div
			className={`bg-card border-border flex h-full w-full flex-col rounded-lg border p-3 shadow-sm transition-all hover:shadow-md ${className}`}
		>
			<div className="mb-2 flex items-start gap-3">
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

				<div className="flex min-w-0 flex-1 flex-col gap-1.5">
					<h3 className="text-foreground line-clamp-2 break-words text-base font-semibold leading-snug">
						{rating.title ?? ""}
					</h3>

					<div className="flex items-center gap-2">
						<span
							className={`inline-flex h-6 items-center rounded-md border-2 px-2.5 py-0.5 text-xs font-bold ${levelColorBadge ? levelColorBadge(rating.chartId ?? undefined) : "text-primary-foreground bg-primary"
								}`}
						>
							{formatLevel(rating.level)}
						</span>
					</div>
				</div>

				<div className="flex flex-shrink-0 flex-col items-end gap-2.5 text-right">
					{logoUrl && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Badge variant="secondary" className="h-5 rounded-sm p-0.5">
									<img src={logoUrl} alt={`Version ${rating.version}`} className="max-h-4 w-auto object-contain" />
								</Badge>
							</TooltipTrigger>
							<TooltipContent>
								<p>Version the song originated in</p>
							</TooltipContent>
						</Tooltip>
					)}

					{!isRecommend && !isPScoreMode && (
						<div>
							<div className="text-muted-foreground mb-0.5 text-[9px] font-medium tracking-[0.08em] uppercase">
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

					{isPScoreMode ? (
						<div>
							<div className="text-muted-foreground mb-0.5 text-[9px] font-medium tracking-[0.08em] uppercase">
								P-Rating
							</div>
							<div>
								{calculatedPlatinumRating !== null ? (
									<span className="text-foreground text-lg font-bold tabular-nums">
										{calculatedPlatinumRating.toFixed(3)}
									</span>
								) : (
									<span className="text-muted-foreground text-xs font-medium">-</span>
								)}
							</div>

							{rating.platinumScoreMax != null && rating.platinumScoreStar != null && (
								<div className="mt-2">
									<div className="text-muted-foreground mb-0.5 text-[9px] font-medium tracking-[0.08em] uppercase">
										P-Score
									</div>
									<div className="flex flex-col items-end gap-0.5">
										{rating.noteCount != null ? (
											<span className="text-foreground text-sm font-bold tabular-nums">
												{rating.platinumScoreMax.toLocaleString()} / {(rating.noteCount * 2).toLocaleString()}
											</span>
										) : (
											<span className="text-foreground text-sm font-bold tabular-nums">
												{rating.platinumScoreMax.toLocaleString()}
											</span>
										)}
									</div>
								</div>
							)}
						</div>
					) : (
						<div>
							<div className="text-muted-foreground mb-0.5 text-[9px] font-medium tracking-[0.08em] uppercase">
								Rating
							</div>
							<div>
								{calculatedRating !== null ? (
									<OngekiRatingColors rating={calculatedRating} version={0} decimals={isRefresh ? 3 : 2} />
								) : (
									<span className="text-muted-foreground text-xs font-medium">-</span>
								)}
							</div>
						</div>
					)}
				</div>
			</div>

			{!isRecommend && (
				<div className="mb-2 flex items-end justify-between gap-2">
					<OngekiAchievementBadges
						isFullCombo={rating.isFullCombo ?? 0}
						isAllBreak={rating.isAllBreake ?? 0}
						isFullBell={rating.isFullBell ?? 0}
						techScore={rating.techScoreMax ?? 0}
					/>

					<PlatinumStars count={rating.platinumScoreStar ?? 0} />
				</div>
			)}

			{metaBadges.length > 0 && (
				<>
					<Separator className="my-1.5" />

					<div className="min-w-0 overflow-hidden">
						<div className="flex w-full flex-nowrap items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-0.5">
							{metaBadges.map(badge => (
								<Badge
									key={badge.key}
									variant="secondary"
									className={`h-5 shrink-0 whitespace-nowrap rounded-md text-xs ${badge.key === "new-score-record" || badge.key === "new-battle-record"
											? "px-2 font-semibold uppercase"
											: "px-1.5"
										}`}
								>
									{badge.label}
								</Badge>
							))}
						</div>
					</div>
				</>
			)}
		</div>
	)
}

export default OngekiRatingInfoCard