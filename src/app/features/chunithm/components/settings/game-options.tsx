import { useEffect, useRef, useState } from "react"

import { Download, Upload } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/app/shared/components/ui/button"
import { Label } from "@/app/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/shared/components/ui/select"
import { useChunithmVersion, useGameOptions, useUpdateGameOptions } from "@/app/features/chunithm/hooks"

const ChunithmGameOptions = () => {
	const version = useChunithmVersion()
	const { data: options, isLoading } = useGameOptions()
	const { mutate: updateOptions, isPending } = useUpdateGameOptions()
	const fileInputRef = useRef<HTMLInputElement>(null)

	const [formData, setFormData] = useState<Record<string, number>>({})

	// Initialize form data when options are loaded
	useEffect(() => {
		if (options) {
			const initialData: Record<string, number> = {}
			Object.entries(options).forEach(([key, value]) => {
				if (typeof value === "number") {
					initialData[key] = value
				}
			})
			setFormData(initialData)
		}
	}, [options])

	const handleOptionChange = (key: string, value: string) => {
		setFormData(prev => ({
			...prev,
			[key]: parseInt(value, 10)
		}))
	}

	const handleSubmit = () => {
		updateOptions(formData, {
			onSuccess: () => {
				toast.success("Game options updated successfully!")
			},
			onError: () => {
				toast.error("Failed to update game options")
			}
		})
	}

	const handleExport = () => {
		const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData))
		const downloadAnchorNode = document.createElement("a")
		downloadAnchorNode.setAttribute("href", dataStr)
		downloadAnchorNode.setAttribute("download", "chunithm_game_options.json")
		document.body.appendChild(downloadAnchorNode)
		downloadAnchorNode.click()
		downloadAnchorNode.remove()
		toast.success("Options exported successfully!")
	}

	const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onload = e => {
				try {
					const importedOptions = JSON.parse(e.target?.result as string)
					setFormData(importedOptions)
					toast.success("Options imported successfully!")
				} catch (error) {
					toast.error("Failed to parse imported file")
				}
			}
			reader.readAsText(file)
		}
	}

	// Version check - only show for version 12 and above
	if (!version || version < 12) {
		return (
			<div className="bg-card rounded-sm p-4 md:p-6">
				<h2 className="text-primary mb-4 text-xl font-semibold">Chunithm Game Options</h2>
				<div className="text-muted-foreground text-center">
					<p>Game options are only available for Chunithm version 12 (NEW) and above.</p>
					<p className="mt-2">Please set your Chunithm version to 12 or higher in the version settings below.</p>
				</div>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className="bg-card rounded-sm p-4 md:p-6">
				<h2 className="text-primary mb-4 text-xl font-semibold">Chunithm Game Options</h2>
				<div className="text-center">Loading game options...</div>
			</div>
		)
	}

	const speedOptions = []
	for (let speed = 1; speed <= 15; speed += 0.25) {
		const speedIndex = Math.floor((speed - 1) / 0.25)
		speedOptions.push({ value: speedIndex, label: speed.toFixed(2) })
	}
	for (let speed = 16; speed <= 20; speed++) {
		const speedIndex = 56 + (speed - 15)
		speedOptions.push({ value: speedIndex, label: speed === 20 ? "SONIC" : speed.toFixed(2) })
	}

	const offsetOptions = []
	for (let i = 0; i <= 40; i++) {
		const displayValue = i / 10 - 2
		const formattedValue = displayValue > 0 ? `+${displayValue.toFixed(1)}` : displayValue.toFixed(1)
		offsetOptions.push({ value: i, label: formattedValue })
	}

	const volumeOptions = []
	for (let i = 0; i < 11; i++) {
		volumeOptions.push({ value: i, label: i === 0 ? "OFF" : i.toString() })
	}

	const tapSounds = [
		"Default",
		"Clap",
		"Rain",
		"Wood Block",
		"Bell",
		"Kick & Cymbal",
		"Short Clap",
		"Japanese Taiko",
		"maimai",
		"Ongeki"
	]

	const soundConditions = ["Skill Trigger", "MISS", "ATTACK", "JUSTICE"]

	const judgementPositions = ["Bottom", "Middle", "Top", "Heaven"]

	const displayOptions = ["Judgement Only", "Show All", "Fast/Late Only", "OFF"]

	const trackSkipOptions = ["OFF", "S", "S+", "SS", "SS+", "SSS", "SSS+", "MY BEST"]

	const guideLineOptions = ["OFF", "2 Divisions", "4 Divisions", "8 Divisions", "16 Divisions"]

	const fieldColorOptions = ["-5", "-4", "-3", "-2", "-1", "0"]

	const fieldWallOptions = []
	for (let i = 0; i < 17; i++) {
		fieldWallOptions.push({ value: i, label: i.toString() })
	}

	const fieldInfoOptions = [
		"OFF",
		"COMBO",
		"SCORE+",
		"SCORE-",
		"BORDER/S",
		"BORDER/S+",
		"BORDER/SS",
		"BORDER/SS+",
		"BORDER/SSS",
		"BORDER/SSS+",
		"BORDER/MY BEST"
	]

	return (
		<div className="bg-card rounded-sm p-4 md:p-6">
			<h2 className="text-primary mb-6 text-xl font-semibold">
				Chunithm Game Options (only available for CHUNITHM NEW and above)
			</h2>

			{/* Import/Export Section */}
			<div className="mb-8 rounded-sm border p-4">
				<h3 className="text-primary mb-4 text-lg font-medium">Import/Export Options</h3>
				<p className="text-muted-foreground mb-4 text-sm">
					You can export your existing options and import them at a later time.
				</p>
				<div className="flex gap-4">
					<Button onClick={handleExport} variant="outline" size="sm" className="flex items-center gap-2">
						<Download className="h-4 w-4" />
						Export
					</Button>
					<Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" className="flex items-center gap-2">
						<Upload className="h-4 w-4" />
						Import
					</Button>
					<input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
				</div>
			</div>

			{/* Game Settings */}
			<div className="mb-8">
				<h3 className="text-primary mb-4 text-lg font-medium">1: Game Settings</h3>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="speed_120">Speed (120hz)</Label>
						<Select
							value={formData.speed_120?.toString() || "0"}
							onValueChange={value => handleOptionChange("speed_120", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{speedOptions.map(option => (
									<SelectItem key={option.value} value={option.value.toString()}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="speed">Speed (60hz)</Label>
						<Select
							value={formData.speed?.toString() || "0"}
							onValueChange={value => handleOptionChange("speed", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{speedOptions.map(option => (
									<SelectItem key={option.value} value={option.value.toString()}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="mirrorFumen">Mirror Track</Label>
						<Select
							value={formData.mirrorFumen?.toString() || "0"}
							onValueChange={value => handleOptionChange("mirrorFumen", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="0">OFF</SelectItem>
								<SelectItem value="1">ON</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="trackSkip">Track Skip</Label>
						<Select
							value={formData.trackSkip?.toString() || "0"}
							onValueChange={value => handleOptionChange("trackSkip", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{trackSkipOptions.map((option, index) => (
									<SelectItem key={index} value={index.toString()}>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="playTimingOffset_120">Offset A (120hz)</Label>
						<Select
							value={formData.playTimingOffset_120?.toString() || "20"}
							onValueChange={value => handleOptionChange("playTimingOffset_120", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{offsetOptions.map(option => (
									<SelectItem key={option.value} value={option.value.toString()}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="playTimingOffset">Offset A (60hz)</Label>
						<Select
							value={formData.playTimingOffset?.toString() || "20"}
							onValueChange={value => handleOptionChange("playTimingOffset", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{offsetOptions.map(option => (
									<SelectItem key={option.value} value={option.value.toString()}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="judgeTimingOffset_120">Offset B (120hz)</Label>
						<Select
							value={formData.judgeTimingOffset_120?.toString() || "20"}
							onValueChange={value => handleOptionChange("judgeTimingOffset_120", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{offsetOptions.map(option => (
									<SelectItem key={option.value} value={option.value.toString()}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="judgeTimingOffset">Offset B (60hz)</Label>
						<Select
							value={formData.judgeTimingOffset?.toString() || "20"}
							onValueChange={value => handleOptionChange("judgeTimingOffset", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{offsetOptions.map(option => (
									<SelectItem key={option.value} value={option.value.toString()}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="matching">Cab-to-Cab</Label>
						<Select
							value={formData.matching?.toString() || "0"}
							onValueChange={value => handleOptionChange("matching", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="0">OFF</SelectItem>
								<SelectItem value="1">ON</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="playerLevel">Level Display</Label>
						<Select
							value={formData.playerLevel?.toString() || "0"}
							onValueChange={value => handleOptionChange("playerLevel", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="0">OFF</SelectItem>
								<SelectItem value="1">ON</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="rating">Rating Display</Label>
						<Select
							value={formData.rating?.toString() || "0"}
							onValueChange={value => handleOptionChange("rating", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="0">OFF</SelectItem>
								<SelectItem value="1">ON</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="categoryDetail">Overpower Display</Label>
						<Select
							value={formData.categoryDetail?.toString() || "0"}
							onValueChange={value => handleOptionChange("categoryDetail", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="0">OFF</SelectItem>
								<SelectItem value="1">ON</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			{/* Sound Settings */}
			<div className="mb-8">
				<h3 className="text-primary mb-4 text-lg font-medium">2: Sound Settings</h3>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="guideSound">Guide Volume</Label>
						<Select
							value={formData.guideSound?.toString() || "0"}
							onValueChange={value => handleOptionChange("guideSound", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{volumeOptions.map(option => (
									<SelectItem key={option.value} value={option.value.toString()}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="successTapTimbre">TAP Sound</Label>
						<Select
							value={formData.successTapTimbre?.toString() || "0"}
							onValueChange={value => handleOptionChange("successTapTimbre", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{tapSounds.map((sound, index) => (
									<SelectItem key={index} value={index.toString()}>
										{sound}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="successTap">TAP Volume</Label>
						<Select
							value={formData.successTap?.toString() || "0"}
							onValueChange={value => handleOptionChange("successTap", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{volumeOptions.map(option => (
									<SelectItem key={option.value} value={option.value.toString()}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="successExTap">ExTAP Volume</Label>
						<Select
							value={formData.successExTap?.toString() || "0"}
							onValueChange={value => handleOptionChange("successExTap", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{volumeOptions.map(option => (
									<SelectItem key={option.value} value={option.value.toString()}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="successSlideHold">HOLD/SLIDE Volume</Label>
						<Select
							value={formData.successSlideHold?.toString() || "0"}
							onValueChange={value => handleOptionChange("successSlideHold", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{volumeOptions.map(option => (
									<SelectItem key={option.value} value={option.value.toString()}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="successAir">AIR/AIR-ACTION Volume</Label>
						<Select
							value={formData.successAir?.toString() || "0"}
							onValueChange={value => handleOptionChange("successAir", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{volumeOptions.map(option => (
									<SelectItem key={option.value} value={option.value.toString()}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="successFlick">FLICK Volume</Label>
						<Select
							value={formData.successFlick?.toString() || "0"}
							onValueChange={value => handleOptionChange("successFlick", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{volumeOptions.map(option => (
									<SelectItem key={option.value} value={option.value.toString()}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="successSkill">Skill/LIFE Volume</Label>
						<Select
							value={formData.successSkill?.toString() || "0"}
							onValueChange={value => handleOptionChange("successSkill", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{volumeOptions.map(option => (
									<SelectItem key={option.value} value={option.value.toString()}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="judgeAppendSe">Sound Conditions</Label>
						<Select
							value={formData.judgeAppendSe?.toString() || "0"}
							onValueChange={value => handleOptionChange("judgeAppendSe", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{soundConditions.map((condition, index) => (
									<SelectItem key={index} value={index.toString()}>
										{condition}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			{/* Display Settings */}
			<div className="mb-8">
				<h3 className="text-primary mb-4 text-lg font-medium">3: Display Settings</h3>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="judgePos">Judgement Position</Label>
						<Select
							value={formData.judgePos?.toString() || "0"}
							onValueChange={value => handleOptionChange("judgePos", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{judgementPositions.map((position, index) => (
									<SelectItem key={index} value={index.toString()}>
										{position}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="judgeCritical">Display "JUSTICE CRITICAL"</Label>
						<Select
							value={formData.judgeCritical?.toString() || "0"}
							onValueChange={value => handleOptionChange("judgeCritical", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{displayOptions.map((option, index) => (
									<SelectItem key={index} value={index.toString()}>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="judgeJustice">Display "JUSTICE"</Label>
						<Select
							value={formData.judgeJustice?.toString() || "0"}
							onValueChange={value => handleOptionChange("judgeJustice", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{displayOptions.map((option, index) => (
									<SelectItem key={index} value={index.toString()}>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="judgeAttack">Display "ATTACK"</Label>
						<Select
							value={formData.judgeAttack?.toString() || "0"}
							onValueChange={value => handleOptionChange("judgeAttack", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{displayOptions.map((option, index) => (
									<SelectItem key={index} value={index.toString()}>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			{/* Field Settings */}
			<div className="mb-8">
				<h3 className="text-primary mb-4 text-lg font-medium">4: Field Settings</h3>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="guideLine">Guide Lines</Label>
						<Select
							value={formData.guideLine?.toString() || "0"}
							onValueChange={value => handleOptionChange("guideLine", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{guideLineOptions.map((option, index) => (
									<SelectItem key={index} value={index.toString()}>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="fieldColor">Field Color Dampening</Label>
						<Select
							value={formData.fieldColor?.toString() || "5"}
							onValueChange={value => handleOptionChange("fieldColor", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{fieldColorOptions.map((option, index) => (
									<SelectItem key={index} value={index.toString()}>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="fieldWallPosition_120">Field Wall (120hz)</Label>
						<Select
							value={formData.fieldWallPosition_120?.toString() || "0"}
							onValueChange={value => handleOptionChange("fieldWallPosition_120", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{fieldWallOptions.map(option => (
									<SelectItem key={option.value} value={option.value.toString()}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="fieldWallPosition">Field Wall (60hz)</Label>
						<Select
							value={formData.fieldWallPosition?.toString() || "0"}
							onValueChange={value => handleOptionChange("fieldWallPosition", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{fieldWallOptions.map(option => (
									<SelectItem key={option.value} value={option.value.toString()}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="bgInfo">Field Info</Label>
						<Select
							value={formData.bgInfo?.toString() || "0"}
							onValueChange={value => handleOptionChange("bgInfo", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{fieldInfoOptions.map((option, index) => (
									<SelectItem key={index} value={index.toString()}>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			{/* Submit Button */}
			<div className="flex justify-end">
				<Button onClick={handleSubmit} variant="outline" size="sm" disabled={isPending} className="px-8">
					{isPending ? "Updating..." : "Update Options"}
				</Button>
			</div>
		</div>
	)
}

export default ChunithmGameOptions
