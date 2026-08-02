import Header from "@/app/shared/components/common/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/shared/components/ui/card"
import { useAuth } from "@/app/shared/hooks/auth/use-auth"

import { ChangePassword } from "../components/account/change-password"
import { ChangeUsername } from "../components/account/change-username"

const GeneralPage = () => {
	const { user } = useAuth()
	if (!user) return null

	return (
		<div className="relative min-h-0 flex-1 overflow-auto">
			<Header title="General" />
			<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
				<Card className="gap-0 rounded-md py-0 shadow-none">
					<CardHeader className="border-border flex items-center gap-2 border-b px-4 py-3 sm:px-6">
						<div>
							<CardTitle className="text-lg">Account Settings</CardTitle>
							<p className="text-muted-foreground mt-1 text-sm">Manage your username and password.</p>
						</div>
					</CardHeader>
					<CardContent className="space-y-4 p-4 sm:p-6">
						<div className="space-y-2">
							<label className="text-muted-foreground text-sm font-medium">Username</label>
							<ChangeUsername username={user.username} />
						</div>
						<div className="space-y-2">
							<label className="text-muted-foreground text-sm font-medium">Password</label>
							<ChangePassword />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

export default GeneralPage
