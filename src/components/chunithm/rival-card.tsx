import { RivalInfoCard } from "@/components/common/rival-info-card"

export const RivalCard = function({ score, rivalIds, rivalCount, onAddRival, onRemoveRival }: RivalCardProps) {
	const isRival = rivalIds.includes(score.id)

	return (
		<RivalInfoCard
			user={score}
			isRival={isRival}
			onAddRival={onAddRival}
			onRemoveRival={onRemoveRival}
			rivalCount={rivalCount}
		/>
	)
}

export default RivalCard

interface RivalCardProps {
	score: any
	rivalIds: number[]
	rivalCount: number
	onAddRival: (id: number) => void
	onRemoveRival: (id: number) => void
}
