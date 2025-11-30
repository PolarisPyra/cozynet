import { Badge } from "@/app/shared/components/ui/badge"
import { Separator } from "@/app/shared/components/ui/separator"
import { Skeleton } from "@/app/shared/components/ui/skeleton"
import { useImageLoading } from "@/app/shared/hooks/use-image-loading"
import { CDN } from "@/app/shared/utils/constants"
import { Mai2StaticMusic } from "@/app/shared/types"
import { formatMaimaiLevel, maimaiDxBadgeColors } from "@/app/shared/utils/maimai"
import { cn } from "@/app/shared/utils"

interface MaimaiDxSongInfoCardProps {
	score: Mai2StaticMusic
	jacketArt?: string
	levelColorBadge?: (chartId?: number) => string
}

export function MaimaiDxSongInfoCard({
	score,
	jacketArt = "maimaidx/jacket",
	levelColorBadge
}: MaimaiDxSongInfoCardProps) {
	const { imageLoaded, onImageLoad } = useImageLoading()
	const song = score
	const isUtage = song.songId && song.songId > 100000

	return (
		<div className={cn("bg-card border-border flex min-h-[180px] flex-col rounded-lg border p-3 shadow-sm transition-all hover:shadow-md")}>
			<div className="flex items-start gap-3 mb-2">
				<div className="relative h-16 w-16 flex-shrink-0">
					{!imageLoaded && <Skeleton className="absolute inset-0 rounded-md" />}
					<img
						width={72}
						height={72}
						src={`${CDN}/${jacketArt}/${song.jacketPath}`}
						alt={song.title ?? ""}
						className="h-16 w-16 flex-shrink-0 rounded-md object-cover"
						onLoad={onImageLoad}
						style={{ display: imageLoaded ? "block" : "none" }}
					/>
				</div>
				<div className="min-w-0 flex-1">
					<h3 className="text-foreground text-base font-semibold leading-snug break-words line-clamp-2 mb-1">
						{song.title}
					</h3>
					<div className="text-muted-foreground mb-0.5 line-clamp-1 text-xs">
						{song.artist || "Unknown"}
					</div>
					<div className="text-muted-foreground text-xs whitespace-nowrap">{song.genre || "N/A"}</div>
				</div>
			</div>
			<div className="flex min-h-[2rem] flex-wrap items-start gap-2 mb-2">
				{(song.charts || []).map((c, idx) => {
					const levelData = formatMaimaiLevel(c, Boolean(isUtage))

					return (
						<Badge
							key={`${String(c.chartId)}-${String(c.difficulty)}-${idx}`}
							variant="outline"
							className={cn(
								"inline-flex h-6 items-center rounded-md border-2 px-2.5 py-0.5 text-xs font-bold",
								isUtage
									? "border-blue-500"
									: levelColorBadge
										? levelColorBadge(c.chartId ?? undefined)
										: maimaiDxBadgeColors(c.difficulty ?? 0)
							)}
						>
							{levelData.value}
						</Badge>
					)
				})}
			</div>
			<Separator className="my-1.5" />
		</div>
	)
}
