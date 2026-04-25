import { RivalInfoCard } from "@/app/shared/components/common/rival-info-card"

type RivalCardUser = {
	id: number
	username: string
	isMutual: boolean
}

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
	score: RivalCardUser
	rivalIds: number[]
	rivalCount: number
	onAddRival: (id: number) => void
	onRemoveRival: (id: number) => void
}
