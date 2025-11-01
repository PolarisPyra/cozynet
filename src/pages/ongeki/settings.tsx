import Header from "@/components/common/header"
import CardManagement from "@/components/settings/ongeki/card-managment"
import ItemManagement from "@/components/settings/ongeki/item-management"
import JsonExport from "@/components/settings/ongeki/json-export"
import OngekiVersionManager from "@/components/settings/ongeki/version-management"
import { Body, Container } from "@/pages/layout/layout"

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
