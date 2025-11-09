import { useMemo, useState } from "react"

import { toast } from "sonner"

import FavoriteCard from "@/components/chunithm/favorite-card"
import Header from "@/components/common/header"
import ResponsiveGrid from "@/components/common/responsive-grid"
import Spinner from "@/components/common/spinner"
import { useAddFavorite, useChunithmSongs, useChunithmVersion, useFavorites, useRemoveFavorite } from "@/hooks/chunithm"
import { Body, Container } from "@/pages/layout/layout"
import type { DB } from "@/shared/types"

const ChunithmFavorites = () => {
	const version = useChunithmVersion()
	const { data: songs = [], isLoading: isLoadingSongs } = useChunithmSongs()
	const { data: favoriteSongIds = [], isLoading: isLoadingFavorites } = useFavorites()
	const { mutate: addFavorite } = useAddFavorite()
	const { mutate: removeFavorite } = useRemoveFavorite()
	const [searchQuery, setSearchQuery] = useState("")

	const filteredSongs = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase()

		return songs
			.filter((song: DB.ChuniStaticMusic) => song.chartId === 3) // Only MASTER difficulty
			.filter((song: DB.ChuniStaticMusic) => song.songId !== null && song.title !== null && song.jacketPath !== null)
			.filter((song: DB.ChuniStaticMusic) => {
				if (!normalizedQuery) return true
				return song.title?.toLowerCase().includes(normalizedQuery)
			})
			.map((song: DB.ChuniStaticMusic) => ({
				...song,
				songId: song.songId!,
				title: song.title!,
				jacketPath: song.jacketPath!
			}))
	}, [songs, searchQuery])

	const searchItems = filteredSongs.map((song) => ({
		id: song.songId,
		title: song.title
	}))

	const handleToggleFavorite = (songId: number) => {
		const isFavorited = favoriteSongIds.some(fav => fav.favId === songId)

		if (isFavorited) {
			removeFavorite(songId, {
				onSuccess: () => toast.success("Removed from favorites"),
				onError: () => toast.error("Failed to remove from favorites")
			})
		} else {
			addFavorite(songId, {
				onSuccess: () => toast.success("Added to favorites"),
				onError: () => toast.error("Failed to add to favorites")
			})
		}
	}

	const isLoading = isLoadingSongs || isLoadingFavorites

	if (isLoading) return <LoadingState />
	if (!version) return <NoVersionState />

	return (
		<Container>
			<Header
				title="Favorites"
				searchProps={{
					items: searchItems,
					searchQuery,
					onSearchChange: setSearchQuery,
					placeholder: "Search songs...",
					emptyMessage: "No songs found.",
					groupLabel: "Songs"
				}}
			/>
			<Body>
				<ResponsiveGrid
					items={filteredSongs}
					CardComponent={props => (
						<FavoriteCard {...props} favoriteSongIds={favoriteSongIds} onToggleFavorite={handleToggleFavorite} />
					)}
				/>
			</Body>
		</Container>
	)
}

const LoadingState = () => (
	<div className="relative flex-1 overflow-auto">
		<Header title="Favorites" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<Spinner size={24} />
		</div>
	</div>
)

const NoVersionState = () => (
	<div className="relative flex-1 overflow-auto">
		<Header title="Favorites" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<p className="text-primary">Please set your Chunithm version in settings first</p>
		</div>
	</div>
)

export default ChunithmFavorites
