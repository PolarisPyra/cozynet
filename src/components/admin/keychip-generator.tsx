import { useState } from "react"

import { ChevronDown, Loader2, Shuffle } from "lucide-react"
import { toast } from "sonner"

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { api } from "@/utils"

import { Button } from "../ui/button"

export function KeychipGenerator() {
	const [isLoading, setIsLoading] = useState(false)
	const [openDropdown, setOpenDropdown] = useState(false)
	const [formData, setFormData] = useState({
		arcade_nickname: "",
		name: "",
		game: "aime",
		namcopcbid: "",
		aimecard: ""
	})

	// Determine which ID field to show based on game type
	const showNamcoPcbId = formData.game === "SDEW"
	const hasSerialId = showNamcoPcbId ? !!formData.namcopcbid : !!formData.aimecard

	const gameOptions = [
		{ value: "aime", label: "Sega (Aime card)" },
		{ value: "SDEW", label: "SDEW (Namco PCB)" }
	]

	const handleChange = (e: { target: { name: string; value: string } }) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		})
	}

	const handleGameChange = (value: string) => {
		setFormData(data => ({
			...data,
			game: value,
			namcopcbid: "",
			aimecard: ""
		}))
		setOpenDropdown(false)
	}

	const generateRandomSerial = () => {
		let uniqueNumbers = ""
		while (uniqueNumbers.length < 4) {
			const digit = Math.floor(Math.random() * 10)
			if (!uniqueNumbers.includes(digit.toString())) {
				uniqueNumbers += digit
			}
		}
		const randomNumbers = Math.floor(1000 + Math.random() * 9000)
		const randomSerial = `A69E01A${uniqueNumbers}${randomNumbers}`

		setFormData(data => ({
			...data,
			[showNamcoPcbId ? "namcopcbid" : "aimecard"]: randomSerial
		}))
	}

	const handleSubmit = async (e: { preventDefault: () => void }) => {
		e.preventDefault()
		setIsLoading(true)

		try {
			const response = await api.admin.keychip.generate.$post({
				json: formData
			})

			if (response.ok) {
				toast.success("Keychip generated successfully!")
				setFormData(data => ({
					...data,
					arcade_nickname: "",
					name: ""
				}))
			} else {
				const errorMessage =
					response.status === 403
						? "You don't have permission to generate keychips"
						: `Failed to generate keychip: ${response.status}`
				toast.error(errorMessage)
			}
		} catch (error) {
			console.error("Error generating keychip:", error)
			toast.error("An unexpected error occurred")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="bg-card rounded-sm">
			<h2 className="text-primary mb-4 text-xl font-semibold">Keychip Generator</h2>
			<div className="text-primary mb-4 text-sm">Makes a new keychip</div>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="text-primary mb-1 block text-sm font-medium">Arcade Nickname</label>
					<input
						type="text"
						name="arcade_nickname"
						placeholder="Enter arcade nickname"
						value={formData.arcade_nickname}
						onChange={handleChange}
						className="bg-background text-foreground border-input w-full rounded border p-2"
						required
					/>
				</div>

				<div>
					<label className="text-primary mb-1 block text-sm font-medium">Arcade Name</label>
					<input
						type="text"
						name="name"
						placeholder="Enter arcade name"
						value={formData.name}
						onChange={handleChange}
						className="bg-background text-foreground border-input w-full rounded border p-2"
						required
					/>
				</div>

				<div>
					<label className="text-primary mb-1 block text-sm font-medium">Game Type</label>
					<Popover open={openDropdown} onOpenChange={setOpenDropdown}>
						<PopoverTrigger asChild>
							<Button variant="dropdown" type="button">
								<span className="text-primary truncate">
									{gameOptions.find(opt => opt.value === formData.game)?.label || "Select Game Type"}
								</span>
								<ChevronDown className="opacity-50" />
							</Button>
						</PopoverTrigger>

						<PopoverContent align="start" className="w-full p-0">
							<Command>
								<CommandInput placeholder="Search game types..." />
								<CommandList>
									<CommandEmpty>No game type found.</CommandEmpty>
									<CommandGroup>
										{gameOptions.map(option => (
											<CommandItem
												key={option.value}
												value={option.value}
												className="w-full cursor-pointer justify-between"
												onSelect={(val: string) => handleGameChange(val)}
											>
												<span className="text-primary">{option.label}</span>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</div>

				<div>
					<label className="text-primary mb-1 block text-sm font-medium">
						{showNamcoPcbId ? "Namco PCBID" : "Aime Card"}
					</label>
					<input
						type="text"
						placeholder={showNamcoPcbId ? "Enter Namco PCBID" : "Enter Aime Card"}
						name={showNamcoPcbId ? "namcopcbid" : "aimecard"}
						value={showNamcoPcbId ? formData.namcopcbid : formData.aimecard}
						onChange={handleChange}
						className="bg-background text-foreground border-input w-full rounded border p-2"
						required
						readOnly
					/>
				</div>

				<Button
					variant="custom"
					type="button"
					onClick={generateRandomSerial}
					disabled={isLoading}
					className="border-input bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:border-muted/50 disabled:bg-muted disabled:text-muted-foreground mt-4 flex w-full items-center justify-center gap-2 rounded-md border p-3 font-medium transition-colors disabled:cursor-not-allowed"
					aria-busy={isLoading}
				>
					<Shuffle className="h-4 w-4" />
					<span>Generate random serial</span>
				</Button>

				<Button
					variant="custom"
					type="submit"
					disabled={isLoading || !hasSerialId}
					className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:border-muted/50 disabled:bg-muted disabled:text-muted-foreground mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-transparent p-3 font-semibold transition-colors disabled:cursor-not-allowed"
					aria-busy={isLoading}
				>
					{isLoading ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							<span>Generating...</span>
						</>
					) : (
						<span>Add new keychip</span>
					)}
				</Button>
			</form>
		</div>
	)
}
