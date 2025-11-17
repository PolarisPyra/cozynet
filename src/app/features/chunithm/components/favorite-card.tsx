import { Heart } from "lucide-react"

import { CDN } from "@/app/shared/utils/constants"
import type { DB } from "@/app/shared/types"

type FavoriteSong = DB.ChuniStaticMusic & {
	songId: number
	title: string
	jacketPath: string
}

export interface FavoriteCardProps {
	score: FavoriteSong
	isFavorited?: boolean
	onToggleFavorite: (songId: number) => void
	favoriteSongIds?: Array<{ favId: number }>
	levelColorBadge?: (chartId?: number) => string
	jacketArt?: string
	chunithmVersion?: number
	isPotential?: boolean
	isRecommend?: boolean
	ongekiVersion?: number
}

export const FavoriteCard = function ({ score, onToggleFavorite, favoriteSongIds = [] }: FavoriteCardProps) {
	const isFavorited = favoriteSongIds.some(fav => fav.favId === score.songId)

	return (
		<div className="bg-card flex items-center justify-between rounded-sm border p-4 transition-colors">
			<div className="flex min-w-0 flex-1 items-center gap-3">
				<img
					width={48}
					height={48}
					src={`${CDN}/chunithm/jacket/${score.jacketPath}`}
					alt={score.title}
					className="h-12 w-12 flex-shrink-0 rounded-sm"
				/>
				<span className="text-foreground truncate text-base leading-tight font-bold">{score.title}</span>
			</div>
			<Heart
				fill={isFavorited ? "currentColor" : "none"}
				className={`h-6 w-6 flex-shrink-0 cursor-pointer transition-colors ${isFavorited ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"}`}
				onClick={() => onToggleFavorite(score.songId)}
			/>
		</div>
	)
}

export default FavoriteCard
