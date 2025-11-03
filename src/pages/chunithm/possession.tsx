import ChunithmPossessionChart from "@/components/chunithm/possession-chart"
import { ChunithmRatingColors } from "@/components/chunithm/rating-colors"
import Header from "@/components/common/header"
import Spinner from "@/components/common/spinner"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/auth"
import { useChunithmRatingColor, useChunithmVersion, usePossession } from "@/hooks/chunithm"
import { Body, Container } from "@/pages/layout/layout"
import { formatSqlDateToLocalParts } from "@/utils/chunithm"
import { getChunithmLogo } from "@/utils/version-logos"

const ChunithmPossession = () => {
	const { user } = useAuth()
	const version = useChunithmVersion()
	const { data: possessionData, isLoading } = usePossession()

	const profile = possessionData?.profile
	const playerRating = profile?.playerRating ? profile.playerRating / 100 : 0
	const ratingColor = useChunithmRatingColor(playerRating)

	if (isLoading) return <LoadingState />
	if (!profile) return <NoDataState />

	const formatDateParts = (dateString: string | null) => formatSqlDateToLocalParts(dateString ?? undefined)

	const danToRoman = (dan: number | null) => {
		if (dan === null || dan === 0) return null
		const romans = ["", "I", "II", "III", "IV", "V", "INFINITE"]
		return dan < romans.length ? romans[dan] : dan.toString()
	}

	return (
		<Container>
			<Header title={`${profile.userName || user?.username || "Player"}'s CHUNITHM Profile`} />
			<Body>
				<div className="mx-auto w-full max-w-6xl">
					<div className="bg-card border-border rounded-md border p-4 shadow-sm">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-foreground text-xl font-bold">Player Stats</h2>
							{version && getChunithmLogo.getLogo(version) && (
								<Badge variant="secondary" className="h-6 rounded-sm p-1">
									<img
										src={getChunithmLogo.getLogo(version)!}
										alt="Version Logo"
										className="max-h-5 w-auto object-contain"
									/>
								</Badge>
							)}
						</div>
						<div className="space-y-3">
							<div className="border-border flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
								<span className="text-primary text-base font-medium">Player Rating</span>
								<div className="flex items-center gap-2">
									{playerRating > 0 && version ? (
										<ChunithmRatingColors rating={playerRating} version={version} />
									) : (
										<span className="text-foreground text-base font-semibold">-</span>
									)}
									{ratingColor && (
										<Badge variant="secondary" className="h-6 rounded-sm">
											{ratingColor.colorName}
										</Badge>
									)}
								</div>
							</div>
							<div className="border-border flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
								<span className="text-primary text-base font-medium">First Play</span>
								<div className="flex items-center gap-2">
									{(() => {
										const fp = formatDateParts(profile.firstPlayDate)
										return (
											<>
												<Badge variant="secondary" className="h-6 rounded-sm">
													{fp.date}
												</Badge>
												<Badge variant="secondary" className="h-6 rounded-sm">
													{fp.time}
												</Badge>
											</>
										)
									})()}
								</div>
							</div>
							<div className="border-border flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
								<span className="text-primary text-base font-medium">Last Played</span>
								<div className="flex items-center gap-2">
									{(() => {
										const lp = formatDateParts(profile.lastPlayDate)
										return (
											<>
												<Badge variant="secondary" className="h-6 rounded-sm">
													{lp.date}
												</Badge>
												<Badge variant="secondary" className="h-6 rounded-sm">
													{lp.time}
												</Badge>
											</>
										)
									})()}
								</div>
							</div>
							<div className="border-border flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
								<span className="text-primary text-base font-medium">Dan</span>
								<Badge variant="secondary" className="h-6 rounded-sm">
									{danToRoman(profile.classEmblemMedal) || "None"}
								</Badge>
							</div>
							<div className="border-border flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
								<span className="text-primary text-base font-medium">Emblem</span>
								<Badge variant="secondary" className="h-6 rounded-sm">
									{danToRoman(profile.classEmblemBase) || "None"}
								</Badge>
							</div>
						</div>
					</div>
					<div className="mt-6">
						<ChunithmPossessionChart />
					</div>
				</div>
			</Body>
		</Container>
	)
}

const LoadingState = () => (
	<div className="relative flex-1 overflow-auto">
		<Header title="Possession Overview" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<Spinner size={24} />
		</div>
	</div>
)

const NoDataState = () => (
	<div className="relative flex-1 overflow-auto">
		<Header title="Possession Overview" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<p className="text-primary">No possession data available</p>
		</div>
	</div>
)

export default ChunithmPossession
