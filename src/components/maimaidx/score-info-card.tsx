import React from "react";

import { Calendar, Clock } from "lucide-react";
import { DateTime } from "luxon";

import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CDN } from "@/lib/constants";
import { Mai2Playlog } from "@/shared/types";
import { getMaimaiDxComboStatus, getMaimaiDxGrade, getMaimaiDxSyncStatus, maimaiDxBadgeColors } from "@/utils/helpers";

interface AchievementBadgesProps {
	comboStatus?: number;
	syncStatus?: number;
	isClear?: number;
}

function AchievementBadges({ comboStatus, syncStatus }: AchievementBadgesProps) {
	const comboStatusText = getMaimaiDxComboStatus(comboStatus);
	const syncStatusText = getMaimaiDxSyncStatus(syncStatus);

	return (
		<div className="flex items-center gap-1">
			<div className="flex h-8 items-center justify-start md:h-10">
				{comboStatus && comboStatus !== 0 ? (
					<div className="rounded bg-yellow-600 px-2 py-1 text-xs font-bold text-white">{comboStatusText}</div>
				) : (
					<div className="h-2 w-16 rounded-sm bg-gray-300/20" />
				)}
			</div>

			<div className="flex h-8 items-center justify-start md:h-10">
				{syncStatusText ? (
					<div className="rounded bg-purple-600 px-2 py-1 text-xs font-bold text-white">{syncStatusText}</div>
				) : (
					<div className="h-2 w-16 rounded-sm bg-gray-300/20" />
				)}
			</div>
		</div>
	);
}

export type MaimaiDxScoreInfoCardProps = {
	score: Mai2Playlog;
	levelColorBadge?: (chartId?: number | undefined) => string;
	className?: string;
};

const MaimaiDxScoreInfoCard: React.FC<MaimaiDxScoreInfoCardProps> = ({ score, className = "" }) => {
	const [imageLoaded, setImageLoaded] = React.useState(false);

	const grade = getMaimaiDxGrade(score.achievement ?? 0);

	return (
		<div
			className={`bg-card border-border flex h-full flex-col gap-3 rounded-sm border p-4 shadow-sm transition-shadow hover:shadow-md ${className}`}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 flex-1 items-start gap-3">
					<div className="relative h-16 w-16 flex-shrink-0">
						{!imageLoaded && <Skeleton className="absolute inset-0 rounded-sm" />}
						<img
							width={64}
							height={64}
							src={`${CDN}/maimaidx/jackets/${score.musicId}.jpg`}
							className="h-16 w-16 rounded-sm object-cover"
							onLoad={() => setImageLoaded(true)}
							style={{ display: imageLoaded ? "block" : "none" }}
						/>
					</div>
					<div className="min-w-0 flex-1">
						<div className="text-foreground mb-2 truncate text-base leading-tight font-bold">{score.title}</div>
						<span
							className={`inline-block rounded-sm px-2.5 py-1 text-xs font-bold ${maimaiDxBadgeColors(score.level ?? 0)}`}
						>
							{score.difficulty ?? 0}
						</span>
					</div>
				</div>

				<div className="flex flex-shrink-0 flex-col items-end gap-1.5">
					<div className="flex flex-col items-end">
						<span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">Achievement</span>
						<div className="flex items-baseline gap-1.5">
							<span className="text-foreground text-lg font-semibold tabular-nums">
								{((score.achievement ?? 0) / 10000).toFixed(4)}%
							</span>
							<span className="text-foreground text-sm font-bold">{grade}</span>
						</div>
					</div>
					{score.deluxscore !== null && score.deluxscore !== undefined && (
						<div className="flex flex-col items-end">
							<span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">DX Score</span>
							<span className="text-foreground text-lg font-semibold tabular-nums">
								{(score.deluxscore ?? 0).toLocaleString()}
							</span>
						</div>
					)}
				</div>
			</div>

			<div className="flex items-center">
				<AchievementBadges
					comboStatus={score.comboStatus ?? 0}
					syncStatus={score.syncStatus ?? 0}
					isClear={score.isclear ?? 0}
				/>
			</div>

			{score.userPlayDate && (
				<>
					<Separator />
					<div className="text-muted-foreground flex items-center gap-3 pt-2.5 text-xs font-medium">
						<div className="flex items-center gap-1.5">
							<Calendar className="h-3.5 w-3.5" strokeWidth={2} />
							<span className="leading-none">
								{DateTime.fromSQL(score.userPlayDate, { zone: "Asia/Tokyo" }).toLocal().toLocaleString(DateTime.DATE_SHORT)}
							</span>
						</div>
						<div className="flex items-center gap-1.5">
							<Clock className="h-3.5 w-3.5" strokeWidth={2} />
							<span className="leading-none">
								{DateTime.fromSQL(score.userPlayDate, { zone: "Asia/Tokyo" }).toLocal().toLocaleString(DateTime.TIME_SIMPLE)}
							</span>
						</div>
					</div>
				</>
			)}
		</div>
	);
};
export default MaimaiDxScoreInfoCard;
