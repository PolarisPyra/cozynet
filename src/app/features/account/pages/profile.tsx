import { useCallback, useEffect, useMemo, useState } from "react"

import { Edit2, Gamepad2, Hash, Palette, Save, User, X } from "lucide-react"
import { HexColorPicker } from "react-colorful"
import { toast } from "sonner"

import Header from "@/app/shared/components/common/header"
import Spinner from "@/app/shared/components/common/spinner"
import { Avatar, AvatarFallback } from "@/app/shared/components/ui/avatar"
import { Badge } from "@/app/shared/components/ui/badge"
import { Button } from "@/app/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/shared/components/ui/card"
import { Input } from "@/app/shared/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/shared/components/ui/popover"
import { useAuth } from "@/app/shared/hooks/auth/use-auth"
import { useProfileVersions, useUpdateUsername } from "@/app/shared/hooks/users"
import { ChunithmVersions, MaimaiDxVersions, OngekiVersions } from "@/app/shared/utils/enums"

type GameKey = "chunithm" | "chunithmnew" | "ongeki" | "maimai" | "maimaidx"

interface GameProfile {
	version: number
	userName: string | null
}

interface GameSection {
	key: GameKey
	name: string
	profiles: GameProfile[]
	accent: string
	versionMap: Record<number, string>
}

const GAME_CONFIG: Record<GameKey, { name: string; accent: string; versionMap: Record<number, string> }> = {
	chunithm: { name: "Chunithm", accent: "bg-amber-500", versionMap: ChunithmVersions },
	chunithmnew: { name: "Chunithm New", accent: "bg-yellow-500", versionMap: ChunithmVersions },
	ongeki: { name: "Ongeki", accent: "bg-pink-500", versionMap: OngekiVersions },
	maimai: { name: "maimai", accent: "bg-blue-500", versionMap: MaimaiDxVersions },
	maimaidx: { name: "maimai DX", accent: "bg-blue-500", versionMap: MaimaiDxVersions }
}

const DEFAULT_BANNER_COLOR = "#ef4444"
const BANNER_COLOR_KEY = "profile-banner-color"

const isValidHex = (value: string): boolean => /^#[0-9A-Fa-f]{6}$/.test(value)

const useBannerColor = (): [string, (value: string) => void] => {
	const [bannerColor, setBannerColor] = useState<string>(() => {
		if (typeof window === "undefined") return DEFAULT_BANNER_COLOR
		const stored = localStorage.getItem(BANNER_COLOR_KEY)
		return stored && isValidHex(stored) ? stored : DEFAULT_BANNER_COLOR
	})

	const setValue = useCallback((value: string) => {
		if (isValidHex(value)) {
			setBannerColor(value)
			if (typeof window !== "undefined") {
				localStorage.setItem(BANNER_COLOR_KEY, value)
			}
		}
	}, [])

	useEffect(() => {
		if (typeof window !== "undefined" && bannerColor) {
			localStorage.setItem(BANNER_COLOR_KEY, bannerColor)
		}
	}, [bannerColor])

	return [bannerColor, setValue]
}

const getVersionName = (versionMap: Record<number, string>, version: number): string =>
	versionMap[version] ?? `Version ${version}`

const PermissionBadge = ({ permissions }: { permissions: number }) => (
	<Badge variant="secondary" className="h-6 shrink-0 rounded-sm text-xs">
		{permissions === 2 ? "Admin" : "User"}
	</Badge>
)

const UserId = ({ id }: { id: number }) => (
	<div className="flex items-center gap-2">
		<span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">User ID</span>
		<Badge variant="secondary" className="h-5 rounded-sm font-mono text-xs">
			<Hash className="h-3 w-3 shrink-0" aria-hidden="true" />
			{id}
		</Badge>
	</div>
)

interface EditableUsernameProps {
	username: string
	userId?: number
}

const EditableUsername = ({ username, userId }: EditableUsernameProps) => {
	const [isEditing, setIsEditing] = useState(false)
	const [value, setValue] = useState(username)
	const { mutate: updateUsername, isPending } = useUpdateUsername()

	const handleSave = useCallback(() => {
		const trimmed = value.trim()

		if (!trimmed) {
			toast.error("Username cannot be empty")
			return
		}

		if (trimmed === username) {
			setIsEditing(false)
			return
		}

		updateUsername(
			{ username: trimmed },
			{
				onSuccess: data => {
					setValue(data.username)
					setIsEditing(false)
					toast.success("Username updated")
				},
				onError: (err: Error) => toast.error(err.message || "Update failed")
			}
		)
	}, [value, username, updateUsername])

	const handleCancel = useCallback(() => {
		setValue(username)
		setIsEditing(false)
	}, [username])

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter") handleSave()
			if (e.key === "Escape") handleCancel()
		},
		[handleSave, handleCancel]
	)

	if (isEditing) {
		return (
			<div className="flex items-center gap-2">
				<Input
					value={value}
					onChange={e => setValue(e.target.value)}
					onKeyDown={handleKeyDown}
					disabled={isPending}
					maxLength={50}
					autoFocus
					className="h-9 max-w-xs"
					aria-label="Edit username"
				/>
				<Button size="icon" variant="ghost" onClick={handleSave} disabled={isPending} aria-label="Save username">
					{isPending ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
				</Button>
				<Button size="icon" variant="ghost" onClick={handleCancel} disabled={isPending} aria-label="Cancel editing">
					<X className="h-4 w-4" />
				</Button>
			</div>
		)
	}

	return (
		<div className="space-y-1.5">
			<div className="flex flex-wrap items-center gap-2 sm:gap-3">
				<span className="text-lg font-semibold sm:text-xl">{username}</span>
				<Button
					size="icon"
					variant="ghost"
					onClick={() => setIsEditing(true)}
					className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
					aria-label="Edit username"
				>
					<Edit2 className="h-4 w-4" />
				</Button>
			</div>
			{userId !== undefined && <UserId id={userId} />}
		</div>
	)
}

const ColorPicker = ({ color, onChange }: { color: string; onChange: (color: string) => void }) => {
	const [isOpen, setIsOpen] = useState(false)

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value
		if (isValidHex(val)) onChange(val)
	}

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					size="icon"
					variant="ghost"
					className="absolute top-2 right-2 h-8 w-8 bg-black/20 text-white hover:bg-black/30"
					aria-label="Change banner color"
				>
					<Palette className="h-4 w-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-3" align="end">
				<div className="space-y-3">
					<HexColorPicker color={color} onChange={onChange} />
					<div className="flex items-center gap-2">
						<input
							type="text"
							value={color}
							onChange={handleInputChange}
							className="border-border bg-background text-foreground h-8 w-24 rounded-sm border px-2 font-mono text-xs"
							placeholder="#ef4444"
							aria-label="Hex color value"
						/>
						<div className="h-8 w-8 rounded-sm border-2" style={{ backgroundColor: color }} aria-hidden="true" />
					</div>
				</div>
			</PopoverContent>
		</Popover>
	)
}

const ProfileHeader = ({ user }: { user: NonNullable<ReturnType<typeof useAuth>["user"]> }) => {
	const [bannerColor, setBannerColor] = useBannerColor()

	return (
		<Card className="overflow-hidden rounded-md !py-0 shadow-none">
			<div className="relative h-20 sm:h-24" style={{ backgroundColor: bannerColor }}>
				<ColorPicker color={bannerColor} onChange={setBannerColor} />
			</div>
			<CardContent className="relative px-4 pt-2 pb-6 sm:px-6 sm:pt-3 sm:pb-8">
				<div className="flex items-end gap-3 sm:gap-4">
					<Avatar
						className="-mt-8 h-16 w-16 shrink-0 border-4 sm:-mt-10 sm:h-20 sm:w-20"
						style={{ borderColor: bannerColor }}
					>
						<AvatarFallback className="bg-muted text-muted-foreground">
							<User className="h-8 w-8 sm:h-10 sm:w-10" aria-hidden="true" />
						</AvatarFallback>
					</Avatar>
					<div className="group min-w-0 flex-1 pb-2">
						<EditableUsername username={user.username} userId={user.userId} />
					</div>
				</div>
				{user.permissions !== undefined && (
					<div className="absolute right-4 bottom-2 sm:right-6 sm:bottom-3">
						<PermissionBadge permissions={user.permissions} />
					</div>
				)}
			</CardContent>
		</Card>
	)
}

const GameProfileCard = ({ section }: { section: GameSection }) => (
	<Card className="!gap-0 overflow-hidden rounded-md !py-0 shadow-none">
		<CardHeader className="px-2 pt-2 pb-0 sm:px-3 sm:pt-3">
			<CardTitle className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
				<Gamepad2 className="h-4 w-4 shrink-0" aria-hidden="true" />
				<span className="truncate">{section.name}</span>
			</CardTitle>
		</CardHeader>
		<div className={`h-1 ${section.accent}`} />
		<CardContent className="space-y-2 px-3 pt-2 pb-3 sm:px-4 sm:pb-4">
			{section.profiles.map(profile => (
				<div
					key={profile.version}
					className="bg-muted/50 flex flex-col gap-1.5 rounded-md p-2.5 sm:flex-row sm:items-center sm:justify-between"
				>
					<span className="truncate text-sm font-medium">{getVersionName(section.versionMap, profile.version)}</span>
					{profile.userName && (
						<Badge variant="secondary" className="h-6 shrink-0 rounded-sm font-mono text-xs">
							{profile.userName}
						</Badge>
					)}
				</div>
			))}
		</CardContent>
	</Card>
)

const EmptyState = () => (
	<Card className="rounded-md shadow-none">
		<CardContent className="flex flex-col items-center justify-center py-12 text-center">
			<Gamepad2 className="text-muted-foreground/50 mb-3 h-12 w-12" aria-hidden="true" />
			<p className="text-muted-foreground">No game profiles found</p>
		</CardContent>
	</Card>
)

const GameProfilesSection = () => {
	const { data, isLoading } = useProfileVersions()

	const sections = useMemo<GameSection[]>(() => {
		if (!data) return []

		const definitions: Array<{ key: GameKey; filter: (p: GameProfile) => boolean }> = [
			{ key: "chunithm", filter: p => p.version <= 10 },
			{ key: "chunithmnew", filter: p => p.version > 10 },
			{ key: "ongeki", filter: () => true },
			{ key: "maimai", filter: p => p.version < 13 },
			{ key: "maimaidx", filter: p => p.version >= 13 }
		]

		const sourceMap: Record<string, GameProfile[]> = {
			chunithm: data.chunithm,
			chunithmnew: data.chunithm,
			ongeki: data.ongeki,
			maimai: data.maimaidx,
			maimaidx: data.maimaidx
		}

		return definitions
			.map(({ key, filter }) => {
				const config = GAME_CONFIG[key]
				const profiles = sourceMap[key].filter(filter)
				return { key, profiles, ...config }
			})
			.filter(s => s.profiles.length > 0)
	}, [data])

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Spinner className="h-8 w-8" />
			</div>
		)
	}

	if (sections.length === 0) return <EmptyState />

	return (
		<section className="space-y-4" aria-labelledby="game-profiles-heading">
			<div className="flex items-center gap-2 px-1">
				<Gamepad2 className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />
				<h2 id="game-profiles-heading" className="text-lg font-semibold">
					Game Profiles
				</h2>
			</div>
			<div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
				{sections.map(section => (
					<GameProfileCard key={section.key} section={section} />
				))}
			</div>
		</section>
	)
}

export default function Profile() {
	const { user } = useAuth()

	if (!user) return null

	return (
		<div className="flex-1 overflow-auto">
			<Header title="Profile" />
			<main className="space-y-6 p-4 sm:p-6 lg:p-8">
				<ProfileHeader user={user} />
				<GameProfilesSection />
			</main>
		</div>
	)
}
