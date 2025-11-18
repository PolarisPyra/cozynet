interface RankBadgeProps {
	rank: number
}

export function RankBadge({ rank }: RankBadgeProps) {
	const getRankBgColor = () => {
		if (rank === 1) return "bg-yellow-500"
		if (rank === 2) return "bg-slate-400"
		if (rank === 3) return "bg-teal-500"
		return "bg-muted"
	}

	return (
		<div
			className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm text-sm font-bold text-white ${getRankBgColor()}`}
		>
			{rank}
		</div>
	)
}
