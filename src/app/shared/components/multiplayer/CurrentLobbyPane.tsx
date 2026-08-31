import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { formatVersionLong } from "@/app/shared/hooks/format-version"
import {
	LobbySnapshot,
	partyKickMember,
	partyLeaveLobby
} from "@/app/shared/hooks/use-party"
import { useAuth } from "@/app/shared/hooks/auth/use-auth"
import { Button } from "@/app/shared/components/ui/button"

interface CurrentLobbyPaneProps {
	game: string
	gameLabel: string
	lobby: LobbySnapshot | undefined
}

export function CurrentLobbyPane({ game, gameLabel, lobby }: CurrentLobbyPaneProps) {
	const qc = useQueryClient()
	const auth = useAuth()
	const userId = auth.user?.userId

	if (!lobby) {
		return (
			<div className="flex flex-col gap-2">
				<div className="text-lg font-semibold">Current Lobby</div>
				<div className="text-muted-foreground rounded border border-dashed p-6 text-center text-sm">
					You're not in a lobby. Use the left pane to create or join one.
				</div>
			</div>
		)
	}

	const isHost = userId === lobby.host_user_id

	const invalidate = () => qc.invalidateQueries({ queryKey: ["party", game, "lobbies"] })

	const handleLeave = async () => {
		try {
			await partyLeaveLobby(game, lobby.id)
			// Drop the lobby from the cached list immediately so the parent
			// re-derives activeLobbyId = null on the next render. Server-side
			// the lobby may persist (others still in it) — invalidate too so
			// the next refetch reconciles.
			qc.setQueryData<LobbySnapshot[]>(["party", game, "lobbies"], old =>
				(old ?? []).filter(l => l.id !== lobby.id)
			)
			invalidate()
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to leave")
		}
	}

	const handleKick = async (seat: number) => {
		try {
			await partyKickMember(game, lobby.id, seat)
			invalidate()
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to kick")
		}
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between">
				<div>
					<div className="text-lg font-semibold">Lobby #{lobby.id.slice(0, 8)}</div>
					<div className="text-muted-foreground text-xs" title={lobby.game_version}>
						{formatVersionLong(lobby.game_version, gameLabel)}
					</div>
				</div>
			</div>

			<div className="text-muted-foreground text-xs">
				Cabinets in this lobby see each other's recruits in their in-game multiplayer tab.
				Pick a song on your cabinet to start a party — anyone in this lobby can join from there.
			</div>

			<div className="flex flex-col gap-2">
				{Array.from({ length: 4 }, (_, i) => i + 1).map(seatNum => {
					const member = lobby.seats.find(s => s.seat === seatNum)
					return (
						<SeatRow
							key={seatNum}
							seat={seatNum}
							member={member}
							isHostSeat={member?.user_id === lobby.host_user_id}
							canKick={isHost && !!member && member.user_id !== lobby.host_user_id}
							onKick={() => handleKick(seatNum)}
						/>
					)
				})}
			</div>

			<div className="mt-2">
				<Button size="sm" variant="outline" onClick={handleLeave}>
					Leave Lobby
				</Button>
			</div>
		</div>
	)
}

interface SeatRowProps {
	seat: number
	member: LobbySnapshot["seats"][number] | undefined
	isHostSeat: boolean
	canKick: boolean
	onKick: () => void
}

function SeatRow({ seat, member, isHostSeat, canKick, onKick }: SeatRowProps) {
	if (!member) {
		return (
			<div className="text-muted-foreground rounded border border-dashed p-3 text-sm">
				Seat {seat}: empty
			</div>
		)
	}
	const indicator = member.attached ? (
		<span className="inline-block h-2 w-2 rounded-full bg-green-500" title="Cabinet attached" />
	) : (
		<span className="inline-block h-2 w-2 rounded-full bg-yellow-500" title="Cabinet pending" />
	)
	return (
		<div className="flex items-center justify-between rounded border p-3">
			<div className="flex items-center gap-2">
				{indicator}
				<span className="font-medium">
					Seat {seat}: {member.username}
				</span>
				{isHostSeat && <span className="text-muted-foreground text-xs">(host)</span>}
			</div>
			{canKick && (
				<Button size="sm" variant="ghost" onClick={onKick}>
					Kick
				</Button>
			)}
		</div>
	)
}
