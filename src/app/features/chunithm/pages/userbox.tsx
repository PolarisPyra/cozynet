import { Image, Map, MicVocal, Sparkles, Trophy as TrophyIcon, UserRound, Volume2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { AvatarAccessories } from "@/app/features/chunithm/components/userbox/avatar-accessories"
import { AvatarPendingProvider } from "@/app/features/chunithm/components/userbox/avatar-pending-context"
import { AvatarPreview } from "@/app/features/chunithm/components/userbox/avatar-preview"
import { Character } from "@/app/features/chunithm/components/userbox/character"
import { MapIcon } from "@/app/features/chunithm/components/userbox/map-icon"
import { Nameplate } from "@/app/features/chunithm/components/userbox/nameplate"
import { Stage } from "@/app/features/chunithm/components/userbox/stage"
import { SystemVoice } from "@/app/features/chunithm/components/userbox/system-voice"
import { Trophy } from "@/app/features/chunithm/components/userbox/trophy"
import { UserboxPendingProvider } from "@/app/features/chunithm/components/userbox/userbox-pending-context"
import { useChunithmVersion } from "@/app/features/chunithm/hooks"
import Header from "@/app/shared/components/common/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/shared/components/ui/tabs"
import { UserboxPageShell, UserboxSetupRequired } from "@/app/shared/components/userbox/userbox-page-shell"
import { Container } from "@/app/shared/pages/layout/layout"

const userboxTabs: Array<{ value: string; label: string; Icon: LucideIcon }> = [
	{ value: "avatar", label: "Avatar", Icon: UserRound },
	{ value: "nameplate", label: "Nameplate", Icon: Image },
	{ value: "trophy", label: "Trophy", Icon: TrophyIcon },
	{ value: "voice", label: "Voice", Icon: Volume2 },
	{ value: "mapicon", label: "Map Icon", Icon: Map },
	{ value: "character", label: "Character", Icon: Sparkles }
]

const ChunithmUserbox = () => {
	const version = useChunithmVersion()
	const isVerseOrAbove = version >= 17
	const tabs = isVerseOrAbove ? [...userboxTabs, { value: "stage", label: "Stage", Icon: MicVocal }] : userboxTabs

	if (!version) {
		return (
			<Container>
				<Header title="Userbox" />
				<UserboxSetupRequired>Please set your Chunithm version in settings first.</UserboxSetupRequired>
			</Container>
		)
	}

	return (
		<Container>
			<Header title="Userbox" />
			<AvatarPendingProvider>
				<UserboxPendingProvider>
					<Tabs defaultValue="avatar" className="w-full gap-0">
						<UserboxPageShell
							aside={<AvatarPreview />}
							asideTitle="Live Preview"
							toolbar={
								<div className="border-border/70 bg-card/70 rounded-md border p-2 shadow-sm">
									<TabsList className="flex h-auto w-full flex-wrap items-stretch justify-start gap-1 rounded-sm border-0 bg-transparent p-0 backdrop-blur-none">
										{tabs.map(({ value, label, Icon }) => (
											<TabsTrigger
												key={value}
												value={value}
												className="h-10 min-w-0 flex-1 basis-[8.5rem] gap-2 rounded-sm px-3"
											>
												<Icon className="h-4 w-4 shrink-0" />
												<span className="truncate">{label}</span>
											</TabsTrigger>
										))}
									</TabsList>
								</div>
							}
						>
							<div className="min-h-[400px]">
								<TabsContent value="avatar" className="mt-0 focus-visible:outline-none">
									<AvatarAccessories />
								</TabsContent>
								<TabsContent value="nameplate" className="mt-0 focus-visible:outline-none">
									<Nameplate />
								</TabsContent>
								<TabsContent value="trophy" className="mt-0 focus-visible:outline-none">
									<Trophy />
								</TabsContent>
								<TabsContent value="voice" className="mt-0 focus-visible:outline-none">
									<SystemVoice />
								</TabsContent>
								<TabsContent value="mapicon" className="mt-0 focus-visible:outline-none">
									<MapIcon />
								</TabsContent>
								<TabsContent value="character" className="mt-0 focus-visible:outline-none">
									<Character />
								</TabsContent>
								{isVerseOrAbove && (
									<TabsContent value="stage" className="mt-0 focus-visible:outline-none">
										<Stage />
									</TabsContent>
								)}
							</div>
						</UserboxPageShell>
					</Tabs>
				</UserboxPendingProvider>
			</AvatarPendingProvider>
		</Container>
	)
}

export default ChunithmUserbox
