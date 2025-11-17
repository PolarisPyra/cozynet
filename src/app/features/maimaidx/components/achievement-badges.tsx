import { getMaimaiDxComboStatus, getMaimaiDxSyncStatus } from "@/app/shared/utils/maimai"

interface MaimaiAchievementBadgesProps {
	comboStatus?: number
	syncStatus?: number
}

export const MaimaiAchievementBadges = function ({ comboStatus, syncStatus }: MaimaiAchievementBadgesProps) {
	const comboStatusText = getMaimaiDxComboStatus(comboStatus)
	const syncStatusText = getMaimaiDxSyncStatus(syncStatus)

	return (
		<div className="flex items-center gap-1">
			<div className="flex h-8 items-center justify-start md:h-10">
				{comboStatus && comboStatus !== 0 ? (
					<div className="rounded bg-yellow-600 px-2 py-1 text-xs font-bold text-white">{comboStatusText}</div>
				) : (
					<div className="h-2 w-16 rounded-sm bg-gray-300/20" />
				)}
			</div>

			<div className="flex h-8 items-center justify-start md:h-10">
				{syncStatusText ? (
					<div className="rounded bg-purple-600 px-2 py-1 text-xs font-bold text-white">{syncStatusText}</div>
				) : (
					<div className="h-2 w-16 rounded-sm bg-gray-300/20" />
				)}
			</div>
		</div>
	)
}

export default MaimaiAchievementBadges
