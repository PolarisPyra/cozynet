import { useMaimaiDxVersion } from "@/app/features/maimaidx/hooks"

interface MaimaiRatingDisplayProps {
	playerRating: number | null
	highestRating: number | null
}

export function MaimaiRatingDisplay({ playerRating, highestRating }: MaimaiRatingDisplayProps) {
	const version = useMaimaiDxVersion()

	return (
		<div className="flex flex-col gap-1">
			<div className="flex flex-col">
				<div className="flex items-center gap-2">
					<span className="font-bold">Player Rating:</span>
					{playerRating !== null && playerRating !== undefined && version ? (
						<span className="font-bold tabular-nums">{playerRating}</span>
					) : (
						<span className="font-bold">Loading...</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					<span className="font-bold">Highest Rating:</span>
					{highestRating !== null && highestRating !== undefined && version ? (
						<span className="font-bold tabular-nums">{highestRating}</span>
					) : (
						<span className="font-bold">Loading...</span>
					)}
				</div>
			</div>
		</div>
	)
}
