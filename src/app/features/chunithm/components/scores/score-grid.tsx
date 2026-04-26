import ChunithmScoreInfoCard from "@/app/features/chunithm/components/score-info-card"
import { CardGrid } from "@/app/shared/pages/layout/layout"
import { chunithmBadgeColors } from "@/app/shared/utils/chunithm"
import type { ChunithmPlaylog } from "@/app/shared/types"

interface ChunithmScoreGridProps {
	scores: ChunithmPlaylog[]
	version: number | undefined
}

export function ChunithmScoreGrid({ scores, version }: ChunithmScoreGridProps) {
	return (
		<CardGrid className="lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
			{scores.map(score => (
				<ChunithmScoreInfoCard
					key={score.id}
					score={score}
					levelColorBadge={chunithmBadgeColors}
					version={version}
				/>
			))}
		</CardGrid>
	)
}
