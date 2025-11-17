import Header from "@/app/shared/components/common/header"
import CardManagement from "@/app/features/ongeki/components/settings/card-managment"
import ItemManagement from "@/app/features/ongeki/components/settings/item-management"
import JsonExport from "@/app/features/ongeki/components/settings/json-export"
import OngekiVersionManager from "@/app/features/ongeki/components/settings/version-management"
import { Body, Container } from "@/app/shared/pages/layout/layout"

export function OngekiSettingsPage() {
	return (
		<Container>
			<Header title="Ongeki Settings" />
			<Body className="space-y-6 py-6 sm:py-8">
				<OngekiVersionManager />
				<CardManagement />
				<ItemManagement />
				<JsonExport />
			</Body>
		</Container>
	)
}
