import { useState, useTransition } from "react"

import { useQueryClient } from "@tanstack/react-query"
import { ChevronDown, Loader2, Shuffle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/app/shared/components/ui/button"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from "@/app/shared/components/ui/command"
import { Input } from "@/app/shared/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/shared/components/ui/popover"
import { api } from "@/app/shared/utils"

const gameOptions = [
	{ value: "aime", label: "Sega (Aime card)" },
	{ value: "SDEW", label: "SDEW (Namco PCB)" }
] as const

type GameType = (typeof gameOptions)[number]["value"]

export const KeychipGenerator = function () {
	const queryClient = useQueryClient()
	const [isPending, startTransition] = useTransition()
	const [openDropdown, setOpenDropdown] = useState(false)
	const [formData, setFormData] = useState({
		arcade_nickname: "",
		name: "",
		game: "aime" as GameType,
		namcopcbid: "",
		aimecard: ""
	})

	const showNamcoPcbId = formData.game === "SDEW"
	const hasSerialId = showNamcoPcbId ? !!formData.namcopcbid : !!formData.aimecard

	const updateKeychipForm = function (e: React.ChangeEvent<HTMLInputElement>) {
		const { name, value } = e.target
		let normalized = value
		if (name === "aimecard" || name === "namcopcbid") {
			const filtered = value.toUpperCase().replace(/[^A-Z0-9-]/g, "")
			let result = ""
			let nonDashCount = 0
			for (const c of filtered) {
				if (c === "-") result += c
				else if (nonDashCount < 15) {
					result += c
					nonDashCount++
				}
			}
			normalized = result
		}
		setFormData(prev => ({
			...prev,
			[name]: normalized
		}))
	}

	const handleGameChange = function (value: GameType) {
		setFormData(data => ({
			...data,
			game: value,
			namcopcbid: "",
			aimecard: ""
		}))
		setOpenDropdown(false)
	}

	const generateRandomSerial = function () {
		const uniqueSet = new Set<string>()
		while (uniqueSet.size < 4) {
			uniqueSet.add(Math.floor(Math.random() * 10).toString())
		}
		const uniqueNumbers = Array.from(uniqueSet).join("")
		const randomNumbers = Math.floor(1000 + Math.random() * 9000)
		const randomSerial = `A69E-01A${uniqueNumbers}${randomNumbers}`

		setFormData(data => ({
			...data,
			[showNamcoPcbId ? "namcopcbid" : "aimecard"]: randomSerial
		}))
	}

	const handleSubmit = function (e: { preventDefault: () => void }) {
		e.preventDefault()

		startTransition(async () => {
			try {
				const payload = {
					...formData,
					aimecard: formData.aimecard.replace(/-/g, ""),
					namcopcbid: formData.namcopcbid.replace(/-/g, "")
				}
				const response = await api.admin.keychip.generate.$post({
					json: payload
				})

				if (!response.ok) {
					const errorMessage =
						response.status === 403
							? "You don't have permission to generate keychips"
							: `Failed to generate keychip: ${response.status}`
					toast.error(errorMessage)
					return
				}

				toast.success("Keychip generated successfully!")
				queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
				setFormData(data => ({
					...data,
					arcade_nickname: "",
					name: ""
				}))
			} catch (error) {
				console.error("Error generating keychip:", error)
				toast.error("An unexpected error occurred")
			}
		})
	}

	return (
		<div className="space-y-4">
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="arcade_nickname" className="text-primary mb-1 block text-sm font-medium">
						Arcade Nickname
					</label>
					<Input
						id="arcade_nickname"
						type="text"
						name="arcade_nickname"
						placeholder="Enter arcade nickname"
						value={formData.arcade_nickname}
						onChange={updateKeychipForm}
						className="bg-background text-foreground border-input w-full rounded border p-2"
						required
					/>
				</div>

				<div>
					<label htmlFor="name" className="text-primary mb-1 block text-sm font-medium">
						Arcade Name
					</label>
					<Input
						id="name"
						type="text"
						name="name"
						placeholder="Enter arcade name"
						value={formData.name}
						onChange={updateKeychipForm}
						className="bg-background text-foreground border-input w-full rounded border p-2"
						required
					/>
				</div>

				<div>
					<label htmlFor="game-type-trigger" className="text-primary mb-1 block text-sm font-medium">
						Game Type
					</label>
					<Popover open={openDropdown} onOpenChange={setOpenDropdown} modal={true}>
						<PopoverTrigger asChild>
							<Button id="game-type-trigger" variant="dropdown" type="button">
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
												onSelect={() => handleGameChange(option.value)}
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
					<label htmlFor="keychip-id" className="text-primary mb-1 block text-sm font-medium">
						{showNamcoPcbId ? "Namco PCBID" : "Keychip ID"}
					</label>
					<Input
						id="keychip-id"
						type="text"
						placeholder={showNamcoPcbId ? "Enter Namco PCBID" : "Enter keychip ID"}
						name={showNamcoPcbId ? "namcopcbid" : "aimecard"}
						value={showNamcoPcbId ? formData.namcopcbid : formData.aimecard}
						onChange={updateKeychipForm}
						className="bg-background text-foreground border-input w-full rounded border p-2 font-mono"
						required
					/>
				</div>

				<Button
					variant="outline"
					size="sm"
					type="button"
					onClick={generateRandomSerial}
					disabled={isPending}
					className="mt-4 w-full"
					aria-busy={isPending}
				>
					<Shuffle className="size-4" />
					<span>Generate random serial</span>
				</Button>

				<Button
					variant="outline"
					size="sm"
					type="submit"
					disabled={isPending || !hasSerialId}
					className="mt-4 w-full"
					aria-busy={isPending}
				>
					{isPending ? (
						<>
							<Loader2 className="size-4 animate-spin" />
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
