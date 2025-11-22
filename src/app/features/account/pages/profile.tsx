import { useState } from "react"

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

// Types
interface GameProfile {
	version: number
	userName: string | null
}

interface ProfileData {
	chunithm: GameProfile[]
	ongeki: GameProfile[]
	maimaidx: GameProfile[]
}

// Config
const GAMES = [
	{
		key: "chunithm",
		name: "Chunithm",
		color: "bg-amber-500",
		versions: ChunithmVersions,
		getData: (d: ProfileData) => d.chunithm.filter(p => p.version <= 10)
	},
	{
		key: "chunithmnew",
		name: "Chunithm New",
		color: "bg-yellow-500",
		versions: ChunithmVersions,
		getData: (d: ProfileData) => d.chunithm.filter(p => p.version > 10)
	},
	{
		key: "ongeki",
		name: "Ongeki",
		color: "bg-pink-500",
		versions: OngekiVersions,
		getData: (d: ProfileData) => d.ongeki
	},
	{
		key: "maimai",
		name: "maimai",
		color: "bg-blue-500",
		versions: MaimaiDxVersions,
		getData: (d: ProfileData) => d.maimaidx.filter(p => p.version < 13)
	},
	{
		key: "maimaidx",
		name: "maimai DX",
		color: "bg-blue-500",
		versions: MaimaiDxVersions,
		getData: (d: ProfileData) => d.maimaidx.filter(p => p.version >= 13)
	}
] as const

const CARD_CLASS = "overflow-hidden rounded-md !py-0 shadow-none"
const DEFAULT_COLOR = "#ef4444"
const STORAGE_KEY = "profile-banner-color"

const isValidHex = (v: string) => /^#[0-9A-Fa-f]{6}$/.test(v)

const getVersionName = (versions: Record<number, string>, version: number) => versions[version] ?? `Version ${version}`

const getStoredColor = () => {
	const stored = localStorage.getItem(STORAGE_KEY)
	return stored && isValidHex(stored) ? stored : DEFAULT_COLOR
}

// Components
function EditableUsername({ username }: { username: string }) {
	const [editing, setEditing] = useState(false)
	const [value, setValue] = useState(username)
	const { mutate, isPending } = useUpdateUsername()

	const save = () => {
		const trimmed = value.trim()
		if (!trimmed) return toast.error("Username cannot be empty")
		if (trimmed === username) return setEditing(false)

		mutate(
			{ username: trimmed },
			{
				onSuccess: data => {
					setValue(data.username)
					setEditing(false)
					toast.success("Username updated")
				},
				onError: (err: Error) => toast.error(err.message || "Update failed")
			}
		)
	}

	const cancel = () => {
		setValue(username)
		setEditing(false)
	}

	if (editing) {
		return (
			<form
				onSubmit={e => {
					e.preventDefault()
					save()
				}}
				className="flex items-center gap-2"
			>
				<Input
					value={value}
					onChange={e => setValue(e.target.value)}
					onKeyDown={e => e.key === "Escape" && cancel()}
					disabled={isPending}
					maxLength={50}
					autoFocus
					className="h-9 max-w-xs"
				/>
				<Button size="icon" variant="ghost" type="submit" disabled={isPending}>
					{isPending ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
				</Button>
				<Button size="icon" variant="ghost" type="button" onClick={cancel} disabled={isPending}>
					<X className="h-4 w-4" />
				</Button>
			</form>
		)
	}

	return (
		<div className="flex items-center gap-2">
			<span className="text-xl font-semibold sm:text-2xl">{username}</span>
			<Button size="icon" variant="ghost" onClick={() => setEditing(true)} className="text-muted-foreground h-8 w-8">
				<Edit2 className="h-4 w-4" />
			</Button>
		</div>
	)
}

function ColorPicker({
	color,
	onChange,
	onClose
}: {
	color: string
	onChange: (c: string) => void
	onClose: () => void
}) {
	return (
		<Popover onOpenChange={open => !open && onClose()}>
			<PopoverTrigger asChild>
				<Button
					size="icon"
					variant="ghost"
					className="absolute top-2 right-2 h-8 w-8 bg-black/20 text-white hover:bg-black/30"
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
							onChange={e => isValidHex(e.target.value) && onChange(e.target.value)}
							className="border-border bg-background h-8 w-24 rounded-sm border px-2 font-mono text-xs"
						/>
						<div className="h-8 w-8 rounded-sm border-2" style={{ backgroundColor: color }} />
					</div>
				</div>
			</PopoverContent>
		</Popover>
	)
}

function ProfileHeader({ user }: { user: { username: string; userId: number; permissions?: number } }) {
	const [color, setColor] = useState(getStoredColor)

	const saveColor = () => localStorage.setItem(STORAGE_KEY, color)

	return (
		<Card className={CARD_CLASS}>
			<div className="relative h-24 sm:h-32" style={{ backgroundColor: color }}>
				<ColorPicker color={color} onChange={setColor} onClose={saveColor} />
			</div>
			<CardContent className="relative px-4 pb-20">
				<div className="flex items-end gap-4">
					<Avatar className="-mt-12 h-24 w-24 border-4 sm:-mt-16 sm:h-28 sm:w-28" style={{ borderColor: color }}>
						<AvatarFallback className="bg-muted text-muted-foreground">
							<User className="h-12 w-12 sm:h-14 sm:w-14" />
						</AvatarFallback>
					</Avatar>
					<div className="flex-1 pr-32">
						<EditableUsername username={user.username} />
					</div>
				</div>
				<div className="absolute right-4 bottom-4 flex items-center gap-2">
					<Badge variant="secondary" className="h-6 gap-0 rounded-sm font-mono text-xs">
						<Hash className="-mr-0.5 h-3 w-3" />
						{user.userId}
					</Badge>
					{user.permissions !== undefined && (
						<Badge variant="secondary" className="h-6 rounded-sm text-xs">
							{user.permissions === 2 ? "Admin" : "User"}
						</Badge>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

function GameProfiles() {
	const { data, isLoading } = useProfileVersions() as { data: ProfileData | undefined; isLoading: boolean }

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Spinner className="h-8 w-8" />
			</div>
		)
	}

	if (!data) return null

	const sections = GAMES.map(game => ({ ...game, profiles: game.getData(data) })).filter(s => s.profiles.length > 0)

	if (!sections.length) {
		return (
			<Card className="rounded-md shadow-none">
				<CardContent className="flex flex-col items-center py-12">
					<Gamepad2 className="text-muted-foreground/50 mb-3 h-12 w-12" />
					<p className="text-muted-foreground">No game profiles found</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<section className="space-y-4">
			<div className="flex items-center gap-2 px-1">
				<Gamepad2 className="text-muted-foreground h-5 w-5" />
				<h2 className="text-lg font-semibold">Game Profiles</h2>
			</div>
			<div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
				{sections.map(({ key, name, color, versions, profiles }) => (
					<Card key={key} className={`!gap-0 ${CARD_CLASS}`}>
						<CardHeader className="px-3 py-2 sm:px-4 sm:py-3">
							<CardTitle className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
								<Gamepad2 className="h-4 w-4" />
								<span className="truncate">{name}</span>
							</CardTitle>
						</CardHeader>
						<div className={`h-1 ${color}`} />
						<CardContent className="space-y-2 p-3 sm:p-4">
							{profiles.map(p => (
								<div
									key={p.version}
									className="bg-muted/50 flex flex-col gap-1.5 rounded-md p-2.5 sm:flex-row sm:items-center sm:justify-between"
								>
									<span className="truncate text-sm font-medium">{getVersionName(versions, p.version)}</span>
									{p.userName && (
										<Badge variant="secondary" className="h-6 rounded-sm font-mono text-xs">
											{p.userName}
										</Badge>
									)}
								</div>
							))}
						</CardContent>
					</Card>
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
				<GameProfiles />
			</main>
		</div>
	)
}
