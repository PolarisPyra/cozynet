import Header from "@/app/shared/components/common/header"
import { Card, CardContent } from "@/app/shared/components/ui/card"

import { ArcadeLocation } from "../components/account/arcade-location"
import { ArcadeName } from "../components/account/arcade-name"

const AllnetPage = () => (
	<div className="relative min-h-0 flex-1 overflow-auto">
		<Header title="ALLNET" />
		<div className="mb-4 space-y-4 p-4 sm:px-6 sm:py-0">
			<Card className="gap-0 rounded-md py-0 shadow-none">
				<CardContent className="p-4 sm:p-6">
					<ArcadeName />
				</CardContent>
			</Card>
			<Card className="gap-0 rounded-md py-0 shadow-none">
				<CardContent className="p-4 sm:p-6">
					<ArcadeLocation />
				</CardContent>
			</Card>
		</div>
	</div>
)

export default AllnetPage
