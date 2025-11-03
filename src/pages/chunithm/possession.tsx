import { formatDistanceToNow, parseISO } from "date-fns"

import { ChunithmRatingColors } from "@/components/chunithm/rating-colors"
import Header from "@/components/common/header"
import Spinner from "@/components/common/spinner"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/auth"
import { useChunithmRatingColor, useChunithmVersion, usePossession } from "@/hooks/chunithm"
import { Body, Container } from "@/pages/layout/layout"
import { getChunithmLogo } from "@/utils/version-logos"

const ChunithmPossession = () => {
	const { user } = useAuth()
	const version = useChunithmVersion()
	const { data: possessionData, isLoading } = usePossession()

	const playerRating = possessionData?.playerRating ? possessionData.playerRating / 100 : 0
	const ratingColor = useChunithmRatingColor(playerRating)

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

	const danToRoman = (dan: number | null) => {
		if (dan === null || dan === 0) return null
		const romans = ["", "I", "II", "III", "IV", "V", "INFINITE"]
		return dan < romans.length ? romans[dan] : dan.toString()
	}

	return (
		<Container>
			<Header title={`${possessionData.userName || user?.username || "Player"}'s CHUNITHM Profile`} />
			<Body>
				<div className="w-full">
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
								<span className="text-muted-foreground text-base font-medium">Player Rating</span>
								<div className="flex items-center gap-2">
									{playerRating > 0 && version ? (
										<ChunithmRatingColors rating={playerRating} version={version} />
									) : (
										<span className="text-foreground text-base font-semibold">-</span>
									)}
									{ratingColor && <Badge variant="secondary">{ratingColor.colorName}</Badge>}
								</div>
							</div>
							<div className="border-border flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
								<span className="text-muted-foreground text-base font-medium">First Play</span>
								<span className="text-foreground text-base font-semibold">
									{formatDate(possessionData.firstPlayDate)}
								</span>
							</div>
							<div className="border-border flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
								<span className="text-muted-foreground text-base font-medium">Last Played</span>
								<span className="text-foreground text-base font-semibold">
									{formatDate(possessionData.lastPlayDate)}
								</span>
							</div>
							<div className="border-border flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
								<span className="text-muted-foreground text-base font-medium">Dan</span>
								<span className="text-foreground text-base font-semibold">
									{danToRoman(possessionData.classEmblemMedal) || "None"}
								</span>
							</div>
							<div className="border-border flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
								<span className="text-muted-foreground text-base font-medium">Emblem</span>
								<span className="text-foreground text-base font-semibold">
									{danToRoman(possessionData.classEmblemBase) || "None"}
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

export default ChunithmPossession
