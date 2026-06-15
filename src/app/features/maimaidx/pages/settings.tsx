import Header from "@/app/shared/components/common/header"
import { MaimaiDxVersionManager } from "@/app/features/maimaidx/components/settings/version-management"

export function MaimaiDxSettings() {
	return (
		<div className="relative min-h-0 flex-1 overflow-auto">
			<Header title={"Maimai DX Settings"} />
			<div className="mb-4 px-4 pb-4 sm:py-0">
				<MaimaiDxVersionManager />
			</div>
		</div>
	)
}
