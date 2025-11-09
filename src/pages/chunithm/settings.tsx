import React from "react"

import Header from "@/components/common/header"
import ChunithmGameOptions from "@/components/settings/chunithm/game-options"
import JsonExport from "@/components/settings/chunithm/json-export"
import SongManagement from "@/components/settings/chunithm/song-management"
import TeamManagement from "@/components/settings/chunithm/team-management"
import TicketManagement from "@/components/settings/chunithm/ticket-management"
import ChunithmVersionManager from "@/components/settings/chunithm/version-management"
import { Body, Container } from "@/pages/layout/layout"

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
