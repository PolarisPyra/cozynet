import ForceUnlockSongs from "@/app/features/popn/components/settings/force-unlock-songs"
import Header from "@/app/shared/components/common/header"
import { Body, Container } from "@/app/shared/pages/layout/layout"

export function PopnSettingsPage() {
	return (
		<Container>
			<Header title="Pop'n Music Settings" />
			<Body className="space-y-6 py-6 sm:py-8">
				<ForceUnlockSongs />
			</Body>
		</Container>
	)
}

export default PopnSettingsPage
