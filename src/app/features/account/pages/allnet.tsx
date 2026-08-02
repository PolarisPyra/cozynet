import Header from "@/app/shared/components/common/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/shared/components/ui/card"

import { ArcadeLocation } from "../components/account/arcade-location"
import { ArcadeName } from "../components/account/arcade-name"

const AllnetPage = () => (
	<div className="relative min-h-0 flex-1 overflow-auto">
		<Header title="ALLNET" />
		<div className="mb-4 space-y-4 p-4 sm:px-6 sm:py-0">
			<Card className="gap-0 rounded-md py-0 shadow-none">
				<CardHeader className="border-border flex items-center gap-2 border-b px-4 py-3 sm:px-6">
					<div>
						<CardTitle className="text-lg">Change Arcade Name</CardTitle>
						<p className="text-muted-foreground mt-1 text-sm">Select an arcade to update its name or nickname.</p>
					</div>
				</CardHeader>
				<CardContent className="p-4 sm:p-6">
					<ArcadeName hideHeader />
				</CardContent>
			</Card>
			<Card className="gap-0 rounded-md py-0 shadow-none">
				<CardHeader className="border-border flex items-center gap-2 border-b px-4 py-3 sm:px-6">
					<div>
						<CardTitle className="text-lg">Change Arcade Location</CardTitle>
						<p className="text-muted-foreground mt-1 text-sm">Select an arcade to configure its location.</p>
					</div>
				</CardHeader>
				<CardContent className="p-4 sm:p-6">
					<ArcadeLocation hideHeader />
				</CardContent>
			</Card>
		</div>
	</div>
)

export default AllnetPage
