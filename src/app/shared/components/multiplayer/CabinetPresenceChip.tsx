import { formatVersionLong } from "@/app/shared/hooks/format-version"
import { usePartyPresence } from "@/app/shared/hooks/use-party"

export function CabinetPresenceChip({ game, gameLabel }: { game: string; gameLabel: string }) {
	const { data: presence, isLoading } = usePartyPresence(game)
	if (isLoading) {
		return (
			<div className="text-muted-foreground flex items-center gap-2 text-sm">
				<span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gray-400" />
				Checking cabinet...
			</div>
		)
	}
	if (!presence?.at_cabinet) {
		return (
			<div className="text-muted-foreground flex items-center gap-2 text-sm">
				<span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
				Not at a cabinet — swipe your card to be ready
			</div>
		)
	}
	return (
		<div className="flex items-center gap-2 text-sm">
			<span className="inline-block h-2 w-2 rounded-full bg-green-500" />
			<span className="font-medium">At cabinet</span>
			<span className="font-mono">{presence.keychip}</span>
			{presence.game_version && (
				<span className="text-muted-foreground" title={presence.game_version}>
					({formatVersionLong(presence.game_version, gameLabel)})
				</span>
			)}
		</div>
	)
}
