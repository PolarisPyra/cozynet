import { useEffect, useState } from "react"

import { Gamepad2, Hash, Palette, User } from "lucide-react"
import { HexColorPicker } from "react-colorful"

import { ChunithmRatingColors } from "@/app/features/chunithm/components/rating-colors"
import { OngekiRatingColors } from "@/app/features/ongeki/components/rating-colors"
import { useAccentColorContext } from "@/app/shared/components/accent-color-provider"
import Header from "@/app/shared/components/common/header"
import Spinner from "@/app/shared/components/common/spinner"
import { Avatar, AvatarFallback } from "@/app/shared/components/ui/avatar"
import { Badge } from "@/app/shared/components/ui/badge"
import { Button } from "@/app/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/shared/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/shared/components/ui/popover"
import { useAuth } from "@/app/shared/hooks/auth/use-auth"
import { useProfileVersions } from "@/app/shared/hooks/users"
import { ChunithmVersions } from "@/app/shared/utils/chunithm"
import { MaimaiDxVersions } from "@/app/shared/utils/maimai"
import { OngekiVersions } from "@/app/shared/utils/ongeki"
import {
	type ChunithmProfile,
	type MaimaiProfile,
	type OngekiProfile,
	convertProfileRating
} from "@/app/shared/utils/profile-rating-utils"

interface ProfileData {
	chunithm: ChunithmProfile[]
	ongeki: OngekiProfile[]
	maimaidx: MaimaiProfile[]
}

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

const isValidHex = (v: string) => /^#[0-9A-Fa-f]{6}$/.test(v)
const getVersionName = (versions: Record<number, string>, version: number) => versions[version] ?? `Version ${version}`

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
	const { accentColor, setAccentColor } = useAccentColorContext()
	const [color, setColor] = useState(accentColor)

	useEffect(() => {
		setColor(accentColor)
	}, [accentColor])

	const handleColorChange = (newColor: string) => {
		setColor(newColor)
		setAccentColor(newColor)
	}

	return (
		<Card className={CARD_CLASS}>
			<div className="relative h-24 sm:h-32" style={{ backgroundColor: color }}>
				<ColorPicker color={color} onChange={handleColorChange} onClose={() => {}} />
			</div>
			<CardContent className="group relative px-4 pb-20">
				<div className="flex justify-start pt-2">
					<Avatar
						className="-mt-16 h-16 w-16 rounded-md border-4 sm:-mt-16 sm:h-20 sm:w-20 [&>span]:rounded-md"
						style={{ borderColor: color }}
					>
						<AvatarFallback className="bg-muted text-muted-foreground rounded-md">
							<User className="h-8 w-8 sm:h-10 sm:w-10" />
						</AvatarFallback>
					</Avatar>
				</div>
				<div className="border-border my-6 border-t" />
				<div className="flex items-center justify-between gap-4">
					<span className="text-xl font-semibold sm:text-2xl">{user.username}</span>
					<div className="flex items-center gap-2">
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
				</div>
			</CardContent>
		</Card>
	)
}

function GameProfiles() {
	const { data, isLoading } = useProfileVersions() as { data: ProfileData | undefined; isLoading: boolean }

	if (isLoading)
		return (
			<div className="flex justify-center py-12">
				<Spinner className="h-8 w-8" />
			</div>
		)
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
							{profiles.map(profile => {
								const { rating, decimals } = convertProfileRating(key, profile, profile.version)
								const versionName = getVersionName(versions, profile.version)

								return (
									<div
										key={profile.version}
										className="bg-muted/50 flex flex-col gap-1.5 rounded-md p-2.5 sm:flex-row sm:items-center sm:justify-between"
									>
										<div className="flex items-center gap-2">
											<span className="truncate text-sm font-medium">{versionName}</span>
											{rating !== null &&
												rating !== undefined &&
												(key === "chunithm" || key === "chunithmnew" ? (
													<ChunithmRatingColors rating={rating} version={profile.version} />
												) : key === "ongeki" ? (
													<OngekiRatingColors rating={rating} version={profile.version} decimals={decimals} />
												) : key === "maimai" || key === "maimaidx" ? (
													<span className="text-foreground text-sm font-bold tabular-nums">
														{decimals > 0 ? rating.toFixed(decimals) : rating.toString()}
													</span>
												) : null)}
										</div>
										{profile.userName && (
											<Badge variant="secondary" className="h-6 rounded-sm font-mono text-xs">
												{profile.userName}
											</Badge>
										)}
									</div>
								)
							})}
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
