import { Card, CardContent } from "@/app/shared/components/ui/card"

interface MaimaiRatingDisplayProps {
	b35rating: number
	b15rating: number
	playerRating: number
}

export function MaimaiRatingDisplay({ b35rating, b15rating, playerRating }: MaimaiRatingDisplayProps) {
	return (
		<Card className="rounded-sm">
			<CardContent className="px-4 py-2">
				<div className="flex items-center justify-between">
					<span className="text-primary text-base font-medium">Rating:</span>
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground text-xs font-medium tabular-nums">
							{b35rating}+{b15rating}=
						</span>
						<span className="text-foreground text-lg font-bold tabular-nums">{playerRating}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
