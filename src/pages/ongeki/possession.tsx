import OngekiPossessionChart from "@/components/ongeki/possession-chart"
import Header from "@/components/common/header"
import Spinner from "@/components/common/spinner"
import { OngekiRatingColors } from "@/components/ongeki/rating-colors"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/auth"
import { useOngekiRatingColor, useOngekiVersion, usePossession } from "@/hooks/ongeki"
import { Body, Container } from "@/pages/layout/layout"
import { formatSqlDateToLocalParts } from "@/utils/helpers"

const OngekiPossession = () => {
	const { user } = useAuth()
	const version = useOngekiVersion()
	const { data: possessionData, isLoading } = usePossession()

	const isRefreshOrAbove = version >= 8
	const playerRating = isRefreshOrAbove
		? possessionData?.newPlayerRating
			? possessionData.newPlayerRating / 1000
			: 0
		: possessionData?.playerRating
			? possessionData.playerRating / 100
			: 0

	const ratingColor = useOngekiRatingColor(playerRating)

	if (isLoading) return <LoadingState />
	if (!possessionData) return <NoDataState />

	const formatDateParts = (dateString: string | null) => formatSqlDateToLocalParts(dateString ?? undefined)

	return (
		<Container>
			<Header title={`${possessionData.userName || user?.username || "Player"}'s ONGEKI Profile`} />
			<Body>
				<div className="w-full">
					<div className="bg-card border-border rounded-md border p-4 shadow-sm">
						<h2 className="text-foreground mb-4 text-xl font-bold">Player Stats</h2>
						<div className="space-y-3">
							<div className="border-border flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
								<span className="text-muted-foreground text-base font-medium">Player Rating</span>
								<div className="flex items-center gap-2">
									{playerRating > 0 && version ? (
										<OngekiRatingColors rating={playerRating} version={version} decimals={isRefreshOrAbove ? 3 : 2} />
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
								<span className="text-muted-foreground text-base font-medium">First Play</span>
								<div className="flex items-center gap-2">
									{(() => {
										const fp = formatDateParts(possessionData.firstPlayDate)
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
								<span className="text-muted-foreground text-base font-medium">Last Played</span>
								<div className="flex items-center gap-2">
									{(() => {
										const lp = formatDateParts(possessionData.lastPlayDate)
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
						</div>
					</div>
					<div className="mt-6">
						<OngekiPossessionChart />
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

export default OngekiPossession
