import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { formatVersionCompact, formatVersionLong } from "@/app/shared/hooks/format-version"
import {
	LobbySnapshot,
	partyCreateLobby,
	partyJoinLobby,
	usePartyLobbies,
	usePartyPresence
} from "@/app/shared/hooks/use-party"
import { Button } from "@/app/shared/components/ui/button"

interface LobbiesPaneProps {
	game: string
	gameLabel: string
	currentLobbyId: string | null
}

export function LobbiesPane({ game, gameLabel, currentLobbyId }: LobbiesPaneProps) {
	const { data: lobbies = [], isLoading } = usePartyLobbies(game)
	const { data: presence } = usePartyPresence(game)
	const qc = useQueryClient()

	const atCabinet = !!presence?.at_cabinet
	const myVersion = presence?.game_version

	// Inject the freshly-created/joined lobby into the cached list directly
	// so activeLobbyId resolves immediately. No optimistic-state hack to
	// clear when the lobby later closes.
	const writeLobby = (lobby: LobbySnapshot) =>
		qc.setQueryData<LobbySnapshot[]>(["party", game, "lobbies"], old => {
			const list = old ?? []
			const idx = list.findIndex(l => l.id === lobby.id)
			if (idx < 0) return [...list, lobby]
			const next = list.slice()
			next[idx] = lobby
			return next
		})

	const handleCreate = async () => {
		try {
			const lobby = await partyCreateLobby(game)
			writeLobby(lobby)
			toast.success("Lobby created")
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to create lobby")
		}
	}

	const handleJoin = async (lobbyId: string) => {
		try {
			const lobby = await partyJoinLobby(game, lobbyId)
			writeLobby(lobby)
			toast.success("Joined lobby")
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to join lobby")
		}
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between">
				<div>
					<div className="text-lg font-semibold">Available Lobbies</div>
					<div className="text-muted-foreground text-xs" title={myVersion ?? undefined}>
						{atCabinet && myVersion
							? `Your cabinet: ${formatVersionLong(myVersion, gameLabel)}`
							: "Not at a cabinet — join disabled"}
					</div>
				</div>
				<Button
					size="sm"
					onClick={handleCreate}
					disabled={!atCabinet || !!currentLobbyId}
					title={!atCabinet ? "Swipe your card at a cabinet first" : undefined}
				>
					Create Lobby
				</Button>
			</div>

			{isLoading && <div className="text-muted-foreground text-sm">Loading lobbies...</div>}

			{!isLoading && lobbies.length === 0 && (
				<div className="text-muted-foreground rounded border border-dashed p-6 text-center text-sm">
					No open lobbies yet{atCabinet ? " — create one!" : "."}
				</div>
			)}

			<div className="flex flex-col gap-2">
				{lobbies.map(lobby => {
					const versionMatches = myVersion != null && lobby.game_version === myVersion
					const reason = !atCabinet
						? "Swipe your card at a cabinet first"
						: currentLobbyId
							? "Leave your current lobby first"
							: !versionMatches
								? `Your cabinet is ${formatVersionLong(myVersion, gameLabel)} — lobby is ${formatVersionLong(lobby.game_version, gameLabel)}`
								: undefined
					return (
						<LobbyRow
							key={lobby.id}
							lobby={lobby}
							gameLabel={gameLabel}
							compatible={versionMatches}
							disabledReason={reason}
							onJoin={() => handleJoin(lobby.id)}
						/>
					)
				})}
			</div>
		</div>
	)
}

interface LobbyRowProps {
	lobby: LobbySnapshot
	gameLabel: string
	compatible: boolean
	disabledReason: string | undefined
	onJoin: () => void
}

function LobbyRow({ lobby, gameLabel, compatible, disabledReason, onJoin }: LobbyRowProps) {
	const host = lobby.seats.find(s => s.user_id === lobby.host_user_id)
	const openSince = relativeTime(lobby.created_at * 1000)
	return (
		<div
			className={`flex items-center justify-between rounded border p-3 ${compatible ? "" : "opacity-60"}`}
		>
			<div>
				<div className="font-medium">{host?.username ?? "(unknown host)"}</div>
				<div className="text-muted-foreground text-xs" title={lobby.game_version}>
					{gameLabel} {formatVersionCompact(lobby.game_version)} · {lobby.seats.length}/4 · {openSince}
					{!compatible && disabledReason && (
						<span className="ml-2 text-yellow-600">· version mismatch</span>
					)}
				</div>
			</div>
			<Button
				size="sm"
				variant="outline"
				onClick={onJoin}
				disabled={!!disabledReason}
				title={disabledReason}
			>
				Join
			</Button>
		</div>
	)
}

function relativeTime(ts: number): string {
	const diff = Math.max(0, Date.now() - ts)
	const mins = Math.floor(diff / 60000)
	if (mins < 1) return "just now"
	if (mins < 60) return `${mins} min ago`
	const hrs = Math.floor(mins / 60)
	return `${hrs} h ago`
}
