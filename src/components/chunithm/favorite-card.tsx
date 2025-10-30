import { Heart } from "lucide-react";

import { CDN } from "@/lib/constants";

interface ChunithmFavorite {
	songId?: number | null;
	title?: string | null;
	chartId?: number | null;
	isFavorited?: boolean;
	jacketPath?: string | null;
	id?: number;
	user?: number;
	version?: number;
	favId?: number;
	favKind?: number;
	option?: string;
}

interface FavoriteCardProps {
	score: ChunithmFavorite;
	favoriteSongIds: ChunithmFavorite[];
	onToggleFavorite: (songId: number) => void;
}

const FavoriteCard = ({ score, favoriteSongIds, onToggleFavorite }: FavoriteCardProps) => {
	const isFavorited = favoriteSongIds.some((favorite: ChunithmFavorite) => favorite.favId === score.songId);

	return (
		<div className="bg-card flex items-center justify-between rounded-sm border p-4 transition-colors">
			<div className="flex min-w-0 flex-1 items-center gap-3">
				<img
					width={48}
					height={48}
					src={`${CDN}/chunithm/jacket/${score.jacketPath}`}
					alt={score.title || ""}
					className="h-12 w-12 flex-shrink-0 rounded-sm"
				/>
				<span className="text-foreground truncate text-base leading-tight font-bold">{score.title}</span>
			</div>
			<Heart
				fill={isFavorited ? "currentColor" : "none"}
				className={`h-6 w-6 flex-shrink-0 cursor-pointer transition-colors ${isFavorited ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"}`}
				onClick={() => score.songId && onToggleFavorite(score.songId)}
			/>
		</div>
	);
};

export default FavoriteCard;
