import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/shared/components/ui/table"
import {
	calculateChunithmRating,
	formatSqlDateToLocalParts,
	getChunithmGrade,
	getDifficultyFromChunithmChart
} from "@/app/shared/utils/chunithm"
import { CDN } from "@/app/shared/utils/constants"
import { formatLevel } from "@/app/shared/utils/format-level"
import { convertChunithmScoreRating } from "@/app/shared/utils/profile-rating-utils"
import { ChunithmRatingColors } from "@/app/features/chunithm/components/rating-colors"
import type { ChunithmPlaylog } from "@/app/shared/types"

interface ChunithmScoreTableProps {
	scores: ChunithmPlaylog[]
	version: number | undefined
}

export function ChunithmScoreTable({ scores, version }: ChunithmScoreTableProps) {
	return (
		<div className="bg-card overflow-hidden rounded-lg border">
			<div className="w-full overflow-x-auto">
				<Table className="w-full min-w-[1200px] table-fixed">
					<colgroup>
						<col className="w-[64px]" />
						<col className="w-[25%]" />
						<col className="w-[10%]" />
						<col className="w-[7%]" />
						<col className="w-[12%]" />
						<col className="w-[7%]" />
						<col className="w-[12%]" />
						<col className="w-[12%]" />
						<col className="w-[15%]" />
					</colgroup>

					<TableHeader className="[&_tr]:bg-muted/35">
						<TableRow>
							<TableHead className="px-3">Jacket</TableHead>
							<TableHead className="px-3">Song</TableHead>
							<TableHead className="px-3">Difficulty</TableHead>
							<TableHead className="px-3">Level</TableHead>
							<TableHead className="px-3 text-right">Score</TableHead>
							<TableHead className="px-3">Grade</TableHead>
							<TableHead className="px-3 text-right">Performance Rating</TableHead>
							<TableHead className="px-3 text-right">Player Rating</TableHead>
							<TableHead className="px-3">Date</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{scores.map(score => {
							const dateParts = formatSqlDateToLocalParts(score.userPlayDate)
							const playerRating = convertChunithmScoreRating(score.playerRating)

							return (
								<TableRow key={score.id}>
									<TableCell className="h-16 px-3 py-2 align-middle">
										<img
											src={`${CDN}/chunithm/jacket/${score.jacketPath}`}
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

									<TableCell className="text-muted-foreground h-16 px-3 py-2 align-middle leading-none">
										{getDifficultyFromChunithmChart(score.chartId ?? 0)}
									</TableCell>

									<TableCell className="h-16 px-3 py-2 align-middle font-medium leading-none">
										{formatLevel(score.level)}
									</TableCell>

									<TableCell className="h-16 px-3 py-2 text-right align-middle font-semibold leading-none">
										{(score.score ?? 0).toLocaleString()}
									</TableCell>

									<TableCell className="h-16 px-3 py-2 align-middle font-medium leading-none">
										{getChunithmGrade(score.score ?? 0)}
									</TableCell>

									<TableCell className="h-16 px-3 py-2 text-right align-middle font-medium leading-none">
										{score.score == null || score.level == null ? (
											"—"
										) : (
											<ChunithmRatingColors
												rating={calculateChunithmRating(score.level, score.score) / 100}
												version={version || 20}
											/>
										)}
									</TableCell>

									<TableCell className="h-16 px-3 py-2 text-right align-middle font-medium leading-none">
										{playerRating > 0 ? (
											<ChunithmRatingColors rating={playerRating} version={version || 20} />
										) : (
											"—"
										)}
									</TableCell>

									<TableCell className="text-muted-foreground h-16 px-3 py-2 align-middle leading-none">
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
