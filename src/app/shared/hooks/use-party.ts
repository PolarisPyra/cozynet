/**
 * Game-scoped hooks for the multiplayer lobby page. Every hook takes a
 * ``game`` tag (e.g. "ongeki", "chuni") so the same components can back
 * multiplayer UIs for different Artemis titles.
 */
import { useEffect, useMemo, useRef, useState } from "react"

import { useQuery, useQueryClient } from "@tanstack/react-query"

export interface LobbySeat {
	seat: number
	user_id: number
	username: string
	attached: boolean
}

export interface LobbySnapshot {
	id: string
	game: string
	host_user_id: number
	game_version: string
	created_at: number
	seats: LobbySeat[]
}

export interface Presence {
	at_cabinet: boolean
	game: string
	keychip?: string
	game_version?: string
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
	const res = await fetch(url, { credentials: "include", ...init })
	const text = await res.text()
	let body: any = undefined
	if (text) {
		try {
			body = JSON.parse(text)
		} catch {
			body = text
		}
	}
	if (!res.ok) {
		const msg =
			(body && typeof body === "object" && (body.error || body.message)) || `Request failed (${res.status})`
		throw new Error(typeof msg === "string" ? msg : "Request failed")
	}
	return body as T
}

const base = (game: string) => `/api/party/${encodeURIComponent(game)}`

export function usePartyLobbies(game: string) {
	return useQuery<LobbySnapshot[]>({
		queryKey: ["party", game, "lobbies"],
		queryFn: () => fetchJson<LobbySnapshot[]>(`${base(game)}/lobbies`),
		refetchInterval: 15_000
	})
}

export function usePartyPresence(game: string) {
	return useQuery<Presence>({
		queryKey: ["party", game, "presence"],
		queryFn: () => fetchJson<Presence>(`${base(game)}/presence`),
		refetchInterval: 30_000
	})
}

export function useCurrentLobby(game: string, lobbyId: string | null): LobbySnapshot | undefined {
	const { data: lobbies } = usePartyLobbies(game)
	return useMemo(() => (lobbyId ? lobbies?.find(l => l.id === lobbyId) : undefined), [lobbies, lobbyId])
}

// --- Mutations ---

export async function partyCreateLobby(game: string): Promise<LobbySnapshot> {
	return fetchJson<LobbySnapshot>(`${base(game)}/lobbies`, { method: "POST" })
}

export async function partyJoinLobby(game: string, lobbyId: string): Promise<LobbySnapshot> {
	return fetchJson<LobbySnapshot>(`${base(game)}/lobbies/${encodeURIComponent(lobbyId)}/join`, {
		method: "POST"
	})
}

export async function partyLeaveLobby(game: string, lobbyId: string): Promise<void> {
	await fetchJson<{ ok: boolean }>(`${base(game)}/lobbies/${encodeURIComponent(lobbyId)}/leave`, {
		method: "DELETE"
	})
}

export async function partyKickMember(game: string, lobbyId: string, seat: number): Promise<void> {
	await fetchJson<{ ok: boolean }>(`${base(game)}/lobbies/${encodeURIComponent(lobbyId)}/kick`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ seat })
	})
}

// --- Realtime WebSocket ---

interface RealtimeTokenResponse {
	token: string
	expires_at: number
	scope: string
	game: string
}

interface UseLobbyRealtimeOptions {
	game: string
	lobbyId: string | null
}

export function useLobbyRealtime({ game, lobbyId }: UseLobbyRealtimeOptions) {
	const qc = useQueryClient()
	const wsRef = useRef<WebSocket | null>(null)
	const [connected, setConnected] = useState(false)

	useEffect(() => {
		let cancelled = false
		let ws: WebSocket | null = null

		const open = async () => {
			try {
				const tokenResp = await fetchJson<RealtimeTokenResponse>(
					`${base(game)}/realtime-token`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(lobbyId ? { lobby_id: lobbyId } : {})
					}
				)
				if (cancelled) return
				const wsUrl = buildWsUrl(game, tokenResp.token)
				ws = new WebSocket(wsUrl)
				wsRef.current = ws
				ws.onopen = () => setConnected(true)
				ws.onclose = () => setConnected(false)
				ws.onerror = () => setConnected(false)
				ws.onmessage = event => {
					try {
						const msg = JSON.parse(event.data)
						handleEvent(game, msg, qc)
					} catch {
						// ignore malformed frames
					}
				}
			} catch {
				// token mint failed; silently fall back to polling.
			}
		}

		open()

		return () => {
			cancelled = true
			if (ws && ws.readyState !== WebSocket.CLOSED) ws.close()
			wsRef.current = null
			setConnected(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [game, lobbyId])

	return { connected }
}

function buildWsUrl(game: string, token: string): string {
	const envUrl = (typeof env !== "undefined" && (env as any)?.ARTEMIS_WS_URL) || undefined
	const base = envUrl || `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}`
	// Passing game + token as query params: browsers can't set headers on WS.
	// Artemis's route_ws accepts both.
	return `${base.replace(/\/$/, "")}/ws/party?game=${encodeURIComponent(game)}&token=${encodeURIComponent(token)}`
}

function handleEvent(game: string, msg: any, qc: ReturnType<typeof useQueryClient>) {
	if (!msg || typeof msg !== "object") return
	const type = msg.type
	if (
		type === "lobby_created" ||
		type === "lobby_updated" ||
		type === "lobby_closed" ||
		type === "member_joined" ||
		type === "member_left" ||
		type === "cabinet_attached" ||
		type === "cabinet_detached" ||
		type === "snapshot"
	) {
		qc.invalidateQueries({ queryKey: ["party", game, "lobbies"] })
	}
	if (type === "presence") {
		qc.invalidateQueries({ queryKey: ["party", game, "presence"] })
	}
}
