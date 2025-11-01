import { useState } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { CDN } from "@/lib/constants"
import { Mai2StaticMusic } from "@/shared/types"

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
	const [imageLoaded, setImageLoaded] = useState(false)
	const song = score
	const isUtage = song.songId && song.songId > 100000

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
					let difficultyValue = "?"

					if (typeof c.difficulty === "number") {
						const baseLevel = Math.floor(c.difficulty)

						if (isUtage) {
							const isPlus = (c.difficulty * 10) % 10 >= 6
							difficultyValue = isPlus ? `${baseLevel}+ ?` : `${baseLevel} ?`
						} else {
							difficultyValue = c.difficulty.toFixed(1)
						}
					}

					return (
						<span
							key={`${String(c.chartId)}-${String(c.difficulty)}-${idx}`}
							className={`rounded-sm border-2 px-2.5 py-1 text-xs font-bold ${
								isUtage ? "border-blue-500" : levelColorBadge ? levelColorBadge(c.chartId ?? undefined) : ""
							}`}
						>
							{difficultyValue}
						</span>
					)
				})}
			</div>
		</div>
	)
}
