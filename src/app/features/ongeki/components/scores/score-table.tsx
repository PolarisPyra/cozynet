import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/shared/components/ui/table"
import { CDN } from "@/app/shared/utils/constants"
import { formatLevel } from "@/app/shared/utils/format-level"
import {
	formatOngekiScorePlaylogDate,
	getDifficultyFromOngekiChart,
	getOngekiGrade
} from "@/app/shared/utils/ongeki"
import { OngekiRatingColors } from "@/app/features/ongeki/components/rating-colors"
import type { OngekiPlaylog } from "@/app/shared/types"

interface OngekiScoreTableProps {
	scores: OngekiPlaylog[]
	version: number
}

const PlatinumStars = ({ count }: { count: number }) => {
	const safeCount = Math.max(0, Math.min(5, count || 0))
	const starUrl = (filled: boolean) => `${CDN}/ongeki/badges/${filled ? "filled" : "base"}/pstar.webp`

	return (
		<div className="flex items-center justify-center gap-0.5">
			{Array.from({ length: 5 }, (_, i) => {
				const filled = i < safeCount

				return (
					<img
						key={i}
						aria-hidden
						className="inline-block h-3 w-3 object-contain"
						src={starUrl(filled)}
						alt={filled ? "Filled Star" : "Empty Star"}
					/>
				)
			})}
		</div>
	)
}

const normalizePlayerRating = (rating: number | null | undefined) => {
	if (rating == null) return null

	const numeric = Number(rating)
	if (!Number.isFinite(numeric)) return null

	return numeric > 100 ? numeric / 1000 : numeric
}

export function OngekiScoreTable({ scores, version }: OngekiScoreTableProps) {
	return (
		<div className="bg-card overflow-hidden rounded-lg border">
			<div className="w-full overflow-x-auto">
				<Table className="w-full min-w-[1200px] table-fixed">
					<colgroup>
						<col className="w-[64px]" />
						<col className="w-[30%]" />
						<col className="w-[12%]" />
						<col className="w-[8%]" />
						<col className="w-[12%]" />
						<col className="w-[8%]" />
						<col className="w-[10%]" />
						<col className="w-[8%]" />
						<col className="w-[12%]" />
					</colgroup>

					<TableHeader className="[&_tr]:bg-muted/35">
						<TableRow>
							<TableHead className="px-3">Jacket</TableHead>
							<TableHead className="px-3">Song</TableHead>
							<TableHead className="px-3">Difficulty</TableHead>
							<TableHead className="px-3">Level</TableHead>
							<TableHead className="px-3 text-right">Score</TableHead>
							<TableHead className="px-3 text-center">Grade</TableHead>
							<TableHead className="px-3 text-center">Stars</TableHead>
							<TableHead className="px-3 text-right">Rating</TableHead>
							<TableHead className="px-3 text-right">Date</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{scores.map(score => {
							const dateParts = formatOngekiScorePlaylogDate(score.userPlayDate)
							const playerRating = normalizePlayerRating(score.playerRating)

							return (
								<TableRow key={score.id} className="h-16">
									<TableCell className="px-3 py-2 align-middle">
										<img
											src={`${CDN}/ongeki/jacket/${score.jacketPath}`}
											alt={score.title || "Song jacket"}
											width={44}
											height={44}
											className="block size-11 shrink-0 rounded-sm object-cover"
										/>
									</TableCell>

									<TableCell className="px-3 py-2 align-middle">
										<div className="min-w-0">
											<div className="truncate text-sm font-semibold leading-tight">
												{score.title || "Unknown"}
											</div>
											{score.artist ? (
												<div className="text-muted-foreground mt-1 truncate text-xs leading-tight">
													{score.artist}
												</div>
											) : null}
										</div>
									</TableCell>

									<TableCell className="text-muted-foreground px-3 py-2 align-middle text-sm">
										{getDifficultyFromOngekiChart(score.chartId ?? 0)}
									</TableCell>

									<TableCell className="px-3 py-2 align-middle font-medium tabular-nums">
										{formatLevel(score.level)}
									</TableCell>

									<TableCell className="px-3 py-2 text-right align-middle font-semibold tabular-nums">
										{(score.techScore ?? 0).toLocaleString()}
									</TableCell>

									<TableCell className="px-3 py-2 text-center align-middle font-medium">
										{getOngekiGrade(score.techScore ?? 0)}
									</TableCell>

									<TableCell className="px-3 py-2 text-center align-middle">
										<PlatinumStars count={score.platinumScoreStar ?? 0} />
									</TableCell>

									<TableCell className="px-3 py-2 text-right align-middle font-medium tabular-nums">
										{playerRating == null ? (
											"—"
										) : (
											<OngekiRatingColors
												rating={playerRating}
												version={version}
												decimals={3}
											/>
										)}
									</TableCell>

									<TableCell className="text-muted-foreground px-3 py-2 text-right align-middle text-sm tabular-nums">
										{dateParts.date === "—" ? "—" : `${dateParts.date} ${dateParts.time}`}
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}
