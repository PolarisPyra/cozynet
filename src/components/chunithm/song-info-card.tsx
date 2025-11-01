import React from "react"

import { Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CDN } from "@/lib/constants"
import { StaticMusic } from "@/shared/types"
import { getChunithmLogo } from "@/utils/version-logos"

export const SongInfoCard = function({ score, levelColorBadge, jacketArt }: CardProps) {
	const [imageLoaded, setImageLoaded] = React.useState(false)
	const song = score

	const worldsEnd = function(level?: number | null, chartId?: number | null) {
		if (level == null) return "?"
		if (chartId === 5) {
			const stars = Math.floor((level + 1) / 2)
			return { isWorldsEnd: true, starCount: stars > 0 ? stars : 1 }
		}
		return { isWorldsEnd: false, value: Number.isFinite(level) ? level.toFixed(1) : "?" }
	}

	const logoUrl = getChunithmLogo.getLogo(song.version)

	return (
		<div className="bg-card border-border flex flex-col gap-3 rounded-sm border p-4 shadow-sm transition-shadow hover:shadow-md">
			<div className="flex items-start gap-3">
				<div className="relative h-16 w-16 flex-shrink-0">
					{!imageLoaded && <Skeleton className="absolute inset-0 rounded-sm" />}
					<img
						width={72}
						height={72}
						src={`${CDN}/${jacketArt}/${song.jacketPath}`}
						alt={song.title ?? ""}
						className="h-16 w-16 flex-shrink-0 rounded-sm object-cover"
						onLoad={() => setImageLoaded(true)}
						style={{ display: imageLoaded ? "block" : "none" }}
					/>
				</div>
				<div className="min-w-0 flex-1">
					<div className="text-foreground mb-1 text-xs leading-tight font-bold whitespace-nowrap sm:text-sm md:text-base">
						{song.title}
					</div>
					<div className="text-muted-foreground mb-0.5 text-[10px] sm:text-xs">{song.artist || "Unknown"}</div>
					<div className="text-muted-foreground text-xs">{song.genre || "N/A"}</div>
				</div>
			</div>
			<div className="flex flex-wrap gap-2">
				{(song.charts || []).map((c, idx) => {
					const levelData = worldsEnd(c.level, c.chartId)
					const isWorldsEnd = typeof levelData === "object" && levelData.isWorldsEnd

					return (
						<span
							key={`${String(c.chartId)}-${String(c.level)}-${idx}`}
							className={`flex min-h-[24px] items-center justify-center rounded-sm border-2 px-2.5 py-1 text-xs font-bold ${
								levelColorBadge ? levelColorBadge(c.chartId ?? undefined) : ""
							}`}
						>
							{isWorldsEnd && typeof levelData === "object" ? (
								<span className="flex items-center gap-0.5">
									{Array.from({ length: levelData.starCount ?? 1 }).map((_, i) => (
										<Star key={i} className="h-4 w-4 fill-current" />
									))}
								</span>
							) : typeof levelData === "object" ? (
								levelData.value
							) : (
								levelData
							)}
						</span>
					)
				})}
			</div>

			{logoUrl && (
				<div className="border-border/50 flex justify-end border-t pt-2.5">
					<Badge variant="secondary" className="h-6 rounded-sm p-1">
						<img src={logoUrl} alt="Version Logo" className="max-h-5 w-auto object-contain" />
					</Badge>
				</div>
			)}
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
