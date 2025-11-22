import { ChunithmRatingColors } from "@/app/features/chunithm/components/rating-colors"
import { useChunithmProfile, useChunithmRatingColor, useChunithmVersion } from "@/app/features/chunithm/hooks"
import Header from "@/app/shared/components/common/header"
import Spinner from "@/app/shared/components/common/spinner"
import { Badge } from "@/app/shared/components/ui/badge"
import { useAuth } from "@/app/shared/hooks/auth/use-auth"
import { Body, Container } from "@/app/shared/pages/layout/layout"
import { formatSqlDateToLocalParts } from "@/app/shared/utils/chunithm"
import { getChunithmLogo } from "@/app/shared/utils/version-logos"

// Shared components - consider moving to a shared location
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
	dateString: string | null | undefined
}

const DateBadges = ({ dateString }: DateBadgesProps) => {
	const { date, time } = formatSqlDateToLocalParts(dateString ?? undefined)
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

// Chunithm-specific components
const DAN_NUMERALS = ["", "I", "II", "III", "IV", "V", "INFINITE"] as const

const danToRoman = (dan: number | null): string | null => {
	if (dan === null || dan === 0) return null
	return dan < DAN_NUMERALS.length ? DAN_NUMERALS[dan] : dan.toString()
}

interface PlayerRatingDisplayProps {
	rating: number
	version: number
	colorName: string | null
}

const PlayerRatingDisplay = ({ rating, version, colorName }: PlayerRatingDisplayProps) => (
	<>
		{rating > 0 && version ? (
			<ChunithmRatingColors rating={rating} version={version} />
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

interface VersionLogoBadgeProps {
	version: number | null
}

const VersionLogoBadge = ({ version }: VersionLogoBadgeProps) => {
	if (!version) return null
	const logo = getChunithmLogo.getLogo(version)
	if (!logo) return null

	return (
		<Badge variant="secondary" className="h-6 rounded-sm p-1">
			<img src={logo} alt="Version Logo" className="max-h-5 w-auto object-contain" />
		</Badge>
	)
}

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

const ChunithmProfile = () => {
	const { user } = useAuth()
	const version = useChunithmVersion()
	const { data: profile, isLoading } = useChunithmProfile()

	const playerRating = profile?.playerRating ? profile.playerRating / 100 : 0
	const ratingColor = useChunithmRatingColor(playerRating)

	if (isLoading) return <LoadingState />
	if (!profile) return <NoDataState />

	const displayName = profile.userName || user?.username || "Player"

	return (
		<Container>
			<Header title={`${displayName}'s CHUNITHM Profile`} />
			<Body>
				<div className="mx-auto w-full max-w-6xl">
					<div className="bg-card border-border rounded-md border p-4 shadow-sm">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-foreground text-xl font-bold">Player Stats</h2>
							<VersionLogoBadge version={version} />
						</div>
						<div className="space-y-3">
							<StatRow label="Player Rating">
								<PlayerRatingDisplay
									rating={playerRating}
									version={version}
									colorName={ratingColor?.colorName ?? null}
								/>
							</StatRow>
							<StatRow label="First Play">
								<DateBadges dateString={profile.firstPlayDate} />
							</StatRow>
							<StatRow label="Last Played">
								<DateBadges dateString={profile.lastPlayDate} />
							</StatRow>
							<StatRow label="Dan">
								<Badge variant="secondary" className="h-6 rounded-sm">
									{danToRoman(profile.classEmblemMedal) ?? "None"}
								</Badge>
							</StatRow>
							<StatRow label="Emblem">
								<Badge variant="secondary" className="h-6 rounded-sm">
									{danToRoman(profile.classEmblemBase) ?? "None"}
								</Badge>
							</StatRow>
						</div>
					</div>
				</div>
			</Body>
		</Container>
	)
}

export default ChunithmProfile
