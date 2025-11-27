import { useMemo, useState } from "react"

import { toast } from "sonner"

import FavoriteCard from "@/app/features/chunithm/components/favorite-card"
import { useAddFavorite, useChunithmSongs, useChunithmVersion, useFavorites, useRemoveFavorite } from "@/app/features/chunithm/hooks"
import Header from "@/app/shared/components/common/header"
import { Pagination } from "@/app/shared/components/common/pagination"
import Spinner from "@/app/shared/components/common/spinner"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import { Body, Container } from "@/app/shared/pages/layout/layout"
import type { DB } from "@/app/shared/types"

export default function ChunithmFavorites() {
	const version = useChunithmVersion()
	const { data: songs = [], isLoading: isLoadingSongs } = useChunithmSongs()
	const { data: favoriteSongIds = [], isLoading: isLoadingFavorites } = useFavorites()
	const { mutate: addFavorite } = useAddFavorite()
	const { mutate: removeFavorite } = useRemoveFavorite()
	const [searchQuery, setSearchQuery] = useState("")

	const filtered = useMemo(() => {
		const q = searchQuery.trim().toLowerCase()
		return songs
			.filter((s: DB.ChuniStaticMusic) => s.chartId === 3 && s.songId && s.title && s.jacketPath)
			.filter((s: DB.ChuniStaticMusic) => !q || s.title?.toLowerCase().includes(q))
			.map((s: DB.ChuniStaticMusic) => ({ ...s, songId: s.songId!, title: s.title!, jacketPath: s.jacketPath! }))
	}, [songs, searchQuery])

	const { page, setPage, totalPages, paged, total, hasMore } = usePagination(filtered, 20, [searchQuery])

	const handleToggle = (songId: number) => {
		const isFav = favoriteSongIds.some(f => f.favId === songId)
		if (isFav) {
			removeFavorite(songId, { onSuccess: () => toast.success("Removed"), onError: () => toast.error("Failed") })
		} else {
			addFavorite(songId, { onSuccess: () => toast.success("Added"), onError: () => toast.error("Failed") })
		}
	}

	const isLoading = isLoadingSongs || isLoadingFavorites

	if (!version) {
		return (
			<Container>
				<Header title="Favorites" />
				<Body>
					<div className="text-muted-foreground py-20 text-center">Set your version first</div>
				</Body>
			</Container>
		)
	}

	if (isLoading) {
		return (
			<Container>
				<Header title="Favorites" />
				<Body>
					<div className="flex h-96 items-center justify-center">
						<Spinner />
					</div>
				</Body>
			</Container>
		)
	}

	return (
		<Container>
			<Header
				title="Favorites"
				searchProps={{
					items: filtered.slice(0, 100).map(s => ({ id: s.songId, title: s.title })),
					searchQuery,
					onSearchChange: setSearchQuery,
					placeholder: "Search...",
					emptyMessage: "No songs.",
					groupLabel: "Songs"
				}}
			/>
			<Body>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{paged.map(song => (
						<FavoriteCard key={song.songId} score={song} favoriteSongIds={favoriteSongIds} onToggleFavorite={handleToggle} />
					))}
				</div>

				{filtered.length === 0 && <div className="text-muted-foreground py-20 text-center">No songs found</div>}

				{hasMore && <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />}
			</Body>
		</Container>
	)
}
