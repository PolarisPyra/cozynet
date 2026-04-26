import { useEffect, useMemo, useState } from "react"

import { Heart, LayoutGrid, List } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import FavoriteCard from "@/app/features/chunithm/components/favorite-card"
import { useAddFavorite, useChunithmSongs, useChunithmVersion, useFavorites, useRemoveFavorite } from "@/app/features/chunithm/hooks"
import Header from "@/app/shared/components/common/header"
import { Pagination } from "@/app/shared/components/common/pagination"
import Spinner from "@/app/shared/components/common/spinner"
import { Button } from "@/app/shared/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/shared/components/ui/table"
import { STANDARD_PAGE_SIZE } from "@/app/shared/constants/pagination"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import { Body, CardGrid, Container } from "@/app/shared/pages/layout/layout"
import type { DB } from "@/app/shared/types"
import { CDN } from "@/app/shared/utils/constants"

const FAVORITES_DENSITY_KEY = "favorites-density"

export default function ChunithmFavorites() {
	const { songId } = useParams()
	const navigate = useNavigate()
	const version = useChunithmVersion()

	const { data: songs = [], isLoading: isLoadingSongs } = useChunithmSongs()
	const { data: favoriteSongIds = [], isLoading: isLoadingFavorites } = useFavorites()
	const { mutate: addFavorite } = useAddFavorite()
	const { mutate: removeFavorite } = useRemoveFavorite()

	const [searchQuery, setSearchQuery] = useState("")
	const [density, setDensity] = useState<"list" | "grid">(() => {
		try {
			const saved = localStorage.getItem(FAVORITES_DENSITY_KEY)
			if (saved === "grid" || saved === "comfortable") return "grid"
			return "list"
		} catch {
			return "list"
		}
	})

	useEffect(() => {
		localStorage.setItem(FAVORITES_DENSITY_KEY, density)
	}, [density])

	const deepLinkedSongId = useMemo(() => {
		const parsed = Number.parseInt(songId ?? "", 10)
		return Number.isFinite(parsed) ? parsed : null
	}, [songId])

	const searchItems = useMemo(
		() =>
			songs
				.filter((song: DB.ChuniStaticMusic) => song.chartId === 3 && song.songId && song.title)
				.map((song: DB.ChuniStaticMusic) => ({ id: song.songId as number, title: song.title as string })),
		[songs]
	)

	const filtered = useMemo(() => {
		const query = searchQuery.trim().toLowerCase()

		return songs
			.filter((song: DB.ChuniStaticMusic) => song.chartId === 3 && song.songId && song.title && song.jacketPath)
			.filter((song: DB.ChuniStaticMusic) => (deepLinkedSongId == null ? true : song.songId === deepLinkedSongId))
			.filter((song: DB.ChuniStaticMusic) => !query || song.title?.toLowerCase().includes(query))
			.map((song: DB.ChuniStaticMusic) => ({
				...song,
				songId: song.songId!,
				title: song.title!,
				jacketPath: song.jacketPath!
			}))
	}, [songs, searchQuery, deepLinkedSongId])

	const { page, setPage, totalPages, paged } = usePagination(filtered, STANDARD_PAGE_SIZE, [searchQuery, deepLinkedSongId])

	const handleToggle = (targetSongId: number) => {
		const isFavorited = favoriteSongIds.some(favorite => favorite.favId === targetSongId)

		if (isFavorited) {
			removeFavorite(targetSongId, {
				onSuccess: () => toast.success("Removed"),
				onError: () => toast.error("Failed")
			})
			return
		}

		addFavorite(targetSongId, {
			onSuccess: () => toast.success("Added"),
			onError: () => toast.error("Failed")
		})
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
				actions={
					<div className="flex items-center gap-2">
						<Button
							variant={density === "grid" ? "secondary" : "outline"}
							size="sm"
							onClick={() => setDensity("grid")}
							className="h-8 text-xs"
						>
							<LayoutGrid className="h-3.5 w-3.5" />
							Grid
						</Button>

						<Button
							variant={density === "list" ? "secondary" : "outline"}
							size="sm"
							onClick={() => setDensity("list")}
							className="h-8 text-xs"
						>
							<List className="h-3.5 w-3.5" />
							List
						</Button>

						{deepLinkedSongId != null && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => navigate("/chunithm/favorites")}
								className="h-8 text-xs"
							>
								Show All
							</Button>
						)}
					</div>
				}
				searchProps={{
					items: searchItems,
					onSelect: (_, item) => {
						if (!item) return

						navigate(`/chunithm/favorites/${item.id}`)
						setSearchQuery("")
					},
					placeholder: "Search...",
					emptyMessage: "No songs.",
					groupLabel: "Songs",
					recentStorageKey: "recent:chunithm:favorites"
				}}
			/>

			<Body>
				{filtered.length === 0 ? (
					<div className="text-muted-foreground py-20 text-center">No songs found</div>
				) : density === "list" ? (
					<>
						<div className="bg-card overflow-hidden rounded-lg border">
							<Table className="min-w-[800px] w-full">
								<colgroup>
									<col className="w-16" />
									<col className="w-[68%]" />
									<col className="w-[16%]" />
									<col className="w-[12%]" />
								</colgroup>

								<TableHeader className="[&_tr]:bg-muted/35">
									<TableRow>
										<TableHead>Jacket</TableHead>
										<TableHead>Song</TableHead>
										<TableHead>ID</TableHead>
										<TableHead className="text-right">Favorite</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody>
									{paged.map(song => {
										const isFavorited = favoriteSongIds.some(favorite => favorite.favId === song.songId)

										return (
											<TableRow key={song.songId}>
												<TableCell className="h-16">
													<img
														src={`${CDN}/chunithm/jacket/${song.jacketPath}`}
														alt={song.title}
														width={44}
														height={44}
														className="block size-11 shrink-0 rounded-sm object-cover"
													/>
												</TableCell>

												<TableCell className="h-16 max-w-96 truncate text-sm font-semibold leading-none">
													{song.title}
												</TableCell>

												<TableCell className="text-muted-foreground h-16 leading-none">{song.songId}</TableCell>

												<TableCell className="h-16 text-right leading-none">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleToggle(song.songId)}
														className="h-8 px-2"
													>
														<Heart
															fill={isFavorited ? "currentColor" : "none"}
															className={isFavorited ? "h-4 w-4 text-red-500" : "text-muted-foreground h-4 w-4"}
														/>
													</Button>
												</TableCell>
											</TableRow>
										)
									})}
								</TableBody>
							</Table>
						</div>

						{totalPages > 1 && (
							<div className="mt-4">
								<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
							</div>
						)}
					</>
				) : (
					<>
						<CardGrid className="auto-rows-fr lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
							{paged.map(song => (
								<FavoriteCard
									key={song.songId}
									score={song}
									favoriteSongIds={favoriteSongIds}
									onToggleFavorite={handleToggle}
									density={density}
								/>
							))}
						</CardGrid>

						{totalPages > 1 && (
							<div className="mt-4">
								<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
							</div>
						)}
					</>
				)}
			</Body>
		</Container>
	)
}