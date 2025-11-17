import { Handshake, Skull, UserMinus, UserPlus } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/app/shared/components/ui/avatar"
import { Badge } from "@/app/shared/components/ui/badge"
import { Button } from "@/app/shared/components/ui/button"

interface RivalUser {
	id: number
	username: string
	isMutual: boolean
}

interface RivalInfoCardProps {
	user: RivalUser
	isRival: boolean
	onAddRival: (id: number) => void
	onRemoveRival: (id: number) => void
	rivalCount: number
}

export function RivalInfoCard({ user, isRival, onAddRival, onRemoveRival, rivalCount }: RivalInfoCardProps) {
	const handleAction = () => {
		if (isRival) {
			onRemoveRival(user.id)
		} else {
			onAddRival(user.id)
		}
	}

	return (
		<div className="bg-card border-border flex flex-col gap-3 rounded-sm border p-4 shadow-sm transition-shadow hover:shadow-md">
			<div className="flex items-start gap-3">
				<Avatar className="h-12 w-12 flex-shrink-0">
					<AvatarImage src="" alt={user.username} />
					<AvatarFallback className="text-base font-bold">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
				</Avatar>

				<div className="min-w-0 flex-1">
					<h3 className="text-foreground mb-2 truncate text-base leading-tight font-bold">{user.username}</h3>
					<div className="flex min-h-[24px] flex-wrap items-center gap-2">
						{user.isMutual && (
							<Badge variant="secondary" className="h-6 rounded-sm">
								<Handshake className="mr-1 h-3.5 w-3.5" />
								<span className="text-xs">Mutual</span>
							</Badge>
						)}
						{isRival && (
							<Badge variant="secondary" className="h-6 rounded-sm">
								<Skull className="mr-1 h-3.5 w-3.5" />
								<span className="text-xs">Rival</span>
							</Badge>
						)}
					</div>
				</div>
			</div>
			<div className="border-border/50 flex justify-end border-t pt-3">
				<Button
					size="sm"
					variant={isRival ? "destructive" : "default"}
					onClick={handleAction}
					className="min-w-[100px] cursor-pointer text-sm"
					disabled={!isRival && rivalCount >= 3}
				>
					{isRival ? (
						<>
							<UserMinus className="mr-1.5 h-4 w-4" />
							<span>Remove</span>
						</>
					) : (
						<>
							<UserPlus className="mr-1.5 h-4 w-4" />
							<span>Add Rival</span>
						</>
					)}
				</Button>
			</div>
		</div>
	)
}
