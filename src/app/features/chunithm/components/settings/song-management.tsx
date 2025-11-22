import { toast } from "sonner"

import { Button } from "@/app/shared/components/ui/button"
import { useLockSongs, useUnlockAllSongs } from "@/app/features/chunithm/hooks"

const SongManagement = () => {
	const { mutate: unlockSongs, isPending: isUnlockingSongs } = useUnlockAllSongs()
	const { mutate: lockSongs, isPending: isLockingSongs } = useLockSongs()
	return (
		<div className="bg-card rounded-sm p-4 md:p-6">
			<h2 className="text-primary mb-4 text-xl font-semibold">Manage Songs</h2>
			<div className="flex gap-4">
				<Button
					onClick={() => {
						unlockSongs(undefined, {
							onSuccess: () => {
								toast.success("Songs unlocked successfully!")
							},
							onError: () => {
								toast.error("Failed to unlock songs")
							}
						})
					}}
					variant="outline"
					size="sm"
					disabled={isUnlockingSongs}
				>
					{isUnlockingSongs ? "Unlocking..." : "Unlock All Songs"}
				</Button>
				<Button
					onClick={() => {
						lockSongs(undefined, {
							onSuccess: () => {
								toast.success("Songs locked successfully!")
							},
							onError: () => {
								toast.error("Failed to lock songs")
							}
						})
					}}
					variant="outline"
					size="sm"
					disabled={isLockingSongs}
				>
					{isLockingSongs ? "Locking..." : "Lock Songs"}
				</Button>
			</div>
		</div>
	)
}

export default SongManagement
