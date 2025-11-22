import { useMemo } from "react"

import { User } from "lucide-react"

import Header from "@/app/shared/components/common/header"
import Spinner from "@/app/shared/components/common/spinner"
import { Badge } from "@/app/shared/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/shared/components/ui/card"
import { useAuth } from "@/app/shared/hooks/auth/use-auth"
import { useProfileVersions } from "@/app/shared/hooks/users"
import { ChunithmVersions, MaimaiDxVersions, OngekiVersions } from "@/app/shared/utils/enums"

const getGameName = (key: string): string => {
	const gameNameMap: Record<string, string> = {
		chunithm_version: "Chunithm",
		ongeki_version: "Ongeki",
		maimaidx_version: "Maimai DX"
	}
	return (
		gameNameMap[key] ||
		key
			.replace(/_version$/, "")
			.replace(/([A-Z])/g, " $1")
			.trim()
	)
}

const getVersionName = (key: string, version: number): string => {
	switch (key) {
		case "chunithm_version":
			return ChunithmVersions[version] || `Version ${version}`
		case "ongeki_version":
			return OngekiVersions[version] || `Version ${version}`
		case "maimaidx_version":
			return MaimaiDxVersions[version] || `Version ${version}`
		default:
			return `Version ${version}`
	}
}

type GameProfileItem = {
	game: "chunithm" | "chunithmnew" | "ongeki" | "maimai" | "maimaidx"
	gameName: string
	profiles: Array<{ version: number; userName: string | null }>
}

const getVersionNameByGame = (
	game: "chunithm" | "chunithmnew" | "ongeki" | "maimai" | "maimaidx",
	version: number
): string => {
	switch (game) {
		case "chunithm":
		case "chunithmnew":
			return ChunithmVersions[version] || `Version ${version}`
		case "ongeki":
			return OngekiVersions[version] || `Version ${version}`
		case "maimai":
		case "maimaidx":
			return MaimaiDxVersions[version] || `Version ${version}`
	}
}

type GameProfileRowProps = {
	game: "chunithm" | "chunithmnew" | "ongeki" | "maimai" | "maimaidx"
	version: number
	userName: string | null
}

const GameProfileRow = ({ game, version, userName }: GameProfileRowProps) => (
	<div className="border-border flex items-center justify-between rounded-md border p-3">
		<div className="space-y-1">
			<div className="text-foreground text-sm font-medium">{getVersionNameByGame(game, version)}</div>
			{userName && <div className="text-muted-foreground text-xs">{userName}</div>}
		</div>
	</div>
)

type GameSectionProps = {
	gameName: string
	game: "chunithm" | "chunithmnew" | "ongeki" | "maimai" | "maimaidx"
	profiles: Array<{ version: number; userName: string | null }>
}

const GameSection = ({ gameName, game, profiles }: GameSectionProps) => (
	<div className="space-y-2">
		<h3 className="text-foreground text-sm font-semibold">{gameName}</h3>
		<div className="space-y-2">
			{profiles.map(profile => (
				<GameProfileRow
					key={`${game}-${profile.version}`}
					game={game}
					version={profile.version}
					userName={profile.userName}
				/>
			))}
		</div>
	</div>
)

const ProfileGamesCard = () => {
	const { data, isLoading } = useProfileVersions()

	const gameSections = useMemo<GameProfileItem[]>(() => {
		if (!data) return []

		// Separate chunithm versions: 0-10 are original Chunithm, 11+ are Chunithm New
		const chunithmProfiles = data.chunithm.filter(profile => profile.version <= 10)
		const chunithmNewProfiles = data.chunithm.filter(profile => profile.version > 10)

		// Separate maimai versions: 0-12 are original maimai, 13+ are maimai DX
		const maimaiProfiles = data.maimaidx.filter(profile => profile.version < 13)
		const maimaiDxProfiles = data.maimaidx.filter(profile => profile.version >= 13)

		return [
			{ game: "chunithm" as const, gameName: "Chunithm", profiles: chunithmProfiles },
			{ game: "chunithmnew" as const, gameName: "Chunithm New", profiles: chunithmNewProfiles },
			{ game: "ongeki" as const, gameName: "Ongeki", profiles: data.ongeki },
			{ game: "maimai" as const, gameName: "maimai", profiles: maimaiProfiles },
			{ game: "maimaidx" as const, gameName: "maimai DX", profiles: maimaiDxProfiles }
		].filter(section => section.profiles.length > 0)
	}, [data])

	const hasAnyGames = useMemo(() => gameSections.length > 0, [gameSections])

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Your Games</CardTitle>
					<CardDescription>All game profiles you have created</CardDescription>
				</CardHeader>
				<CardContent>
					<Spinner />
				</CardContent>
			</Card>
		)
	}

	if (!data || !hasAnyGames) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Your Games</CardTitle>
					<CardDescription>All game profiles you have created</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">No game profiles found.</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Your Games</CardTitle>
				<CardDescription>All game profiles you have created</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{gameSections.map(section => (
					<GameSection key={section.game} gameName={section.gameName} game={section.game} profiles={section.profiles} />
				))}
			</CardContent>
		</Card>
	)
}

const Profile = () => {
	const { user } = useAuth()

	if (!user) return null

	return (
		<div className="relative flex-1 overflow-auto">
			<Header title="Profile" />
			<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<User className="h-5 w-5" />
							<CardTitle>Personal Information</CardTitle>
						</div>
						<CardDescription>Your account details and information</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-1">
								<label className="text-muted-foreground text-sm font-medium">Username</label>
								<div className="text-foreground text-base">{user.username}</div>
							</div>
							{user.aimeCardId && (
								<div className="space-y-1">
									<label className="text-muted-foreground text-sm font-medium">Aime Card ID</label>
									<div className="text-foreground font-mono text-base">{user.aimeCardId}</div>
								</div>
							)}
							<div className="space-y-1">
								<label className="text-muted-foreground text-sm font-medium">Permissions</label>
								<div className="text-foreground flex items-center text-base">
									<Badge variant="secondary">
										{user.permissions === 1 ? "user" : user.permissions === 2 ? "admin" : user.permissions}
									</Badge>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Game Versions</CardTitle>
						<CardDescription>Your configured game version preferences</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 sm:grid-cols-2">
							{Object.entries(user.versions).map(([game, version]) => (
								<div key={game} className="space-y-1">
									<label className="text-muted-foreground text-sm font-medium">{getGameName(game)}</label>
									<div className="text-foreground text-base">{getVersionName(game, version)}</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<ProfileGamesCard />
			</div>
		</div>
	)
}

export default Profile
