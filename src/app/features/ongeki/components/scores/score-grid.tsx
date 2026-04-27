import { OngekiScoreInfoCard } from "@/app/features/ongeki/components/score-info-card"
import { CardGrid } from "@/app/shared/pages/layout/layout"
import { ongekiBadgeColors } from "@/app/shared/utils/ongeki"
import type { OngekiPlaylog } from "@/app/shared/types"

interface OngekiScoreGridProps {
	scores: OngekiPlaylog[]
	version: number
}

export function OngekiScoreGrid({ scores, version }: OngekiScoreGridProps) {
	return (
		<CardGrid className="lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
			{scores.map(score => (
				<OngekiScoreInfoCard
					key={score.id}
					score={score}
					levelColorBadge={ongekiBadgeColors}
					ongekiVersion={version}
				/>
			))}
		</CardGrid>
	)
}
