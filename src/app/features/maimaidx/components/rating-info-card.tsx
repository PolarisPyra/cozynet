import { DateTime } from "luxon"

import { MaimaiAchievementBadges } from "@/app/features/maimaidx/components/achievement-badges"
import { Badge } from "@/app/shared/components/ui/badge"
import { Separator } from "@/app/shared/components/ui/separator"
import { Skeleton } from "@/app/shared/components/ui/skeleton"
import { useImageLoading } from "@/app/shared/hooks/use-image-loading"
import { MaimaiRating } from "@/app/shared/types"
import { CDN } from "@/app/shared/utils/constants"
import { formatMaimaiDxAchievement, maimaiDxBadgeColors } from "@/app/shared/utils/maimai"

export type MaimaiRatingInfoCardProps = {
	score: MaimaiRating
	levelColorBadge?: (chartId?: number | undefined) => string
	className?: string
}

export function MaimaiRatingInfoCard({ score, levelColorBadge, className = "" }: MaimaiRatingInfoCardProps) {
	const { imageLoaded, onImageLoad } = useImageLoading()
	const rating = score

	const formatLevel = (difficulty?: number | null) => {
		if (difficulty == null) return "?"
		return Number.isFinite(difficulty) ? difficulty.toFixed(1) : "?"
	}

	const getJacketId = (musicId: number): string => {
		const musicIdStr = musicId.toString()
		const lastFourDigits = musicIdStr.slice(-4)
		return lastFourDigits.padStart(6, "0")
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
							src={`${CDN}/maimaidx/jackets/${getJacketId(rating.musicId)}.jpg`}
							className="h-16 w-16 rounded-md object-cover"
							alt={rating.title ?? ""}
							onLoad={onImageLoad}
							style={{ display: imageLoaded ? "block" : "none" }}
							onError={e => {
								const target = e.target as HTMLImageElement
								target.src = `${CDN}/maimaidx/jackets/000000.jpg`
							}}
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
							className={`inline-flex h-6 items-center rounded-md border-2 px-2.5 py-0.5 text-xs font-bold ${levelColorBadge ? levelColorBadge(rating.level ?? undefined) : maimaiDxBadgeColors(rating.level ?? 0)}`}
						>
							{formatLevel(rating.difficulty)}
						</span>
					</div>
				</div>

				{/* Score and Rating */}
				<div className="flex flex-col items-end gap-2.5 flex-shrink-0 text-right">
					<div>
						<div className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider mb-1">
							Achievement
						</div>
						<span className="text-foreground text-lg font-bold tabular-nums">
							{rating.achievement ? formatMaimaiDxAchievement(rating.achievement) : "-"}
						</span>
					</div>
					<div>
						<div className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider mb-1">
							Rating
						</div>
						<span className="text-foreground text-base font-semibold tabular-nums">{rating.rating}</span>
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2 mb-2">
				<MaimaiAchievementBadges comboStatus={rating.comboStatus ?? 0} syncStatus={rating.syncStatus ?? 0} />
			</div>

			{rating.userPlayDate && (
				<>
					<Separator className="my-1.5" />
					<div className="flex flex-col gap-1.5 min-w-0 w-full">
						{/* Row 1: Date and Time */}
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
					</div>
				</>
			)}
		</div>
	)
}

export default MaimaiRatingInfoCard
