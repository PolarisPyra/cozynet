import { useState, useMemo } from "react"

import { Gamepad2, Save, X, Search } from "lucide-react"

import { useAdminUserProfiles, useUpdateAdminUserProfile, type AdminGameProfile } from "@/app/features/admin/hooks/use-admin-profiles"
import Spinner from "@/app/shared/components/common/spinner"
import { Badge } from "@/app/shared/components/ui/badge"
import { Button } from "@/app/shared/components/ui/button"
import { Input } from "@/app/shared/components/ui/input"
import { Label } from "@/app/shared/components/ui/label"
import { ScrollArea } from "@/app/shared/components/ui/scroll-area"
import { ChunithmVersions } from "@/app/shared/utils/chunithm"
import { MaimaiDxVersions } from "@/app/shared/utils/maimai"
import { OngekiVersions } from "@/app/shared/utils/ongeki"

interface Props {
	userId: number
}

const GAMES = [
	{ key: "chunithm", name: "Chunithm", color: "bg-amber-500", versions: ChunithmVersions },
	{ key: "ongeki", name: "Ongeki", color: "bg-pink-500", versions: OngekiVersions },
	{ key: "maimaidx", name: "maimai DX", color: "bg-blue-500", versions: MaimaiDxVersions }
]

function ProfileEditor({
	profile,
	versions,
	onSave,
	onCancel
}: {
	profile: AdminGameProfile
	versions: Record<number, string>
	onSave: (data: AdminGameProfile) => void
	onCancel: () => void
}) {
	const [formData, setFormData] = useState({ ...profile })
	const [searchQuery, setSearchQuery] = useState("")

	const handleChange = (key: string, val: string) => {
		const isNumber = typeof profile[key] === "number" || profile[key] === null
		setFormData(prev => ({
			...prev,
			[key]: isNumber ? (val === "" ? null : Number(val)) : val
		}))
	}

	const filteredFields = useMemo(() => {
		const entries = Object.entries(formData).filter(([key]) => key !== "id" && key !== "user" && key !== "version")
		if (!searchQuery.trim()) return entries
		const q = searchQuery.toLowerCase()
		return entries.filter(([key]) => key.toLowerCase().includes(q))
	}, [formData, searchQuery])

	const versionName = versions[Number(profile.version)] || `Version ${profile.version}`

	return (
		<div className="bg-muted/50 rounded-md p-4 space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="font-semibold">{versionName}</div>
				<div className="flex flex-1 min-w-[200px] items-center gap-2">
					<div className="relative flex-1">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search fields (e.g. rating, playCount)..."
							className="pl-9 h-9"
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
						/>
					</div>
					<div className="flex gap-2">
						<Button size="sm" variant="outline" onClick={onCancel}>
							<X className="mr-1 size-3" /> Cancel
						</Button>
						<Button size="sm" onClick={() => onSave(formData)}>
							<Save className="mr-1 size-3" /> Save
						</Button>
					</div>
				</div>
			</div>
			<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
				{filteredFields.map(([key, value]) => {
					const isNumber = typeof profile[key] === "number" || profile[key] === null
					return (
							<div key={key} className="space-y-1">
								<Label className="text-xs text-muted-foreground truncate" title={key}>
									{key}
								</Label>
								<Input
									type={isNumber ? "number" : "text"}
									value={(value as string | number) ?? ""}
									onChange={e => handleChange(key, e.target.value)}
									className="h-8 text-xs"
								/>
							</div>
						)
					})}
			</div>
			{filteredFields.length === 0 && (
				<div className="text-center py-4 text-sm text-muted-foreground">
					No fields matching "{searchQuery}"
				</div>
			)}
		</div>
	)
}

export function AdminGameProfiles({ userId }: Props) {
	const { data, isLoading } = useAdminUserProfiles(userId)
	const { mutate: updateProfile } = useUpdateAdminUserProfile()
	const [editingItem, setEditingItem] = useState<{ game: string; version: number } | null>(null)

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Spinner />
			</div>
		)
	}

	if (!data) return null

	const hasAnyProfile =
		(data.chunithm?.length || 0) > 0 || (data.ongeki?.length || 0) > 0 || (data.maimaidx?.length || 0) > 0

	if (!hasAnyProfile) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
				<Gamepad2 className="mb-2 size-8 opacity-50" />
				<p>No game profiles found for this user.</p>
			</div>
		)
	}

	return (
		<ScrollArea className="h-[60vh] pr-4">
			<div className="space-y-6">
				{GAMES.map(game => {
					const profiles = data[game.key as keyof typeof data] || []
					if (profiles.length === 0) return null

					return (
						<div key={game.key} className="space-y-3">
							<div className="flex items-center gap-2 border-b pb-2">
								<div className={`h-3 w-3 rounded-full ${game.color}`} />
								<h3 className="font-semibold">{game.name}</h3>
								<Badge variant="secondary" className="ml-2">
									{profiles.length} profile{profiles.length !== 1 && "s"}
								</Badge>
							</div>

							<div className="space-y-3">
								{profiles.map((profile: AdminGameProfile) => {
									const isEditing = editingItem?.game === game.key && editingItem?.version === profile.version

									if (isEditing) {
										return (
											<ProfileEditor
												key={profile.version}
												profile={profile}
												versions={game.versions}
												onCancel={() => setEditingItem(null)}
												onSave={newData => {
													updateProfile({
														userId,
														game: game.key,
														version: profile.version,
														data: newData
													})
													setEditingItem(null)
												}}
											/>
										)
									}

									const versionName = game.versions[Number(profile.version)] || `Version ${profile.version}`

									return (
										<div
											key={profile.version}
											className="bg-muted/30 flex items-center justify-between rounded-md p-3 hover:bg-muted/50 transition-colors"
										>
											<div className="space-y-1.5">
												<div className="font-semibold text-base tracking-tight">{versionName}</div>
												<div className="text-muted-foreground text-sm flex flex-wrap gap-x-4 gap-y-1">
													{profile.userName && (
														<span>
															Name: <span className="text-foreground font-medium">{profile.userName}</span>
														</span>
													)}
													{profile.level !== undefined && (
														<span>
															Level: <span className="text-foreground font-medium">{profile.level}</span>
														</span>
													)}
													{profile.playerRating !== undefined && (
														<span>
															Rating: <span className="text-foreground font-medium">{profile.playerRating}</span>
														</span>
													)}
												</div>
											</div>
											<Button variant="secondary" size="sm" onClick={() => setEditingItem({ game: game.key, version: profile.version })}>
												Edit
											</Button>
										</div>
									)
								})}
							</div>
						</div>
					)
				})}
			</div>
		</ScrollArea>
	)
}
