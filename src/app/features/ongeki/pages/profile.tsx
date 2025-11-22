import { useMemo } from "react"

import { OngekiRatingColors } from "@/app/features/ongeki/components/rating-colors"
import { useOngekiProfile, useOngekiRatingColor, useOngekiVersion } from "@/app/features/ongeki/hooks"
import Header from "@/app/shared/components/common/header"
import Spinner from "@/app/shared/components/common/spinner"
import { Badge } from "@/app/shared/components/ui/badge"
import { useAuth } from "@/app/shared/hooks/auth/use-auth"
import { Body, Container } from "@/app/shared/pages/layout/layout"
import { formatOngekiProfileDate } from "@/app/shared/utils/ongeki"

interface StatRowProps {
	label: string
	children: React.ReactNode
}

const StatRow = ({ label, children }: StatRowProps) => (
	<div className="border-border flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
		<span className="text-primary text-base font-medium">{label}</span>
		<div className="flex items-center gap-2">{children}</div>
	</div>
)

interface DateBadgesProps {
	dateString: string | null
}

const DateBadges = ({ dateString }: DateBadgesProps) => {
	const { date, time } = formatOngekiProfileDate(dateString)
	return (
		<>
			<Badge variant="secondary" className="h-6 rounded-sm">
				{date}
			</Badge>
			<Badge variant="secondary" className="h-6 rounded-sm">
				{time}
			</Badge>
		</>
	)
}

interface PlayerRatingDisplayProps {
	rating: number
	version: number
	isRefreshOrAbove: boolean
	colorName: string | null
}

const PlayerRatingDisplay = ({ rating, version, isRefreshOrAbove, colorName }: PlayerRatingDisplayProps) => (
	<>
		{rating > 0 && version ? (
			<OngekiRatingColors rating={rating} version={version} decimals={isRefreshOrAbove ? 3 : 2} />
		) : (
			<span className="text-foreground text-base font-semibold">-</span>
		)}
		{colorName && (
			<Badge variant="secondary" className="h-6 rounded-sm">
				{colorName}
			</Badge>
		)}
	</>
)

const LoadingState = () => (
	<Container>
		<Header title="Profile Overview" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<Spinner size={24} />
		</div>
	</Container>
)

const NoDataState = () => (
	<Container>
		<Header title="Profile Overview" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<p className="text-primary">No profile data available</p>
		</div>
	</Container>
)

const OngekiProfile = () => {
	const { user } = useAuth()
	const version = useOngekiVersion()
	const { data: profile, isLoading } = useOngekiProfile()

	const isRefreshOrAbove = version >= 8

	const playerRating = useMemo(() => {
		if (!profile) return 0
		if (isRefreshOrAbove) {
			return profile.newPlayerRating ? profile.newPlayerRating / 1000 : 0
		}
		return profile.playerRating ? profile.playerRating / 100 : 0
	}, [profile, isRefreshOrAbove])

	const ratingColor = useOngekiRatingColor(playerRating)

	if (isLoading) return <LoadingState />
	if (!profile) return <NoDataState />

	const displayName = profile.userName || user?.username || "Player"

	return (
		<Container>
			<Header title={`${displayName}'s ONGEKI Profile`} />
			<Body>
				<div className="w-full">
					<div className="bg-card border-border rounded-md border p-4 shadow-sm">
						<h2 className="text-foreground mb-4 text-xl font-bold">Player Stats</h2>
						<div className="space-y-3">
							<StatRow label="Player Rating">
								<PlayerRatingDisplay
									rating={playerRating}
									version={version}
									isRefreshOrAbove={isRefreshOrAbove}
									colorName={ratingColor?.colorName ?? null}
								/>
							</StatRow>
							<StatRow label="First Play">
								<DateBadges dateString={profile.firstPlayDate} />
							</StatRow>
							<StatRow label="Last Played">
								<DateBadges dateString={profile.lastPlayDate} />
							</StatRow>
						</div>
					</div>
				</div>
			</Body>
		</Container>
	)
}

export default OngekiProfile
