import { formatDistanceToNow, parseISO } from "date-fns"

import { OngekiRatingColors } from "@/components/ongeki/rating-colors"
import Header from "@/components/common/header"
import Spinner from "@/components/common/spinner"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/auth"
import { useOngekiRatingColor, useOngekiVersion, usePossession } from "@/hooks/ongeki"
import { Body, Container } from "@/pages/layout/layout"

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

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "Never"
		try {
			const date = parseISO(dateString)
			return formatDistanceToNow(date, { addSuffix: true })
		} catch {
			return "Unknown"
		}
	}

	return (
		<Container>
			<Header title={`${possessionData.userName || user?.username || "Player"}'s ONGEKI Profile`} />
			<Body>
				<div className="w-full">
					<div className="bg-card border-border rounded-md border p-4 shadow-sm">
						<h2 className="text-foreground mb-4 text-xl font-bold">Player Stats</h2>
						<div className="space-y-3">
							<div className="border-border flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
								<span className="text-muted-foreground text-base font-medium">Color</span>
								{ratingColor ? (
									<Badge variant="secondary">{ratingColor.colorName}</Badge>
								) : (
									<span className="text-foreground text-base font-semibold">-</span>
								)}
							</div>
							<div className="border-border flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
								<span className="text-muted-foreground text-base font-medium">Player Rating</span>
								{playerRating > 0 && version ? (
									<OngekiRatingColors rating={playerRating} version={version} decimals={isRefreshOrAbove ? 3 : 2} />
								) : (
									<span className="text-foreground text-base font-semibold">-</span>
								)}
							</div>
							<div className="border-border flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
								<span className="text-muted-foreground text-base font-medium">Last Played</span>
								<span className="text-foreground text-base font-semibold">
									{formatDate(possessionData.lastPlayDate)}
								</span>
							</div>
							<div className="border-border flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
								<span className="text-muted-foreground text-base font-medium">First Play</span>
								<span className="text-foreground text-base font-semibold">
									{formatDate(possessionData.firstPlayDate)}
								</span>
							</div>
						</div>
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

