import React from "react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CDN } from "@/lib/constants";
import { StaticMusic } from "@/shared/types";

type CardProps = {
	score: StaticMusic;
	levelColorBadge?: (chartId?: number | undefined) => string;
	className?: string;
	jacketArt?: string;
};

export const SongInfoCard: React.FC<CardProps> = ({ score, levelColorBadge, jacketArt }) => {
	const [imageLoaded, setImageLoaded] = React.useState(false);
	const song = score;

	const formatLevel = (c: { chartId?: number | null; level?: number | null }) => {
		if (c.level == null) return "?";
		return Number.isFinite(c.level) ? c.level.toFixed(1) : "?";
	};

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
						onLoad={() => setImageLoaded(true)}
						style={{ display: imageLoaded ? "block" : "none" }}
					/>
				</div>
				<div className="max-w-[180px] min-w-0 flex-1 md:max-w-[360px] lg:max-w-[160px] xl:max-w-[240px]">
					<div className="text-primary truncate font-bold">{song.title ?? ""}</div>
					<div className="text-primary truncate text-sm">{song.artist ?? "Unknown"}</div>
					<div className="text-primary text-sm">{song.genre ?? "N/A"}</div>
				</div>
			</div>
			<div className="mt-3 flex flex-wrap gap-2">
				{(song.charts || []).map((c, idx) => (
					<Badge
						key={`${String(c.chartId)}-${String(c.level)}-${idx}`}
						variant="outline"
						className={`flex min-h-[24px] items-center justify-center rounded-sm border-2 bg-transparent px-2.5 py-1 text-xs font-bold ${
							levelColorBadge ? levelColorBadge(c.chartId ?? undefined) : ""
						}`}
					>
						{formatLevel(c)}
					</Badge>
				))}
			</div>
		</div>
	);
};

export default SongInfoCard;
