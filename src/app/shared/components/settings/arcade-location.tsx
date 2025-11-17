import { useMemo, useState } from "react"

import { ChevronsUpDown, CircleAlert } from "lucide-react"
import { toast } from "sonner"

import Spinner from "@/app/shared/components/common/spinner"
import { Button } from "@/app/shared/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/app/shared/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/shared/components/ui/popover"
import { useCurrentArcade, useUpdateArcadeLocation } from "@/app/shared/hooks/users"
import localeData from "@/app/shared/utils/locale.json"

type State = {
	state: string
	regionId: number
}

type Country = string

const getUniqueCountries = (): Country[] => {
	const uniqueCountries = new Set<string>()
	for (const region of localeData.region0) {
		const country = region[0] as string
		if (country) uniqueCountries.add(country)
	}
	return Array.from(uniqueCountries).sort()
}

const getStatesForCountry = (country: string | null): State[] => {
	if (!country) return []
	const result: State[] = []
	for (const region of localeData.region0) {
		const regionCountry = region[0] as string
		if (regionCountry === country) {
			result.push({ state: region[2] as string, regionId: region[1] as number })
		}
	}
	return result.sort((a, b) => a.state.localeCompare(b.state))
}

const ArcadeLocation = () => {
	const { data: currentArcade, isLoading } = useCurrentArcade()
	const { mutate: updateArcadeLocation, isPending } = useUpdateArcadeLocation()

	const [selectedArcadeIndex, setSelectedArcadeIndex] = useState<number | null>(null)
	const [openArcade, setOpenArcade] = useState(false)
	const [openCountry, setOpenCountry] = useState(false)
	const [openState, setOpenState] = useState(false)
	const [selectedCountry, setSelectedCountry] = useState<string>("")
	const [selectedState, setSelectedState] = useState<string>("")

	const countries = useMemo(() => getUniqueCountries(), [])
	const states = useMemo(() => getStatesForCountry(selectedCountry || null), [selectedCountry])

	const selectedArcade = selectedArcadeIndex !== null ? currentArcade?.[selectedArcadeIndex] : null

	const handleSubmit = () => {
		if (!selectedCountry || !selectedState || !selectedArcade) return

		const selectedStateObj = states.find(state => state.state === selectedState)
		if (!selectedStateObj) return

		updateArcadeLocation(
			{
				arcade: selectedArcade.id,
				country: selectedCountry,
				state: selectedStateObj.state,
				regionId: selectedStateObj.regionId
			},
			{
				onSuccess: () => toast.success("Arcade location updated successfully!"),
				onError: error => {
					console.error("Failed to update arcade location:", error)
					toast.error("Failed to update arcade location")
				}
			}
		)
	}

	const isFormValid =
		selectedArcade &&
		selectedCountry &&
		selectedState &&
		!isPending &&
		!isLoading &&
		currentArcade &&
		currentArcade.length > 0

	return (
		<div className="bg-card">
			<div className="mb-6">
				<h2 className="text-primary mb-2 text-xl font-semibold">Change Arcade Location</h2>
				{isLoading ? (
					<div className="text-primary-muted flex items-center gap-2 text-sm">
						<Spinner size={16} /> Loading arcades...
					</div>
				) : selectedArcade ? (
					<p className="text-primary-muted text-sm">
						Configure location for <span className="font-medium">{selectedArcade.name}</span>
					</p>
				) : currentArcade && currentArcade.length > 0 ? (
					<p className="text-primary-muted text-sm">Select an arcade to configure its location</p>
				) : null}
			</div>

			{/* No Arcade Assigned */}
			{!isLoading && (!currentArcade || currentArcade.length === 0) ? (
				<div className="rounded-sm border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
					<div className="flex items-start gap-3">
						<div className="mt-0.5 text-amber-600 dark:text-amber-400">
							<CircleAlert />
						</div>
						<div className="text-sm text-amber-800 dark:text-amber-200">
							<p className="mb-1 font-medium">No Arcade Assigned</p>
							<p>
								You currently have no arcade tied to your account. Please contact{" "}
								<span className="bg-primary text-primary-foreground rounded px-1.5 py-0.5 text-xs font-medium">
									@PolarisPyra
								</span>{" "}
								or{" "}
								<span className="bg-primary text-primary-foreground rounded px-1.5 py-0.5 text-xs font-medium">
									@azui.573
								</span>{" "}
								to get your assigned arcade back.
							</p>
						</div>
					</div>
				</div>
			) : (
				<div>
					{/* Arcade Select */}
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
									{selectedArcade ? selectedArcade.name : "Choose an arcade"}
									<ChevronsUpDown className="flex-shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-80 rounded-sm p-0">
								<Command className="w-full">
									<CommandInput placeholder="Search arcades..." />

									<CommandList>
										<CommandEmpty className="text-muted">No arcade found.</CommandEmpty>
										<CommandGroup>
											{currentArcade?.map((arcade, index) => (
												<CommandItem
													key={arcade.id}
													value={`${arcade.name} ${arcade.serial}`}
													className="w-full cursor-pointer justify-between"
													onSelect={() => {
														setSelectedArcadeIndex(index)
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

					{/* Country Select */}
					<div className="mb-4">
						<label className="text-primary block pb-2 text-sm font-medium">Country</label>
						<Popover open={openCountry} onOpenChange={setOpenCountry}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={openCountry}
									disabled={!selectedArcade}
									className={`inline-flex w-80 items-center justify-between gap-2 hover:cursor-pointer`}
								>
									{selectedCountry || "Select Country"}
									<ChevronsUpDown className="flex-shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-80 rounded-sm p-0">
								<Command className="w-full">
									<CommandInput placeholder="Search countries..." />
									<CommandList>
										<CommandEmpty>No country found.</CommandEmpty>
										<CommandGroup>
											{countries.map(country => (
												<CommandItem
													key={country}
													value={country}
													onSelect={(val: string) => {
														setSelectedCountry(val)
														setSelectedState("")
														setOpenCountry(false)
													}}
													className="w-full cursor-pointer justify-between"
												>
													<div className="flex items-center justify-between">
														<span className="text-primary">{country}</span>
													</div>
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					</div>

					{/* State Select */}
					<div className="mb-4">
						<label className="text-primary block pb-2 text-sm font-medium">State / Region</label>
						<Popover open={openState} onOpenChange={setOpenState}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={openState}
									disabled={!selectedCountry}
									className={`inline-flex w-80 items-center justify-between gap-2 hover:cursor-pointer`}
								>
									{selectedState || "Select State / Region"}
									<ChevronsUpDown className="opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-80 p-0">
								<Command>
									<CommandInput placeholder="Search states..." />
									<CommandList>
										<CommandEmpty>No state found.</CommandEmpty>
										<CommandGroup>
											{states.map(state => (
												<CommandItem
													key={state.regionId}
													value={state.state}
													className="w-full cursor-pointer justify-between"
													onSelect={(val: string) => {
														setSelectedState(val)
														setOpenState(false)
													}}
												>
													<div className="flex items-center justify-between">
														<span className="text-primary">{state.state}</span>
													</div>
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					</div>

					{/* Submit Button */}
					<div className="pt-4">
						<Button
							variant="custom"
							onClick={handleSubmit}
							disabled={!isFormValid}
							className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:border-muted/50 disabled:bg-muted disabled:text-muted-foreground w-full items-center justify-center gap-2 rounded-md border border-transparent p-3 font-semibold transition-colors disabled:cursor-not-allowed"
							aria-busy={isPending}
						>
							{isPending ? (
								<>
									<Spinner size={16} className="mr-2" />
									<span>Updating Location...</span>
								</>
							) : (
								<span>Update</span>
							)}
						</Button>
					</div>
				</div>
			)}
		</div>
	)
}

export default ArcadeLocation
