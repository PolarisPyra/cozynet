import { toast } from "sonner"

import { usePopnForceUnlockSongs, useUpdatePopnForceUnlockSongs } from "@/app/features/popn/hooks"
import { Switch } from "@/app/shared/components/ui/switch"

export default function ForceUnlockSongs() {
	const { data, isLoading } = usePopnForceUnlockSongs()
	const { mutate: updateForceUnlockSongs, isPending } = useUpdatePopnForceUnlockSongs()

	return (
		<div className="bg-card rounded-sm p-4 md:p-6">
			<h2 className="text-primary mb-4 text-xl font-semibold">Manage Songs</h2>
			<div className="flex items-center justify-between gap-4">
				<p className="font-medium">Force unlock all songs</p>
				<Switch
					className="scale-150 cursor-pointer"
					checked={data?.forceUnlockSongs ?? false}
					disabled={isLoading || isPending}
					onCheckedChange={enabled => {
						updateForceUnlockSongs(enabled, {
							onSuccess: () => toast.success(enabled ? "All songs unlocked" : "Song force unlock disabled"),
							onError: () => toast.error("Failed to update song force unlock")
						})
					}}
					aria-label="Force unlock all Pop'n Music songs"
				/>
			</div>
		</div>
	)
}
