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
					<Body className="flex w-full flex-col gap-4 px-3 sm:px-4 lg:px-5">
						<AvatarPreview />
						<div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							<AvatarAccessories />
							<Nameplate />
							<Trophy />
							<SystemVoice />
							<MapIcon />
							<Character />
							{isVerseOrAbove && <Stage />}
						</div>
					</Body>
				</UserboxPendingProvider>
			</AvatarPendingProvider>
		</Container>
	)
}

export default ChunithmUserbox
