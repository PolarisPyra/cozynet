import { Badge } from "@/app/shared/components/ui/badge"
import { Skeleton } from "@/app/shared/components/ui/skeleton"
import { useImageLoading } from "@/app/shared/hooks/use-image-loading"
import { CDN } from "@/app/shared/utils/constants"
import { StaticMusic } from "@/app/shared/types"
import { formatOngekiLevel } from "@/app/shared/utils/ongeki"

type CardProps = {
	score: StaticMusic
	levelColorBadge?: (chartId?: number | undefined) => string
	className?: string
	jacketArt?: string
}

export function SongInfoCard({ score, levelColorBadge, jacketArt }: CardProps) {
	const { imageLoaded, onImageLoad } = useImageLoading()
	const song = score

	return (
		<div
			className={`bg-card border-border relative flex flex-col rounded-sm border p-3 pb-10 shadow-sm transition-shadow hover:shadow-md`}
		>
			<div className="flex items-start gap-3">
				<div className="relative h-16 w-16 flex-shrink-0">
					{!imageLoaded && <Skeleton className="absolute inset-0 rounded-sm" />}
					<img
						width={72}
						height={72}
						src={`${CDN}/${jacketArt}/${score.jacketPath ?? ""}`}
						alt={song.title ?? ""}
						className="h-16 w-16 flex-shrink-0 rounded-sm object-cover"
						onLoad={onImageLoad}
						style={{ display: imageLoaded ? "block" : "none" }}
					/>
				</div>
				<div className="max-w-[180px] min-w-0 flex-1 md:max-w-[360px] lg:max-w-[160px] xl:max-w-[240px]">
					<div className="text-primary text-xs font-bold whitespace-nowrap sm:text-sm md:text-base">
						{song.title ?? ""}
					</div>
					<div className="text-primary line-clamp-1 text-[10px] sm:text-xs">{song.artist ?? "Unknown"}</div>
					<div className="text-primary text-sm whitespace-nowrap">{song.genre ?? "N/A"}</div>
				</div>
			</div>
			<div className="mt-3 flex flex-wrap gap-2">
				{(song.charts || []).map((c, idx) => {
					const levelData = formatOngekiLevel(c)

					return (
						<Badge
							key={`${String(c.chartId)}-${String(c.level)}-${idx}`}
							variant="outline"
							className={`flex min-h-[24px] items-center justify-center rounded-sm border-2 bg-transparent px-2.5 py-1 text-xs font-bold ${
								levelColorBadge ? levelColorBadge(c.chartId ?? undefined) : ""
							}`}
						>
							{levelData.value}
						</Badge>
					)
				})}
			</div>
		</div>
	)
}
