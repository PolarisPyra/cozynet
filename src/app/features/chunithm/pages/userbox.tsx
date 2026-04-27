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
import { Body, Container } from "@/app/shared/pages/layout/layout"

const ChunithmUserbox = () => {
	const version = useChunithmVersion()
	const isVerseOrAbove = version >= 17

	if (!version) {
		return (
			<Container>
				<Header title={"Userbox"} />
				<Body className="flex items-center justify-center">
					<p className="text-primary">Please set your Chunithm version in settings first</p>
				</Body>
			</Container>
		)
	}

	return (
		<Container>
			<Header title={"Userbox"} />
			<AvatarPendingProvider>
				<UserboxPendingProvider>
					<Body className="flex w-full flex-col gap-6 px-3 sm:px-4 lg:px-5">
						<div className="flex flex-col gap-6 lg:flex-row">
							{/* Persistent Preview Section */}
							<div className="lg:w-1/3 xl:w-1/4">
								<div className="sticky top-4 flex flex-col gap-4">
									<div className="border-border overflow-hidden rounded-xl border">
										<div className="border-border border-b px-4 py-2">
											<span className="text-sm font-semibold opacity-70">Avatar Preview</span>
										</div>
										<div className="p-4">
											<AvatarPreview />
										</div>
									</div>
								</div>
							</div>

							{/* Customization Section */}
							<div className="flex-1">
								<Tabs defaultValue="avatar" className="w-full">
									<div className="mb-6 flex w-full justify-start overflow-x-auto pb-1 sm:justify-center">
										<TabsList className="min-w-max">
											<TabsTrigger value="avatar">Avatar</TabsTrigger>
											<TabsTrigger value="nameplate">Nameplate</TabsTrigger>
											<TabsTrigger value="trophy">Trophy</TabsTrigger>
											<TabsTrigger value="voice">Voice</TabsTrigger>
											<TabsTrigger value="mapicon">Map Icon</TabsTrigger>
											<TabsTrigger value="character">Character</TabsTrigger>
											{isVerseOrAbove && <TabsTrigger value="stage">Stage</TabsTrigger>}
										</TabsList>
									</div>

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
								</Tabs>
							</div>
						</div>
					</Body>
				</UserboxPendingProvider>
			</AvatarPendingProvider>
		</Container>
	)
}

export default ChunithmUserbox
