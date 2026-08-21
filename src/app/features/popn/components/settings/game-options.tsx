import { useEffect, useState } from "react"

import { toast } from "sonner"

import { type PopnSettings, usePopnSettings, useUpdatePopnSettings } from "@/app/features/popn/hooks/use-settings"
import { Button } from "@/app/shared/components/ui/button"
import { Label } from "@/app/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/shared/components/ui/select"
import { Switch } from "@/app/shared/components/ui/switch"

const defaultSettings: PopnSettings = {
	musicPhase: 7,
	extraStagePhase: 0,
	tataitePonponPhase: 0,
	forceUnlockSongs: true,
	forceUnlockDeco: true,
	enableTimePlayMode: true,
	enableLicenses: true
}

const musicPhaseOptions = ["No music unlocks", ...Array.from({ length: 7 }, (_, index) => `Phase ${index + 1}`)]
const extraStagePhaseOptions = ["Disabled", "Phase 1", "Phase 2", "Phase 3"]
const tataitePonponPhaseOptions = [
	"No music unlocks",
	"告げてみことや かのもとに",
	"フラフラ",
	"心転々",
	"BRAND NEW STARS!!/FUSIONIC STARS!!",
	"BRIGHTEST STARS!!/One with One!",
	"音戯探偵ひなビタ♫ songs",
	"TWINKLING/ラピストリアの約束/終末の序曲～オワリノハジマリ～ Upper",
	"不知火フレア Covers",
	"Fate No.23/透明はまだらに世界を告げて Uppers",
	"HYPER LUV/ÜBER BLANKENESE",
	"Signs and Wonders"
]

function ToggleSetting({
	label,
	value,
	disabled,
	onChange
}: {
	label: string
	value: boolean
	disabled: boolean
	onChange: (value: boolean) => void
}) {
	return (
		<div className="flex items-center justify-between gap-4">
			<p className="font-medium">{label}</p>
			<Switch checked={value} disabled={disabled} onCheckedChange={onChange} aria-label={label} />
		</div>
	)
}

export default function PopnGameOptions() {
	const { data, isLoading } = usePopnSettings()
	const { mutate: updateSettings, isPending } = useUpdatePopnSettings()
	const [formData, setFormData] = useState<PopnSettings>(defaultSettings)

	useEffect(() => {
		if (data) setFormData(data)
	}, [data])

	const updateValue = <K extends keyof PopnSettings>(key: K, value: PopnSettings[K]) => {
		setFormData(previous => ({ ...previous, [key]: value }))
	}

	const handleSubmit = () => {
		updateSettings(formData, {
			onSuccess: () => toast.success("Pop'n settings updated successfully"),
			onError: () => toast.error("Failed to update Pop'n settings")
		})
	}

	if (isLoading) {
		return <div className="bg-card rounded-sm p-4 md:p-6">Loading Pop'n settings...</div>
	}

	return (
		<div className="bg-card rounded-sm p-4 md:p-6">
			<h2 className="text-primary mb-6 text-xl font-semibold">High☆Cheers Game Settings</h2>
			<div className="grid gap-6 md:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="musicPhase">Music Open Phase</Label>
					<Select
						value={formData.musicPhase.toString()}
						onValueChange={value => updateValue("musicPhase", Number(value))}
					>
						<SelectTrigger id="musicPhase">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{musicPhaseOptions.map((label, value) => (
								<SelectItem key={value} value={value.toString()}>
									{label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="extraStagePhase">Extra Stage Phase</Label>
					<Select
						value={formData.extraStagePhase.toString()}
						onValueChange={value => updateValue("extraStagePhase", Number(value))}
					>
						<SelectTrigger id="extraStagePhase">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{extraStagePhaseOptions.map((label, value) => (
								<SelectItem key={value} value={value.toString()}>
									{label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2 md:col-span-2">
					<Label htmlFor="tataitePonponPhase">Tataite ponpon! pop-kun taikai Event Phase</Label>
					<Select
						value={formData.tataitePonponPhase.toString()}
						onValueChange={value => updateValue("tataitePonponPhase", Number(value))}
					>
						<SelectTrigger id="tataitePonponPhase">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{tataitePonponPhaseOptions.map((label, value) => (
								<SelectItem key={value} value={value.toString()}>
									{label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-4 md:col-span-2">
					<ToggleSetting
						label="Force Song Unlock"
						value={formData.forceUnlockSongs}
						disabled={isPending}
						onChange={value => updateValue("forceUnlockSongs", value)}
					/>
					<ToggleSetting
						label="Force Deco Unlock"
						value={formData.forceUnlockDeco}
						disabled={isPending}
						onChange={value => updateValue("forceUnlockDeco", value)}
					/>
					<ToggleSetting
						label="Enable Time play Mode"
						value={formData.enableTimePlayMode}
						disabled={isPending}
						onChange={value => updateValue("enableTimePlayMode", value)}
					/>
					<ToggleSetting
						label="Enable Licenses"
						value={formData.enableLicenses}
						disabled={isPending}
						onChange={value => updateValue("enableLicenses", value)}
					/>
				</div>
			</div>

			<div className="mt-6 flex justify-end">
				<Button onClick={handleSubmit} variant="outline" disabled={isPending}>
					{isPending ? "Updating..." : "Update Settings"}
				</Button>
			</div>
		</div>
	)
}
