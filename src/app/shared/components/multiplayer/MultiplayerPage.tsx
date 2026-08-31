import { useEffect } from "react"

import { useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import { CabinetPresenceChip } from "@/app/shared/components/multiplayer/CabinetPresenceChip"
import { CurrentLobbyPane } from "@/app/shared/components/multiplayer/CurrentLobbyPane"
import { LobbiesPane } from "@/app/shared/components/multiplayer/LobbiesPane"
import { GameInstructions, SetupInstructions } from "@/app/shared/components/multiplayer/SetupInstructions"
import {
	LobbySnapshot,
	partyJoinLobby,
	useCurrentLobby,
	useLobbyRealtime,
	usePartyLobbies
} from "@/app/shared/hooks/use-party"
import { useAuth } from "@/app/shared/hooks/auth/use-auth"
import Header from "@/app/shared/components/common/header"
import { Body, Container } from "@/app/shared/pages/layout/layout"

interface MultiplayerPageProps {
	/** Artemis game tag — must match the bridge mod's ``game`` handshake param. */
	game: string
	/** Human label — "ONGEKI", "Chunithm", etc. Used in headings and toast copy. */
	gameLabel: string
	/** Per-game setup instructions (mod name, download link, config snippet). */
	instructions: GameInstructions
}

/**
 * Shared, game-parametrized multiplayer page. Per-title wrappers under
 * ``app/features/<title>/pages/multiplayer.tsx`` pass their own game tag.
 */
export function MultiplayerPage({ game, gameLabel, instructions }: MultiplayerPageProps) {
	const [searchParams, setSearchParams] = useSearchParams()
	const auth = useAuth()
	const qc = useQueryClient()
	const { data: lobbies = [] } = usePartyLobbies(game)

	// Server state is the source of truth: derive the user's lobby purely
	// from the lobbies list. When the lobby closes server-side (host drop,
	// cabinet disconnect, etc.), the next refetch removes it and this goes
	// back to null automatically — no stale "you're in a lobby" UI.
	const activeLobbyId =
		auth.user?.userId != null
			? lobbies.find(l => l.seats.some(s => s.user_id === auth.user!.userId))?.id ?? null
			: null

	const currentLobby = useCurrentLobby(game, activeLobbyId)
	useLobbyRealtime({ game, lobbyId: activeLobbyId })

	useEffect(() => {
		const joinId = searchParams.get("join")
		if (!joinId || activeLobbyId === joinId) return
		let cancelled = false
		;(async () => {
			try {
				const lobby = await partyJoinLobby(game, joinId)
				if (cancelled) return
				// Inject straight into the cached lobby list so activeLobbyId
				// resolves to the new lobby on the next render — no "override"
				// state to leak past lobby closure.
				qc.setQueryData<LobbySnapshot[]>(["party", game, "lobbies"], old =>
					mergeLobby(old, lobby)
				)
			} catch (err) {
				toast.error(err instanceof Error ? err.message : "Could not join from invite link")
			} finally {
				const next = new URLSearchParams(searchParams)
				next.delete("join")
				setSearchParams(next, { replace: true })
			}
		})()
		return () => {
			cancelled = true
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams.get("join")])

	return (
		<Container>
			<Header title={`${gameLabel} Multiplayer`} />
			<Body>
				<SetupInstructions instructions={instructions} gameLabel={gameLabel} />
				<div className="mb-4">
					<CabinetPresenceChip game={game} gameLabel={gameLabel} />
				</div>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<LobbiesPane game={game} gameLabel={gameLabel} currentLobbyId={activeLobbyId} />
					<CurrentLobbyPane game={game} gameLabel={gameLabel} lobby={currentLobby} />
				</div>
			</Body>
		</Container>
	)
}

function mergeLobby(old: LobbySnapshot[] | undefined, fresh: LobbySnapshot): LobbySnapshot[] {
	const list = old ?? []
	const idx = list.findIndex(l => l.id === fresh.id)
	if (idx < 0) return [...list, fresh]
	const next = list.slice()
	next[idx] = fresh
	return next
}
