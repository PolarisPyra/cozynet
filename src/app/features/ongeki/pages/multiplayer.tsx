import { GameInstructions } from "@/app/shared/components/multiplayer/SetupInstructions"
import { MultiplayerPage } from "@/app/shared/components/multiplayer/MultiplayerPage"

const INSTRUCTIONS: GameInstructions = {
	modName: "Mu3PartyBridge",
	// TODO: replace with the actual hosted release URL once a GitHub release /
	// Thunderstore package exists. Placeholder points at the repo.
	downloadUrl: "https://gitea.tendokyu.moe/akanyan/mu3-mods/releases",
	configFile: "mu3.ini",
	configSection: "Party",
	installPath: "%LocalAppData%\\STARTLINER\\data\\pkg\\local-Mu3Mods\\app\\BepInEx\\monomod\\",
	notes: (
		<>
			<p>
				<strong>Version matching:</strong> party play requires an exact match on both ROM version
				(1.55 vs 1.52) and loaded OPT data. The bridge reads both from the game at runtime — no
				per-session config needed — and Artemis enforces the match at lobby-join time. Cabinets with
				different loaded content will see each other's lobbies grayed out with the Join button
				disabled.
			</p>
		</>
	)
}

export function OngekiMultiplayer() {
	return <MultiplayerPage game="ongeki" gameLabel="ONGEKI" instructions={INSTRUCTIONS} />
}

export default OngekiMultiplayer
