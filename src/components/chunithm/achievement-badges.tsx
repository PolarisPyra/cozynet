import { Skeleton } from "@/components/ui/skeleton"
import { CDN } from "@/lib/constants"

interface ChunithmAchievementBadgesProps {
	isFullCombo: number
	isAllJustice: number
	score: number
	isClear: number
	fullChainKind: number
	skillId?: number
}

const clearBadges: Record<number, string> = {
	103003: "hard",
	103005: "brave",
	103006: "absolute",
	103007: "catastrophy"
}

export const ChunithmAchievementBadges = function({
	isFullCombo,
	isAllJustice,
	score,
	isClear,
	fullChainKind,
	skillId
}: ChunithmAchievementBadgesProps) {
	const clearBadge = (skillId && clearBadges[skillId]) || "clear"

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
	)
}

export default ChunithmAchievementBadges
