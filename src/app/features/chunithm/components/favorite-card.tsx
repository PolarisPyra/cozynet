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
	density?: "list" | "grid"
}

export const FavoriteCard = function ({ score, onToggleFavorite, favoriteSongIds = [], density = "list" }: FavoriteCardProps) {
	const isFavorited = favoriteSongIds.some(fav => fav.favId === score.songId)
	const isGrid = density === "grid"

	return (
		<div
			className={`bg-card flex items-center justify-between rounded-sm border p-4 transition-colors ${
				isGrid ? "min-h-32" : "min-h-28"
			}`}
		>
			<div className="flex min-w-0 flex-1 items-center gap-4">
				<img
					width={isGrid ? 80 : 72}
					height={isGrid ? 80 : 72}
					src={`${CDN}/chunithm/jacket/${score.jacketPath}`}
					alt={score.title}
					className={`flex-shrink-0 rounded-sm object-cover ${isGrid ? "h-20 w-20" : "h-[4.5rem] w-[4.5rem]"}`}
				/>
				<span className="text-foreground line-clamp-2 text-base leading-tight font-bold">{score.title}</span>
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
