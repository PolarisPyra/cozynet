import { LoaderCircle } from "lucide-react"

import Header from "@/app/shared/components/common/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/shared/components/ui/card"
import { useCurrentArcade } from "@/app/shared/hooks/users"

const CabinetsPage = () => {
	const { data: currentArcades, isLoading } = useCurrentArcade()

	return (
		<div className="relative min-h-0 flex-1 overflow-auto">
			<Header title="Cabinets" />
			<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
				<Card className="gap-0 rounded-md py-0 shadow-none">
					<CardHeader className="border-border flex items-center gap-2 border-b px-4 py-3 sm:px-6">
						<div>
							<CardTitle className="text-lg">My Cabinets</CardTitle>
							<p className="text-muted-foreground mt-1 text-sm">View the cabinets assigned to your current account.</p>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						{isLoading ? (
							<div className="text-muted-foreground flex items-center gap-2 p-6 text-sm">
								<LoaderCircle className="h-4 w-4 animate-spin" /> Loading cabinets...
							</div>
						) : currentArcades && currentArcades.length > 0 ? (
							<div className="overflow-x-auto">
								<table className="w-full text-left text-sm">
									<thead className="bg-muted/40 text-muted-foreground border-b text-xs tracking-wide uppercase">
										<tr>
											<th className="px-4 py-3 font-semibold sm:px-6">Name</th>
											<th className="px-4 py-3 font-semibold sm:px-6">PCB ID</th>
										</tr>
									</thead>
									<tbody className="divide-y">
										{currentArcades.map(machine => (
											<tr key={machine.id} className="hover:bg-muted/30 transition-colors">
												<td className="px-4 py-4 font-medium sm:px-6">
													{machine.name || machine.nickname || "Assigned Cabinet"}
												</td>
												<td className="px-4 py-4 sm:px-6">
													<code className="text-xs break-all sm:text-sm">{machine.pcbid || "Not assigned"}</code>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<p className="text-muted-foreground p-6 text-center text-sm">No cabinets are assigned to your account.</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

export default CabinetsPage
