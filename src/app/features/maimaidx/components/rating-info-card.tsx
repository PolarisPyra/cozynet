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
			className={`bg-card border-border flex h-full flex-col gap-3 rounded-sm border p-4 shadow-sm transition-shadow hover:shadow-md ${className}`}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 flex-1 items-start gap-3">
					<div className="relative h-16 w-16 flex-shrink-0">
						{!imageLoaded && <Skeleton className="absolute inset-0 rounded-sm" />}
						<img
							width={72}
							height={72}
							src={`${CDN}/maimaidx/jackets/${getJacketId(rating.musicId)}.jpg`}
							className="h-16 w-16 flex-shrink-0 rounded-sm object-cover"
							alt={rating.title ?? ""}
							onLoad={onImageLoad}
							style={{ display: imageLoaded ? "block" : "none" }}
							onError={e => {
								const target = e.target as HTMLImageElement
								target.src = `${CDN}/maimaidx/jackets/000000.jpg`
							}}
						/>
					</div>
					<div className="min-w-0 flex-1">
						<div className="text-foreground mb-2 text-xs leading-tight font-bold whitespace-nowrap sm:text-sm md:text-base">
							{rating.title}
						</div>
						<span
							className={`inline-block rounded-sm border-2 px-2.5 py-1 text-xs font-bold ${levelColorBadge ? levelColorBadge(rating.level ?? undefined) : maimaiDxBadgeColors(rating.level ?? 0)}`}
						>
							{formatLevel(rating.difficulty)}
						</span>
					</div>
				</div>

				<div className="flex flex-shrink-0 flex-col items-end gap-1.5">
					<div className="flex flex-col items-end">
						<span className="text-foreground text-[10px] font-medium tracking-wide uppercase">Achievement</span>
						<span className="text-foreground text-base font-medium tabular-nums">
							{rating.achievement ? formatMaimaiDxAchievement(rating.achievement) : "-"}
						</span>
					</div>
					<div className="flex flex-col items-end">
						<span className="text-foreground text-[10px] font-medium tracking-wide uppercase">Rating</span>
						<span className="text-foreground text-sm font-bold tabular-nums">{rating.rating}</span>
					</div>
				</div>
			</div>

			<div className="flex items-center">
				<MaimaiAchievementBadges comboStatus={rating.comboStatus ?? 0} syncStatus={rating.syncStatus ?? 0} />
			</div>

			{rating.userPlayDate && (
				<>
					<Separator />
					<div className="text-muted-foreground flex flex-col gap-2 pt-2.5 text-xs font-medium md:flex-row md:items-center md:justify-between md:pt-0">
						<div className="flex items-center gap-2">
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
					</div>
				</>
			)}
		</div>
	)
}

export default MaimaiRatingInfoCard
