import { useState } from "react"

import { ChevronDown } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/app/shared/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/app/shared/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/shared/components/ui/popover"
import { useCreateTeam, useTeams, useUpdateTeam } from "@/app/features/chunithm/hooks"

const TeamManagement = () => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const [selectedTeam, setSelectedTeam] = useState<string>("Select Team")
	const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
	const [newTeamName, setNewTeamName] = useState("")

	const { data: teams } = useTeams()
	const { mutate: updateTeamMutation, isPending: isUpdatingTeam } = useUpdateTeam()
	const { mutate: createTeamMutation, isPending: isCreatingTeam } = useCreateTeam()

	const handleTeamSelect = (teamId: number, teamName: string) => {
		setSelectedTeam(teamName)
		setSelectedTeamId(teamId)
		setIsDropdownOpen(false)
	}

	const handleUpdateTeam = () => {
		if (selectedTeamId === null) {
			toast.error("Please select a team first")
			return
		}

		updateTeamMutation(selectedTeamId, {
			onSuccess: () => toast.success("Team updated successfully!"),
			onError: () => toast.error("Failed to update team")
		})
	}

	const handleCreateTeam = () => {
		if (!newTeamName.trim()) {
			toast.error("Please enter a team name")
			return
		}

		createTeamMutation(newTeamName.trim(), {
			onSuccess: () => toast.success("Team created successfully!"),
			onError: () => toast.error("Failed to create team")
		})
	}

	return (
		<div className="bg-card rounded-sm p-4 md:p-6">
			<h2 className="text-primary mb-4 text-xl font-semibold">Select Team</h2>

			<div className="mb-4">
				<Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={isDropdownOpen}
							className="w-full cursor-pointer justify-between"
						>
							<span className="text-primary">{selectedTeam}</span>
							<ChevronDown className="opacity-50" />
						</Button>
					</PopoverTrigger>

					<PopoverContent align="start" className="w-full p-0">
						<Command>
							<CommandInput placeholder="Search teams..." />
							<CommandList>
								<CommandEmpty>No team found.</CommandEmpty>
								<CommandGroup>
									{teams?.map(team => (
										<CommandItem
											className="cursor-pointer"
											key={team.id}
											value={`${team.id}`}
											onSelect={(val: string) => {
												const id = Number(val)
												const t = teams.find(x => x.id === id)
												if (t) {
													handleTeamSelect(t.id, t.teamName)
												}
											}}
										>
											<span className="text-primary">{team.teamName}</span>
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			</div>

			<Button onClick={handleUpdateTeam} variant="outline" size="sm" disabled={isUpdatingTeam || selectedTeamId === null}>
				{isUpdatingTeam ? "Updating..." : "Update Team"}
			</Button>

			<div className="mt-8">
				<h2 className="text-primary mb-4 text-xl font-semibold">Create New Team</h2>
				<div className="mb-4">
					<input
						type="text"
						value={newTeamName}
						onChange={e => setNewTeamName(e.target.value)}
						placeholder="Enter team name"
						className="bg-background text-foreground placeholder:text-muted-foreground border-input w-full rounded-sm border p-3"
					/>
				</div>
				<Button onClick={handleCreateTeam} variant="outline" size="sm" disabled={isCreatingTeam || !newTeamName.trim()}>
					{isCreatingTeam ? "Creating..." : "Create Team"}
				</Button>
			</div>
		</div>
	)
}

export default TeamManagement
