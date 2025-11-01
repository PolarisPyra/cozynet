import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useLimitedTickets, useUnlimitedTickets } from "@/hooks/chunithm"

const TicketManagement = () => {
	const { mutate: enableUnlimited, isPending: isEnablingUnlimited } = useUnlimitedTickets()
	const { mutate: disableUnlimited, isPending: isDisablingUnlimited } = useLimitedTickets()

	return (
		<div className="bg-card rounded-sm p-4 md:p-6">
			<h2 className="text-primary mb-4 text-xl font-semibold">Manage Tickets</h2>
			<div className="flex gap-4">
				<Button
					onClick={() => {
						enableUnlimited(undefined, {
							onSuccess: () => toast.success("Tickets enabled successfully!"),
							onError: () => toast.error("Failed to enable tickets")
						})
					}}
					variant="custom"
					disabled={isEnablingUnlimited}
				>
					{isEnablingUnlimited ? "Enabling..." : "Enable Unlimited Tickets"}
				</Button>
				<Button
					onClick={() => {
						disableUnlimited(undefined, {
							onSuccess: () => toast.success("Tickets disabled successfully!"),
							onError: () => toast.error("Failed to disable tickets")
						})
					}}
					variant="custom"
					disabled={isDisablingUnlimited}
				>
					{isDisablingUnlimited ? "Disabling..." : "Disable Unlimited Tickets"}
				</Button>
			</div>
		</div>
	)
}

export default TicketManagement
