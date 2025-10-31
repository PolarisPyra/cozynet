import React from "react";

import { DateTime } from "luxon";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CDN } from "@/lib/constants";
import { OngekiPlaylog } from "@/shared/types";
import { OngekiGekForceRating, OngekiRating as OngekiRatingCalc, getOngekiGrade } from "@/utils/helpers";

import { OngekiRatingColors } from "../common/rating-colors";

interface PlatinumStarsProps {
	count: number;
}

function PlatinumStars({ count }: PlatinumStarsProps) {
	const starUrl = (filled: boolean) => `${CDN}/ongeki/badges/${filled ? "filled" : "base"}/pstar.webp`;

	return (
		<div className="flex items-center gap-0.5 md:gap-1">
			{Array.from({ length: 5 }, (_, i) => {
				const filled = i < count;
				return (
					<span
						key={i}
						aria-hidden
						className="inline-block h-3 w-3 md:h-4 md:w-4"
						style={{
							WebkitMaskImage: `url(${starUrl(filled)})`,
							maskImage: `url(${starUrl(filled)})`,
							WebkitMaskRepeat: "no-repeat",
							maskRepeat: "no-repeat",
							WebkitMaskSize: "contain",
							maskSize: "contain",
							backgroundColor: filled ? "var(--foreground)" : "var(--muted-foreground)",
						}}
					/>
				);
			})}
		</div>
	);
}

interface AchievementBadgesProps {
	isFullCombo: number;
	isAllBreak: number;
	isFullBell: number;
	techScore: number;
}

function AchievementBadges({ isFullCombo, isAllBreak, isFullBell, techScore }: AchievementBadgesProps) {
	const grade = getOngekiGrade(techScore);
	const gradeImage = grade;

	return (
		<div className="flex items-center gap-1">
			<div className="flex h-8 w-8 items-center justify-start md:h-10 md:w-10">
				{isAllBreak === 1 ? (
					<img
						src={`${CDN}/ongeki/badges/filled/${techScore >= 1010000 ? "allbreakplus" : "allbreak"}.webp`}
						alt={techScore >= 1010000 ? "AB+ Badge" : "AB Badge"}
						className="h-8 w-8 object-contain md:h-10 md:w-10"
					/>
				) : isFullCombo === 1 ? (
					<img
						src={`${CDN}/ongeki/badges/filled/fullcombo.webp`}
						alt="FC Badge"
						className="h-8 w-8 object-contain md:h-10 md:w-10"
					/>
				) : (
					<Skeleton className="h-8 w-8 rounded-full md:h-10 md:w-10" />
				)}
			</div>
			<div className="flex h-8 w-8 items-center justify-start md:h-10 md:w-10">
				{isFullBell === 1 ? (
					<img
						src={`${CDN}/ongeki/badges/filled/fullbell.webp`}
						alt="FB Badge"
						className="h-8 w-8 object-contain md:h-10 md:w-10"
					/>
				) : (
					<Skeleton className="h-8 w-8 rounded-full md:h-10 md:w-10" />
				)}
			</div>
			<div className="flex h-8 w-8 items-center justify-start md:h-10 md:w-10">
				<img
					src={`${CDN}/ongeki/badges/filled/${gradeImage}.webp`}
					alt={`${grade} Badge`}
					className="h-8 w-8 object-contain md:h-10 md:w-10"
				/>
			</div>
		</div>
	);
}

export type OngekiScoreInfoCardProps = {
	score: OngekiPlaylog;
	isRefreshOrAbove?: boolean;
	levelColorBadge?: (chartId?: number | undefined) => string;
	className?: string;
};

const OngekiScoreInfoCard: React.FC<OngekiScoreInfoCardProps> = ({
	score,
	isRefreshOrAbove,
	levelColorBadge,
	className = "",
}) => {
	const [imageLoaded, setImageLoaded] = React.useState(false);

	const formatLevel = (level?: number | null) => {
		if (level == null) return "?";
		return Number.isFinite(level) ? level.toFixed(1) : "?";
	};

	const calculatedRating =
		score.playerRating && score.playerRating > 0
			? isRefreshOrAbove
				? score.playerRating / 1000
				: score.playerRating / 100
			: score.techScore != null && score.level != null
				? isRefreshOrAbove
					? OngekiGekForceRating(
							score.level,
							score.techScore,
							score.isFullCombo ?? 0,
							score.isAllBreak ?? 0,
							score.isFullBell ?? 0
						) / 1000
					: OngekiRatingCalc(score.level, score.techScore) / 100
				: null;

	return (
		<div
			className={`bg-card border-border flex h-full flex-col gap-3 rounded-sm border p-4 shadow-sm transition-shadow hover:shadow-md ${className}`}
		>
			<div className="flex flex-1 flex-col gap-3">
				<div className="flex items-start justify-between gap-3">
					<div className="flex min-w-0 flex-1 items-start gap-3">
						<div className="relative h-16 w-16 flex-shrink-0">
							{!imageLoaded && <Skeleton className="absolute inset-0 rounded-sm" />}
							<img
								width={72}
								height={72}
								src={`${CDN}/ongeki/jacket/${score.jacketPath}`}
								className="h-16 w-16 flex-shrink-0 rounded-sm object-cover"
								alt={score.title}
								onLoad={() => setImageLoaded(true)}
								style={{ display: imageLoaded ? "block" : "none" }}
							/>
						</div>
						<div className="min-w-0 flex-1">
							<div className="text-foreground mb-2 line-clamp-2 text-base leading-tight font-bold">{score.title}</div>
							<span
								className={`inline-block rounded-sm border-2 px-2.5 py-1 text-xs font-bold ${levelColorBadge ? levelColorBadge(score.chartId ?? undefined) : "text-primary-foreground bg-primary"}`}
							>
								{formatLevel(score.level)}
							</span>
						</div>
					</div>

					<div className="flex flex-shrink-0 flex-col items-end gap-1.5">
						<div className="flex flex-col items-end">
							<span className="text-muted-foreground text-[10px] font-medium tracking-wide whitespace-nowrap uppercase">
								Tech Score
							</span>
							{score.techScore != null ? (
								score.techScore >= 1010000 ? (
									<div className="flex flex-col items-end gap-0.5">
										<span className="text-foreground text-lg font-semibold whitespace-nowrap tabular-nums">
											1,010,000
										</span>
										<span className="text-muted-foreground text-xs font-medium whitespace-nowrap tabular-nums">
											(AB+: +{(score.techScore - 1010000).toLocaleString()})
										</span>
									</div>
								) : (
									<span className="text-foreground text-lg font-semibold whitespace-nowrap tabular-nums">
										{score.techScore.toLocaleString()}
									</span>
								)
							) : (
								<span className="text-foreground text-lg font-semibold whitespace-nowrap tabular-nums">-</span>
							)}
						</div>
						<div className="flex flex-col items-end">
							<span className="text-muted-foreground text-[10px] font-medium tracking-wide whitespace-nowrap uppercase">
								Player Rating
							</span>
							<div className="mt-0.5">
								{calculatedRating !== null ? (
									<OngekiRatingColors
										rating={calculatedRating}
										decimals={isRefreshOrAbove ? 3 : 2}
										isRefresh={isRefreshOrAbove}
									/>
								) : (
									<span className="text-foreground text-sm font-medium">-</span>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-end justify-between">
					<AchievementBadges
						isFullCombo={score.isFullCombo ?? 0}
						isAllBreak={score.isAllBreak ?? 0}
						isFullBell={score.isFullBell ?? 0}
						techScore={score.techScore ?? 0}
					/>
					<PlatinumStars count={score.platinumScoreStar ?? 0} />
				</div>
			</div>

			{score.userPlayDate ? (
				<>
					<Separator />
					<div className="text-muted-foreground flex flex-col gap-2 text-xs font-medium md:flex-row md:items-center md:justify-between">
						<div className="flex flex-wrap items-center gap-1.5">
							<Badge variant="secondary" className="h-6 rounded-sm whitespace-nowrap">
								{DateTime.fromISO(score.userPlayDate.replace("Z", ""), { zone: "Asia/Tokyo" })
									.toLocal()
									.toLocaleString(DateTime.DATE_SHORT)}
							</Badge>
							<Badge variant="secondary" className="h-6 rounded-sm whitespace-nowrap">
								{DateTime.fromISO(score.userPlayDate.replace("Z", ""), { zone: "Asia/Tokyo" })
									.toLocal()
									.toLocaleString(DateTime.TIME_SIMPLE)}
							</Badge>
						</div>
						<div className="flex flex-wrap items-center gap-2 md:justify-end">
							{score.isTechNewRecord === 1 && (
								<Badge variant="secondary" className="h-6 rounded-sm px-2 text-[10px] font-bold whitespace-nowrap uppercase">
									New Score Record
								</Badge>
							)}
							{score.isBattleNewRecord === 1 && (
								<Badge variant="secondary" className="h-6 rounded-sm px-2 text-[10px] font-bold whitespace-nowrap uppercase">
									New Battle Record
								</Badge>
							)}
						</div>
					</div>
				</>
			) : (
				<div className="h-[52px]" />
			)}
		</div>
	);
};

export default OngekiScoreInfoCard;
