import { Nameplate } from "@/app/features/ongeki/components/userbox/nameplate"
import { useOngekiVersion } from "@/app/features/ongeki/hooks"
import Header from "@/app/shared/components/common/header"
import { UserboxPageShell, UserboxSetupRequired } from "@/app/shared/components/userbox/userbox-page-shell"
import { Container } from "@/app/shared/pages/layout/layout"

const OngekiUserbox = () => {
	const version = useOngekiVersion()

	if (!version) {
		return (
			<Container>
				<Header title="Userbox" />
				<UserboxSetupRequired>Please set your O.N.G.E.K.I. version in settings first.</UserboxSetupRequired>
			</Container>
		)
	}

	return (
		<Container>
			<Header title="Userbox" />
			<UserboxPageShell
				toolbar={
					<div className="border-border/70 bg-card/70 rounded-md border p-2 shadow-sm">
						<div className="bg-primary text-primary-foreground flex h-10 items-center justify-center rounded-sm px-3 text-sm font-semibold">
							Nameplate
						</div>
					</div>
				}
			>
				<Nameplate />
			</UserboxPageShell>
		</Container>
	)
}

export default OngekiUserbox
