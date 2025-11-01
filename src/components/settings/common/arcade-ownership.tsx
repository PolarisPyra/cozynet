import { useState } from "react"

import { ChevronsUpDown } from "lucide-react"
import { toast } from "sonner"

import Spinner from "@/components/common/spinner"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useArcades, useUpdateArcadeOwnership, useUsers } from "@/hooks/users/use-arcade"

const ArcadeOwnership = () => {
	const { data: arcades, isLoading: isLoadingArcades } = useArcades()
	const { data: users, isLoading: isLoadingUsers } = useUsers()

	const { mutate: updateArcade, isPending } = useUpdateArcadeOwnership()

	const [selectedArcade, setSelectedArcade] = useState<string>("")
	const [selectedUser, setSelectedUser] = useState<string>("")
	const [openArcade, setOpenArcade] = useState(false)
	const [openUser, setOpenUser] = useState(false)

	const handleSubmit = () => {
		if (selectedArcade && selectedUser) {
			updateArcade(
				{ arcade: parseInt(selectedArcade), user: parseInt(selectedUser) },
				{
					onSuccess: () => {
						toast.success("Arcade Ownership updated")
					},
					onError: error => {
						toast.error("Failed to update ownership")
						console.error("Error updating ownership:", error)
					}
				}
			)
		}
	}

	if (isLoadingArcades || isLoadingUsers) {
		return (
			<div>
				<Spinner size={24} />
			</div>
		)
	}

	return (
		<div className="bg-card rounded-sm">
			<h2 className="text-primary mb-2 text-xl font-semibold">Arcade ownership settings</h2>
			<div className="text-primary mb-4 text-sm">Changes who owns a specific arcade</div>
			<div className="mb-4">
				<label className="text-primary block pb-2 text-sm font-medium">Select Arcade</label>
				<Popover open={openArcade} onOpenChange={setOpenArcade}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={openArcade}
							className={`inline-flex w-80 items-center justify-between gap-2 hover:cursor-pointer`}
						>
							{selectedArcade
								? arcades?.find(a => `${a.arcade}` === selectedArcade)?.name || `Arcade #${selectedArcade}`
								: "Select Arcade..."}
							<ChevronsUpDown className="opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-80 p-0">
						<Command>
							<CommandInput placeholder="Search arcades..." />
							<CommandList>
								<CommandEmpty>No arcade found.</CommandEmpty>
								<CommandGroup>
									{arcades?.map(arcade => (
										<CommandItem
											key={arcade.arcade}
											value={`${arcade.name} ${arcade.user}`}
											className="w-full cursor-pointer justify-between"
											onSelect={() => {
												setSelectedArcade(`${arcade.arcade}`)
												setOpenArcade(false)
											}}
										>
											<div>
												<span className="text-primary font-medium">
													{arcade.name} {arcade.serial}
												</span>
											</div>
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			</div>

			<div className="mb-4">
				<label className="text-primary block pb-2 text-sm font-medium">Select User</label>
				<Popover open={openUser} onOpenChange={setOpenUser}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={openUser}
							className={`inline-flex w-80 items-center justify-between gap-2 hover:cursor-pointer`}
						>
							{selectedUser
								? users?.find(u => `${u.id}` === selectedUser)?.username || `User #${selectedUser}`
								: "Select User..."}
							<ChevronsUpDown className="opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-80 p-0">
						<Command>
							<CommandInput placeholder="Search users..." />
							<CommandList>
								<CommandEmpty>No user found.</CommandEmpty>
								<CommandGroup>
									{users?.map(user => (
										<CommandItem
											key={user.id}
											value={`${user.username || `User #${user.id}`} ${user.access_code || ""}`}
											className="w-full cursor-pointer justify-between"
											onSelect={() => {
												setSelectedUser(`${user.id}`)
												setOpenUser(false)
											}}
										>
											<div>
												<span className="text-primary font-medium">
													{`${user.username || `User #${user.id}`}${user.access_code ? ` (${user.access_code})` : ""}`}{" "}
												</span>
											</div>
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			</div>

			<Button
				onClick={handleSubmit}
				variant="custom"
				disabled={isPending || !selectedArcade || !selectedUser}
				className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:border-muted/50 disabled:bg-muted disabled:text-muted-foreground w-full items-center justify-center gap-2 rounded-md border border-transparent p-3 font-semibold transition-colors disabled:cursor-not-allowed"
				aria-busy={isPending}
			>
				{isPending ? (
					<>
						<Spinner size={16} className="mr-2" />
						<span>Updating...</span>
					</>
				) : (
					<span>Update</span>
				)}
			</Button>
		</div>
	)
}

export default ArcadeOwnership
