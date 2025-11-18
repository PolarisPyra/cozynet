import { Character } from "@/app/features/ongeki/components/userbox/character"
import { Nameplate } from "@/app/features/ongeki/components/userbox/nameplate"
import { useOngekiVersion } from "@/app/features/ongeki/hooks"
import Header from "@/app/shared/components/common/header"
import { Body, Container } from "@/app/shared/pages/layout/layout"

const OngekiUserbox = () => {
	const version = useOngekiVersion()

	if (!version) {
		return (
			<Container>
				<Header title={"Userbox"} />
				<Body className="flex items-center justify-center">
					<p className="text-primary">Please set your O.N.G.E.K.I. version in settings first</p>
				</Body>
			</Container>
		)
	}

	return (
		<Container>
			<Header title={"Userbox"} />
			<Body className="mx-auto flex max-w-7xl flex-col gap-4">
				<div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					<Nameplate />
					<Character />
				</div>
			</Body>
		</Container>
	)
}

export default OngekiUserbox

