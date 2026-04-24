import { useEffect, useState } from "react"

import { useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import { CabinetPresenceChip } from "@/app/shared/components/multiplayer/CabinetPresenceChip"
import { CurrentLobbyPane } from "@/app/shared/components/multiplayer/CurrentLobbyPane"
import { LobbiesPane } from "@/app/shared/components/multiplayer/LobbiesPane"
import { partyJoinLobby, useCurrentLobby, useLobbyRealtime, usePartyLobbies } from "@/app/shared/hooks/use-party"
import { useAuth } from "@/app/shared/hooks/auth/use-auth"
import Header from "@/app/shared/components/common/header"
import { Body, Container } from "@/app/shared/pages/layout/layout"

interface MultiplayerPageProps {
	/** Artemis game tag — must match the bridge mod's ``game`` handshake param. */
	game: string
	/** Human label — "ONGEKI", "Chunithm", etc. Used in headings and toast copy. */
	gameLabel: string
}

/**
 * Shared, game-parametrized multiplayer page. Per-title wrappers under
 * ``app/features/<title>/pages/multiplayer.tsx`` pass their own game tag.
 */
export function MultiplayerPage({ game, gameLabel }: MultiplayerPageProps) {
	const [searchParams, setSearchParams] = useSearchParams()
	const auth = useAuth()
	const qc = useQueryClient()
	const { data: lobbies = [] } = usePartyLobbies(game)

	const myLobbyId =
		auth.user?.userId != null
			? lobbies.find(l => l.seats.some(s => s.user_id === auth.user!.userId))?.id ?? null
			: null
	const [overrideLobbyId, setOverrideLobbyId] = useState<string | null>(null)
	const activeLobbyId = overrideLobbyId ?? myLobbyId

	const currentLobby = useCurrentLobby(game, activeLobbyId)
	useLobbyRealtime({ game, lobbyId: activeLobbyId })

	useEffect(() => {
		const joinId = searchParams.get("join")
		if (!joinId || activeLobbyId === joinId) return
		let cancelled = false
		;(async () => {
			try {
				await partyJoinLobby(game, joinId)
				if (cancelled) return
				qc.invalidateQueries({ queryKey: ["party", game, "lobbies"] })
				setOverrideLobbyId(joinId)
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
				<div className="mb-4">
					<CabinetPresenceChip game={game} gameLabel={gameLabel} />
				</div>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<LobbiesPane
						game={game}
						gameLabel={gameLabel}
						currentLobbyId={activeLobbyId}
						onEnterLobby={setOverrideLobbyId}
					/>
					<CurrentLobbyPane
						game={game}
						gameLabel={gameLabel}
						lobby={currentLobby}
						onLeft={() => setOverrideLobbyId(null)}
					/>
				</div>
			</Body>
		</Container>
	)
}
