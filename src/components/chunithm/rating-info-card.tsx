import React from "react";

import { DateTime } from "luxon";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CDN } from "@/lib/constants";
import { ChunithmRating } from "@/shared/types";
import { ChunitmRating, getChunithmGrade } from "@/utils/helpers";
import { getChunithmLogo } from "@/utils/version-logos";

import { ChunithmRatingColors } from "../common/rating-colors";

interface AchievementBadgesProps {
	isFullCombo: number;
	isAllJustice: number;
	score: number;
	isClear: number;
	fullChainKind: number;
	skillId?: number;
}

const clearBadges: Record<number, string> = {
	103003: "hard",
	103005: "brave",
	103006: "absolute",
	103007: "catastrophy",
};

function AchievementBadges({
	isFullCombo,
	isAllJustice,
	score,
	isClear,
	fullChainKind,
	skillId,
}: AchievementBadgesProps) {
	// Use skill badge if skillId matches, otherwise default to "clear" if isClear = 1
	const clearBadge = (skillId && clearBadges[skillId]) || "clear";

	return (
		<div className="flex items-center gap-1">
			<div className="flex h-8 items-center justify-start md:h-10">
				{isClear === 1 ? (
					<img
						src={`${CDN}/chunithm/badges/filled/${clearBadge}.webp`}
						alt={`${clearBadge.charAt(0).toUpperCase() + clearBadge.slice(1)} Badge`}
						className="h-8 w-20 object-contain md:h-10 md:w-20"
					/>
				) : (
					<Skeleton className="h-2 w-16 rounded-sm" />
				)}
			</div>

			<div className="flex h-8 items-center justify-start md:h-10">
				{score === 1010000 ? (
					<img
						src={`${CDN}/chunithm/badges/filled/alljusticecritical.webp`}
						alt="AJC Badge"
						className="h-8 w-20 object-contain md:h-10 md:w-20"
					/>
				) : isAllJustice === 1 ? (
					<img
						src={`${CDN}/chunithm/badges/filled/alljustice.webp`}
						alt="AJ Badge"
						className="h-8 w-20 object-contain md:h-10 md:w-20"
					/>
				) : isFullCombo === 1 ? (
					<img
						src={`${CDN}/chunithm/badges/filled/fullcombo.webp`}
						alt="FC Badge"
						className="h-8 w-20 object-contain md:h-10 md:w-20"
					/>
				) : (
					<Skeleton className="h-2 w-16 rounded-sm" />
				)}
			</div>

			<div className="flex h-8 items-center justify-start md:h-10">
				{fullChainKind === 2 ? (
					<img
						src={`${CDN}/chunithm/badges/filled/fullchain_rainbow.webp`}
						alt="Full Chain Rainbow"
						className="h-8 w-10 object-contain md:h-10 md:w-10"
					/>
				) : fullChainKind === 1 ? (
					<img
						src={`${CDN}/chunithm/badges/filled/fullchain.webp`}
						alt="Full Chain"
						className="h-8 w-10 object-contain md:h-10 md:w-10"
					/>
				) : (
					<Skeleton className="h-2 w-16 rounded-sm" />
				)}
			</div>
		</div>
	);
}
export type ChunithmRatingInfoCardProps = {
	score: ChunithmRating;
	levelColorBadge?: (chartId?: number | undefined) => string;
	className?: string;
	isPotential?: boolean;
};

const ChunithmRatingInfoCard: React.FC<ChunithmRatingInfoCardProps> = ({
	score,
	levelColorBadge,
	className = "",
	isPotential = false,
}) => {
	const [imageLoaded, setImageLoaded] = React.useState(false);
	const rating = score;
	const calculatedRating = ChunitmRating(rating.level ?? 0, rating.score ?? 0) / 100;
	const logoUrl = getChunithmLogo.getLogo(rating.version);

	const formatLevel = (level?: number | null, chartId?: number | null) => {
		if (level == null) return "?";
		const lvl = chartId === 5 ? (level + 1) / 2 : level;
		return Number.isFinite(lvl) ? lvl.toFixed(1) : "?";
	};

	return (
		<div
			className={`bg-card border-border relative flex flex-col gap-3 rounded-sm border p-4 shadow-sm transition-shadow hover:shadow-md ${className}`}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 flex-1 items-start gap-3">
					<div className="relative h-16 w-16 flex-shrink-0">
						{!imageLoaded && <Skeleton className="absolute inset-0 rounded-sm" />}
						<img
							width={72}
							height={72}
							src={`${CDN}/chunithm/jacket/${rating.jacketPath}`}
							className="h-16 w-16 flex-shrink-0 rounded-sm object-cover"
							alt={rating.title ?? ""}
							onLoad={() => setImageLoaded(true)}
							style={{ display: imageLoaded ? "block" : "none" }}
						/>
					</div>
					<div className="min-w-0 flex-1">
						<div className="text-foreground mb-2 truncate text-base leading-tight font-bold">{rating.title}</div>
						<span
							className={`inline-block rounded-sm border-2 px-2.5 py-1 text-xs font-bold ${levelColorBadge ? levelColorBadge(rating.chartId ?? undefined) : "text-primary-foreground bg-primary"}`}
						>
							{formatLevel(rating.level, rating.chartId)}
						</span>
					</div>
				</div>

				<div className="flex flex-shrink-0 flex-col items-end gap-1.5">
					{!isPotential && (
						<div className="flex flex-col items-end">
							<span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">Score</span>
							<div className="flex items-baseline gap-1.5">
								<span className="text-foreground text-lg font-semibold tabular-nums">
									{score.score?.toLocaleString() ?? "-"}
								</span>
								<span className="text-foreground text-sm font-bold">{getChunithmGrade(score.score ?? 0)}</span>
							</div>
						</div>
					)}
					<div className="flex flex-col items-end">
						<span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
							{isPotential ? "Rating" : "Player Rating"}
						</span>
						<div className="mt-0.5">
							<ChunithmRatingColors rating={calculatedRating} />
						</div>
					</div>
				</div>
			</div>

			{!isPotential && (
				<div className="flex items-center">
					<AchievementBadges
						isFullCombo={rating.isFullCombo ?? 0}
						isAllJustice={rating.isAllJustice ?? 0}
						score={rating.score ?? 0}
						isClear={rating.isClear ?? 0}
						fullChainKind={rating.fullChainKind ?? 0}
						skillId={rating.skillId}
					/>
				</div>
			)}

			{(rating.userPlayDate || logoUrl || (!isPotential && rating.isNewRecord === 1)) && (
				<>
					<Separator />
					<div className="text-muted-foreground flex flex-col gap-2 pt-2.5 text-xs font-medium md:flex-row md:items-center md:justify-between md:gap-0 md:pt-0">
						{!isPotential && rating.userPlayDate && (
							<div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
								<Badge variant="secondary" className="h-6 rounded-sm">
									{DateTime.fromSQL(rating.userPlayDate ?? "", { zone: "Asia/Tokyo" })
										.toLocal()
										.toLocaleString(DateTime.DATE_SHORT)}
								</Badge>
								<Badge variant="secondary" className="h-6 rounded-sm">
									{DateTime.fromSQL(rating.userPlayDate, { zone: "Asia/Tokyo" }).toLocal().toLocaleString(DateTime.TIME_SIMPLE)}
								</Badge>
							</div>
						)}
						<div className="flex flex-wrap items-center gap-2 md:ml-auto">
							{!isPotential && rating.isNewRecord === 1 && (
								<Badge variant="secondary" className="h-6 rounded-sm font-bold uppercase">
									New Record
								</Badge>
							)}
							{logoUrl && (
								<Badge variant="secondary" className="h-6 rounded-sm p-1">
									<img src={logoUrl} alt={`Version ${rating.version}`} className="max-h-5 w-auto object-contain" />
								</Badge>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default ChunithmRatingInfoCard;
