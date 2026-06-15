import Header from "@/app/shared/components/common/header"
import { useAuth } from "@/app/shared/hooks/auth/use-auth"

import { ArcadeLocation } from "../components/account/arcade-location"
import { ArcadeName } from "../components/account/arcade-name"
import { ChangePassword } from "../components/account/change-password"
import { ChangeUsername } from "../components/account/change-username"

const Account = () => {
	const { user } = useAuth()
	if (!user) return null

	return (
		<div className="relative min-h-0 flex-1 overflow-auto">
			<Header title="Account Dashboard" />
			<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
				<div className="bg-card text-card-foreground space-y-6 rounded-sm p-6">
					<div className="border-border flex items-center gap-2 border-b pb-3">
						<h2 className="text-lg font-semibold">Account Settings</h2>
					</div>
					<div className="space-y-4">
						<div className="space-y-2">
							<label className="text-muted-foreground text-sm font-medium">Username</label>
							<ChangeUsername username={user.username} />
						</div>
						<div className="space-y-2">
							<label className="text-muted-foreground text-sm font-medium">Password</label>
							<ChangePassword />
						</div>
					</div>
				</div>
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
