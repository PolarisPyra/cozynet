import Header from "@/app/shared/components/common/header"
import ArcadeLocation from "@/app/shared/components/settings/arcade-location"
import ArcadeName from "@/app/shared/components/settings/arcade-name"

const Account = () => {
	return (
		<div className="relative flex-1 overflow-auto">
			<Header title="Account Dashboard" />
			<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
				<div className="bg-card text-card-foreground space-y-6 rounded-sm p-6">
					<div className="border-border flex items-center gap-2 border-b pb-3">
						<h2 className="text-lg font-semibold">Arcade Settings</h2>
					</div>
					<ArcadeName />
					<ArcadeLocation />
				</div>
			</div>
		</div>
	)
}

export default Account
