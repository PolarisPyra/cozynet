import { useMemo, useState } from "react"

import { Edit2, Save, User, X } from "lucide-react"
import { toast } from "sonner"

import Header from "@/app/shared/components/common/header"
import Spinner from "@/app/shared/components/common/spinner"
import { Badge } from "@/app/shared/components/ui/badge"
import { Button } from "@/app/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/shared/components/ui/card"
import { Input } from "@/app/shared/components/ui/input"
import { useAuth } from "@/app/shared/hooks/auth/use-auth"
import { useProfileVersions, useUpdateUsername } from "@/app/shared/hooks/users"
import { ChunithmVersions, MaimaiDxVersions, OngekiVersions } from "@/app/shared/utils/enums"

// Types
type GameKey = "chunithm" | "chunithmnew" | "ongeki" | "maimai" | "maimaidx"

interface GameProfile {
	version: number
	userName: string | null
}

interface GameSection {
	game: GameKey
	gameName: string
	profiles: GameProfile[]
}

// Constants
const GAME_NAMES: Record<string, string> = {
	chunithm_version: "Chunithm",
	ongeki_version: "Ongeki",
	maimaidx_version: "Maimai DX"
}

const PERMISSION_LABELS: Record<number, string> = {
	1: "user",
	2: "admin"
}

// Utility functions
const getGameName = (key: string): string =>
	GAME_NAMES[key] ??
	key
		.replace(/_version$/, "")
		.replace(/([A-Z])/g, " $1")
		.trim()

const getVersionName = (key: string, version: number): string => {
	const versionMaps: Record<string, Record<number, string>> = {
		chunithm_version: ChunithmVersions,
		ongeki_version: OngekiVersions,
		maimaidx_version: MaimaiDxVersions
	}
	return versionMaps[key]?.[version] ?? `Version ${version}`
}

const getVersionNameByGame = (game: GameKey, version: number): string => {
	const versionMaps: Record<GameKey, Record<number, string>> = {
		chunithm: ChunithmVersions,
		chunithmnew: ChunithmVersions,
		ongeki: OngekiVersions,
		maimai: MaimaiDxVersions,
		maimaidx: MaimaiDxVersions
	}
	return versionMaps[game]?.[version] ?? `Version ${version}`
}

const getPermissionLabel = (permissions: number): string => PERMISSION_LABELS[permissions] ?? String(permissions)

// Shared components
interface InfoFieldProps {
	label: string
	children: React.ReactNode
	mono?: boolean
}

const InfoField = ({ label, children, mono }: InfoFieldProps) => (
	<div className="space-y-1">
		<label className="text-muted-foreground text-sm font-medium">{label}</label>
		<div className={`text-foreground text-base ${mono ? "font-mono" : ""}`}>{children}</div>
	</div>
)

// Editable username field
interface EditableUsernameFieldProps {
	username: string
}

const EditableUsernameField = ({ username }: EditableUsernameFieldProps) => {
	const [isEditing, setIsEditing] = useState(false)
	const [editValue, setEditValue] = useState(username)
	const { mutate: updateUsername, isPending } = useUpdateUsername()

	const handleSave = () => {
		if (!editValue.trim()) {
			toast.error("Username cannot be empty")
			return
		}
		if (editValue === username) {
			setIsEditing(false)
			return
		}

		updateUsername(
			{ username: editValue.trim() },
			{
				onSuccess: data => {
					setEditValue(data.username)
					setIsEditing(false)
					toast.success("Username updated successfully")
				},
				onError: (error: Error) => {
					toast.error(error.message || "Failed to update username")
				}
			}
		)
	}

	const handleCancel = () => {
		setEditValue(username)
		setIsEditing(false)
	}

	if (isEditing) {
		return (
			<div className="space-y-1">
				<label className="text-muted-foreground text-sm font-medium">Username</label>
				<div className="flex items-center gap-2">
					<Input
						value={editValue}
						onChange={e => setEditValue(e.target.value)}
						onKeyDown={e => {
							if (e.key === "Enter") {
								e.preventDefault()
								handleSave()
							} else if (e.key === "Escape") {
								handleCancel()
							}
						}}
						disabled={isPending}
						className="flex-1"
						maxLength={50}
						autoFocus
					/>
					<div className="flex items-center gap-0.5">
						<Button
							size="icon"
							variant="ghost"
							onClick={handleSave}
							disabled={isPending || !editValue.trim() || editValue === username}
							className="h-9 w-9"
						>
							<Save className="h-4 w-4" />
						</Button>
						<Button size="icon" variant="ghost" onClick={handleCancel} disabled={isPending} className="h-9 w-9">
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-1">
			<label className="text-muted-foreground text-sm font-medium">Username</label>
			<div className="flex items-center gap-1.5">
				<span className="text-foreground text-base">{username}</span>
				<Button
					size="icon"
					variant="ghost"
					onClick={() => setIsEditing(true)}
					className="h-8 w-8 shrink-0"
					aria-label="Edit username"
				>
					<Edit2 className="h-4 w-4" />
				</Button>
			</div>
		</div>
	)
}

// Game profile components
interface GameProfileRowProps {
	game: GameKey
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

interface GameSectionComponentProps {
	section: GameSection
}

const GameSectionComponent = ({ section }: GameSectionComponentProps) => (
	<div className="space-y-2">
		<h3 className="text-foreground text-sm font-semibold">{section.gameName}</h3>
		<div className="space-y-2">
			{section.profiles.map(profile => (
				<GameProfileRow
					key={`${section.game}-${profile.version}`}
					game={section.game}
					version={profile.version}
					userName={profile.userName}
				/>
			))}
		</div>
	</div>
)

// Card wrapper
interface ProfileCardProps {
	title: string
	description: string
	icon?: React.ReactNode
	children: React.ReactNode
}

const ProfileCard = ({ title, description, icon, children }: ProfileCardProps) => (
	<Card>
		<CardHeader>
			<div className="flex items-center gap-2">
				{icon}
				<CardTitle>{title}</CardTitle>
			</div>
			<CardDescription>{description}</CardDescription>
		</CardHeader>
		<CardContent>{children}</CardContent>
	</Card>
)

// Hooks
const useGameSections = (data: ReturnType<typeof useProfileVersions>["data"]): GameSection[] =>
	useMemo(() => {
		if (!data) return []

		const sections: GameSection[] = [
			{
				game: "chunithm",
				gameName: "Chunithm",
				profiles: data.chunithm.filter(p => p.version <= 10)
			},
			{
				game: "chunithmnew",
				gameName: "Chunithm New",
				profiles: data.chunithm.filter(p => p.version > 10)
			},
			{
				game: "ongeki",
				gameName: "Ongeki",
				profiles: data.ongeki
			},
			{
				game: "maimai",
				gameName: "maimai",
				profiles: data.maimaidx.filter(p => p.version < 13)
			},
			{
				game: "maimaidx",
				gameName: "maimai DX",
				profiles: data.maimaidx.filter(p => p.version >= 13)
			}
		]

		return sections.filter(s => s.profiles.length > 0)
	}, [data])

// Sub-components
const ProfileGamesCard = () => {
	const { data, isLoading } = useProfileVersions()
	const gameSections = useGameSections(data)

	if (isLoading) {
		return (
			<ProfileCard title="Your Games" description="All game profiles you have created">
				<Spinner />
			</ProfileCard>
		)
	}

	if (gameSections.length === 0) {
		return (
			<ProfileCard title="Your Games" description="All game profiles you have created">
				<p className="text-muted-foreground text-sm">No game profiles found.</p>
			</ProfileCard>
		)
	}

	return (
		<ProfileCard title="Your Games" description="All game profiles you have created">
			<div className="space-y-6">
				{gameSections.map(section => (
					<GameSectionComponent key={section.game} section={section} />
				))}
			</div>
		</ProfileCard>
	)
}

interface PersonalInfoCardProps {
	user: NonNullable<ReturnType<typeof useAuth>["user"]>
}

const PersonalInfoCard = ({ user }: PersonalInfoCardProps) => (
	<ProfileCard
		title="Personal Information"
		description="Your account details and information"
		icon={<User className="h-5 w-5" />}
	>
		<div className="grid gap-4 sm:grid-cols-2">
			<EditableUsernameField username={user.username} />
			<InfoField label="Permissions">
				<Badge variant="secondary">{getPermissionLabel(user.permissions)}</Badge>
			</InfoField>
		</div>
	</ProfileCard>
)

interface GameVersionsCardProps {
	versions: Record<string, number>
}

const GameVersionsCard = ({ versions }: GameVersionsCardProps) => (
	<ProfileCard title="Game Versions" description="Your configured game version preferences">
		<div className="grid gap-4 sm:grid-cols-2">
			{Object.entries(versions).map(([game, version]) => (
				<InfoField key={game} label={getGameName(game)}>
					{getVersionName(game, version)}
				</InfoField>
			))}
		</div>
	</ProfileCard>
)

// Main component
const Profile = () => {
	const { user } = useAuth()

	if (!user) return null

	return (
		<div className="relative flex-1 overflow-auto">
			<Header title="Profile" />
			<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
				<PersonalInfoCard user={user} />
				<GameVersionsCard versions={user.versions} />
				<ProfileGamesCard />
			</div>
		</div>
	)
}

export default Profile
