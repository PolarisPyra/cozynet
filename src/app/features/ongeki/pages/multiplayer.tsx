import { GameInstructions } from "@/app/shared/components/multiplayer/SetupInstructions"
import { MultiplayerPage } from "@/app/shared/components/multiplayer/MultiplayerPage"

const INSTRUCTIONS: GameInstructions = {
	modName: "Mu3PartyBridge",
	// TODO: replace with the actual hosted release URL once a GitHub release /
	// Thunderstore package exists. Placeholder points at the repo.
	downloadUrl: "https://gitea.tendokyu.moe/akanyan/mu3-mods/releases",
	configFile: "mu3.ini",
	configSection: "Party",
	notes: (
		<div className="flex flex-col gap-2">
			<p>
				<strong>Version matching:</strong> ROM and OPT data must match exactly to play together.
			</p>
			<p>
				<strong>Troubleshooting:</strong> if the in-game matching tab shows{" "}
				<strong>店内マッチングOFF</strong>, set Machine Group to{" "}
				<code className="rounded bg-muted px-1">A</code> in the operator test menu and reboot — the
				setting is read once at boot.
			</p>
		</div>
	)
}

export function OngekiMultiplayer() {
	return <MultiplayerPage game="ongeki" gameLabel="ONGEKI" instructions={INSTRUCTIONS} />
}

export default OngekiMultiplayer
