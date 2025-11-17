import { Skeleton } from "@/app/shared/components/ui/skeleton"
import { CDN } from "@/app/shared/utils/constants"
import { getOngekiGrade } from "@/app/shared/utils/ongeki"

interface OngekiAchievementBadgesProps {
	isFullCombo: number
	isAllBreak: number
	isFullBell: number
	techScore: number
}

export const OngekiAchievementBadges = function ({
	isFullCombo,
	isAllBreak,
	isFullBell,
	techScore
}: OngekiAchievementBadgesProps) {
	const grade = getOngekiGrade(techScore)
	const gradeImage = grade

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
	)
}

export default OngekiAchievementBadges
