import React from "react"

import Header from "@/app/shared/components/common/header"
import ChunithmGameOptions from "@/app/features/chunithm/components/settings/game-options"
import JsonExport from "@/app/features/chunithm/components/settings/json-export"
import SongManagement from "@/app/features/chunithm/components/settings/song-management"
import TeamManagement from "@/app/features/chunithm/components/settings/team-management"
import TicketManagement from "@/app/features/chunithm/components/settings/ticket-management"
import ChunithmVersionManager from "@/app/features/chunithm/components/settings/version-management"
import { Body, Container } from "@/app/shared/pages/layout/layout"

interface GameSettingsProps {
	onUpdate?: () => void
}

const ChunithmSettingsPage: React.FC<GameSettingsProps> = () => {
	return (
		<Container>
			<Header title={"Chunithm Settings"} />
			<Body className="space-y-6 py-6 sm:py-8">
				{/* <UpdateUsernameBox /> */}
				<ChunithmVersionManager />
				<ChunithmGameOptions />
				<TeamManagement />
				<SongManagement />
				<TicketManagement />
				<JsonExport />
			</Body>
		</Container>
	)
}

export default ChunithmSettingsPage
