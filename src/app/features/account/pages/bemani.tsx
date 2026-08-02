import Header from "@/app/shared/components/common/header"

import { CardManagement } from "../components/account/card-management"

const BemaniPage = () => (
	<div className="relative min-h-0 flex-1 overflow-auto">
		<Header title="BEMANI" />
		<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
			<CardManagement />
		</div>
	</div>
)

export default BemaniPage
