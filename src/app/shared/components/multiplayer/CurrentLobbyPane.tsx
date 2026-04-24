import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { formatVersionLong } from "@/app/shared/hooks/format-version"
import {
	LobbySnapshot,
	partyKickMember,
	partyLeaveLobby,
	partyStartLobby
} from "@/app/shared/hooks/use-party"
import { useAuth } from "@/app/shared/hooks/auth/use-auth"
import { Button } from "@/app/shared/components/ui/button"

interface CurrentLobbyPaneProps {
	game: string
	gameLabel: string
	lobby: LobbySnapshot | undefined
	onLeft: () => void
}

export function CurrentLobbyPane({ game, gameLabel, lobby, onLeft }: CurrentLobbyPaneProps) {
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
	const attachedCount = lobby.seats.filter(s => s.attached).length

	const invalidate = () => qc.invalidateQueries({ queryKey: ["party", game, "lobbies"] })

	const handleLeave = async () => {
		try {
			await partyLeaveLobby(game, lobby.id)
			invalidate()
			onLeft()
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to leave")
		}
	}

	const handleStart = async () => {
		try {
			await partyStartLobby(game, lobby.id)
			invalidate()
			toast.success("Lobby started — go to your cabinet")
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to start")
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

	const copyInvite = () => {
		const url = `${location.origin}/${game}/multiplayer?join=${encodeURIComponent(lobby.id)}`
		navigator.clipboard?.writeText(url).then(
			() => toast.success("Invite link copied"),
			() => toast.error("Could not copy link")
		)
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between">
				<div>
					<div className="text-lg font-semibold">Lobby #{lobby.id.slice(0, 8)}</div>
					<div className="text-muted-foreground text-xs" title={lobby.game_version}>
						{formatVersionLong(lobby.game_version, gameLabel)} · <StatusBadge status={lobby.status} />
					</div>
				</div>
				{lobby.status === "active" ? (
					<div className="rounded bg-green-500/10 px-2 py-1 text-xs text-green-700">
						Game in progress — go to your cabinet
					</div>
				) : (
					isHost && (
						<Button size="sm" onClick={handleStart} disabled={attachedCount < 2}>
							Start Lobby
						</Button>
					)
				)}
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
							onInvite={copyInvite}
							status={lobby.status}
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

function StatusBadge({ status }: { status: LobbySnapshot["status"] }) {
	const color =
		status === "waiting" ? "text-yellow-600" : status === "active" ? "text-green-600" : "text-gray-500"
	return <span className={`font-medium capitalize ${color}`}>{status}</span>
}

interface SeatRowProps {
	seat: number
	member: LobbySnapshot["seats"][number] | undefined
	isHostSeat: boolean
	canKick: boolean
	onKick: () => void
	onInvite: () => void
	status: LobbySnapshot["status"]
}

function SeatRow({ seat, member, isHostSeat, canKick, onKick, onInvite, status }: SeatRowProps) {
	if (!member) {
		return (
			<div className="text-muted-foreground flex items-center justify-between rounded border border-dashed p-3 text-sm">
				<span>Seat {seat}: empty</span>
				{status === "waiting" && (
					<Button size="sm" variant="ghost" onClick={onInvite}>
						Copy invite link
					</Button>
				)}
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
				{status === "active" && <span className="ml-2 text-xs text-green-600">▶ Playing</span>}
			</div>
			{canKick && (
				<Button size="sm" variant="ghost" onClick={onKick}>
					Kick
				</Button>
			)}
		</div>
	)
}
