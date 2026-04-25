import { Star } from "lucide-react"

import { CardImage } from "@/app/shared/components/common/card-image"
import { Badge } from "@/app/shared/components/ui/badge"
import { Separator } from "@/app/shared/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/shared/components/ui/tooltip"
import { StaticMusic } from "@/app/shared/types"
import { chunithmBadgeColors, levelToStars } from "@/app/shared/utils/chunithm"
import { CDN } from "@/app/shared/utils/constants"
import { getChunithmLogo } from "@/app/shared/utils/version-logos"
import { cn } from "@/app/shared/utils"

export const SongInfoCard = function ({ score, levelColorBadge, jacketArt }: CardProps) {
	const song = score
	const logoUrl = getChunithmLogo.getLogo(song.version)

	const formatLevel = (level: number) => {
		return level.toFixed(1)
	}

	return (
		<div className={cn("bg-card border-border/60 flex h-full min-h-[220px] flex-col rounded-xl border p-3 shadow-sm")}>
			<div className="flex items-start gap-3 mb-2">
				<CardImage src={`${CDN}/${jacketArt}/${song.jacketPath}`} alt={song.title ?? ""} width={72} height={72} className="w-16 h-16 rounded-md" />
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
					const isWorldsEnd = c.chartId === 5
					const starCount = levelToStars(c.level)
					return (
						<Badge
							key={`${String(c.chartId)}-${String(c.level)}-${idx}`}
							variant="outline"
							className={cn(
								"inline-flex h-6 items-center rounded-md border-2 px-2.5 py-0.5 text-xs font-bold",
								levelColorBadge ? levelColorBadge(c.chartId ?? undefined) : chunithmBadgeColors(c.chartId ?? 0)
							)}
						>
							{isWorldsEnd ? (
								<div className="flex items-center gap-0.5">
									{Array.from({ length: starCount }, (_, i) => (
										<Star key={i} className="h-3 w-3 fill-current" />
									))}
								</div>
							) : (
								formatLevel(c.level!)
							)}
						</Badge>
					)
				})}
			</div>

			<Separator className="my-1.5" />

			<div className="mt-auto flex min-w-0 w-full flex-col gap-1.5">
				<div className="flex items-center gap-1.5 flex-wrap justify-end">
					{logoUrl && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Badge variant="secondary" className="h-5 rounded-sm p-0.5">
									<img src={logoUrl} alt="Version Logo" className="max-h-4 w-auto object-contain" />
								</Badge>
							</TooltipTrigger>
							<TooltipContent>
								<p>Version the song originated in</p>
							</TooltipContent>
						</Tooltip>
					)}
				</div>
			</div>
		</div>
	)
}

export default SongInfoCard

type CardProps = {
	score: StaticMusic
	levelColorBadge?: (chartId?: number | undefined) => string
	className?: string
	jacketArt?: string
}
