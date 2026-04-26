import { useMemo } from "react"
import { Star } from "lucide-react"
import { DateTime } from "luxon"

import { ChunithmAchievementBadges } from "@/app/features/chunithm/components/achievement-badges"
import { Badge } from "@/app/shared/components/ui/badge"
import { Separator } from "@/app/shared/components/ui/separator"
import { Skeleton } from "@/app/shared/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/shared/components/ui/tooltip"
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

	const calculatedRating = useMemo<number | null>(() => {
		if (rating.level != null && rating.score != null) {
			return calculateChunithmRating(rating.level, rating.score) / 100
		}
		return null
	}, [rating.level, rating.score])

	const logoUrl = getChunithmLogo.getLogo(rating.version)
	const isWorldsEnd = rating.chartId === 5
	const starCount = levelToStars(rating.level)

	const formatLevel = function (level?: number | null, chartId?: number | null) {
		if (level == null) return "?"
		const lvl = chartId === 5 ? (level + 1) / 2 : level
		return Number.isFinite(lvl) ? lvl.toFixed(1) : "?"
	}

	const metaBadges = [
		...(!isPotential && rating.userPlayDate
			? [
				{
					key: "date",
					label: DateTime.fromSQL(rating.userPlayDate ?? "", { zone: "Asia/Tokyo" })
						.toLocal()
						.toLocaleString(DateTime.DATE_SHORT)
				},
				{
					key: "time",
					label: DateTime.fromSQL(rating.userPlayDate, { zone: "Asia/Tokyo" })
						.toLocal()
						.toLocaleString(DateTime.TIME_SIMPLE)
				}
			]
			: []),
		...(!isPotential && rating.isNewRecord === 1 ? [{ key: "new-record", label: "New Record" }] : [])
	]

	return (
		<div
			className={`bg-card border-border relative flex h-full w-full flex-col rounded-lg border p-3 shadow-sm transition-all hover:shadow-md ${className}`}
		>
			<div className="mb-2 flex items-start gap-3">
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

				<div className="flex min-w-0 flex-1 flex-col gap-1.5">
					<h3 className="text-foreground line-clamp-2 break-words text-base font-semibold leading-snug">
						{rating.title}
					</h3>

					<div className="flex items-center gap-2">
						<span
							className={`inline-flex h-6 items-center rounded-md border-2 px-2.5 py-0.5 text-xs font-bold ${levelColorBadge ? levelColorBadge(rating.chartId ?? undefined) : "text-primary-foreground bg-primary"
								}`}
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

					{!isPotential && (
						<div>
							<div className="text-muted-foreground mb-0.5 text-[9px] font-medium tracking-[0.08em] uppercase">
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
						<div className="text-muted-foreground mb-0.5 text-[9px] font-medium tracking-[0.08em] uppercase">
							Rating
						</div>
						<div>
							{calculatedRating !== null ? (
								<ChunithmRatingColors rating={calculatedRating} version={rating.version} />
							) : (
								<span className="text-muted-foreground text-xs font-medium">-</span>
							)}
						</div>
					</div>
				</div>
			</div>

			{!isPotential && (
				<div className="mb-2 flex items-center gap-2">
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

			{metaBadges.length > 0 && (
				<>
					<Separator className="my-1.5" />

					<div className="min-w-0 overflow-hidden">
						<div className="flex w-full flex-nowrap items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-0.5">
							{metaBadges.map(badge => (
								<Badge
									key={badge.key}
									variant="secondary"
									className={`h-5 shrink-0 whitespace-nowrap rounded-md text-xs ${badge.key === "new-record" ? "px-2 font-semibold uppercase" : "px-1.5"
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

export default ChunithmRatingInfoCard

export type ChunithmRatingInfoCardProps = {
	score: ChunithmRating
	levelColorBadge?: (chartId?: number | undefined) => string
	className?: string
	isPotential?: boolean
}