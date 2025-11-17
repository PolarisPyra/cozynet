import React, { useCallback, useMemo, useRef, useState } from "react"

import { Button } from "@/app/shared/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/app/shared/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/shared/components/ui/popover"
import { cn } from "@/app/shared/utils/cn"

const DEFAULT_VOICE_SAMPLES: Record<string, string> = {
	"00000": "Full Combo",
	"00001": "All Justice",
	"00002": "1000 Chain",
	"00003": "2000 Chain",
	"00004": "3000 Chain",
	"00005": "4000 Chain",
	"00006": "5000 Chain",
	"00007": "Full Chain",
	"00008": "New Record",
	"00009": "All Clear",
	"00010": "Rank D",
	"00011": "Rank C",
	"00012": "Rank B",
	"00013": "Rank BB",
	"00014": "Rank BBB",
	"00015": "Rank A",
	"00016": "Rank AA",
	"00017": "Rank AAA",
	"00018": "Rank S",
	"00019": "Rank S+",
	"00020": "Rank SS",
	"00021": "Rank SS+",
	"00022": "Rank SSS",
	"00023": "Rank SSS+",
	"00024": "Voice Sample 1",
	"00025": "Voice Sample 2",
	"00026": "Voice Sample 3",
	"00027": "Voice Sample 4",
	"00028": "Voice Sample 5",
	"00029": "Voice Sample 6",
	"00030": "Voice Sample 7",
	"00031": "Voice Sample 8",
	"00032": "Voice Sample 9",
	"00033": "Voice Sample 10",
	"00034": "Voice Sample 11",
	"00035": "Voice Sample 12",
	"00036": "Voice Sample 13",
	"00037": "Voice Sample 14",
	"00038": "Voice Sample 15",
	"00039": "Voice Sample 16",
	"00040": "Voice Sample 17",
	"00041": "Voice Sample 18"
}

export function VoiceSampleDropdown({ systemVoiceId, className }: VoiceSampleDropdownProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
	const audioRef = useRef<HTMLAudioElement | null>(null)

	const formattedVoiceId = useMemo(() => systemVoiceId.toString().padStart(4, "0"), [systemVoiceId])

	const getAudioUrl = useCallback(
		(sampleId: string) => {
			return `https://cozynet.b-cdn.net/client/assets/chunithm/systemvoices/systemvoice${formattedVoiceId}/${sampleId}_streaming.wav`
		},
		[formattedVoiceId]
	)

	const playAudioSample = useCallback(
		async (sampleId: string, sampleName: string) => {
			try {
				if (audioRef.current) {
					audioRef.current.pause()
					audioRef.current = null
				}

				setCurrentlyPlaying(sampleId)

				const audioUrl = getAudioUrl(sampleId)
				const audio = new Audio(audioUrl)
				audioRef.current = audio

				audio.onended = () => {
					setCurrentlyPlaying(null)
					audioRef.current = null
				}

				audio.onerror = () => {
					setCurrentlyPlaying(null)
					audioRef.current = null
					console.warn(`Failed to load audio sample: ${sampleName} (${sampleId})`)
				}

				await audio.play()
			} catch (error) {
				setCurrentlyPlaying(null)
				audioRef.current = null
				console.error(`Error playing audio sample: ${sampleName} (${sampleId})`, error)
			}
		},
		[getAudioUrl]
	)

	const stopAudio = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.pause()
			audioRef.current = null
		}
		setCurrentlyPlaying(null)
	}, [])

	React.useEffect(() => {
		return () => {
			if (audioRef.current) audioRef.current.pause()
		}
	}, [])

	return (
		<div className={cn("relative", className)}>
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<Button variant="outline" size="sm" className="text-primary flex items-center gap-2">
						🎵 Voice Samples
						<span className={cn("transition-transform", isOpen && "rotate-180")}>▼</span>
					</Button>
				</PopoverTrigger>

				<PopoverContent align="start" className="w-64 p-0">
					<div className="bg-card max-h-96 w-64 overflow-y-auto rounded-sm border shadow-lg">
						<Command>
							<CommandInput placeholder="Search samples..." />
							<CommandList>
								<CommandEmpty>No sample found.</CommandEmpty>
								<CommandGroup>
									{Object.entries(DEFAULT_VOICE_SAMPLES).map(([sampleId, sampleName]) => (
										<CommandItem
											key={sampleId}
											value={sampleId}
											className="group flex items-center justify-between rounded-sm p-2"
											onSelect={(val: string) => playAudioSample(val, sampleName)}
										>
											<span className="text-primary flex-1 truncate text-sm">{sampleName}</span>
											<div className="flex items-center gap-1">
												{currentlyPlaying === sampleId ? (
													<Button
														variant="ghost"
														size="sm"
														className="text-destructive h-6 w-6 p-0"
														onClick={e => {
															e.stopPropagation()
															stopAudio()
														}}
													>
														⏹
													</Button>
												) : (
													<Button
														variant="ghost"
														size="sm"
														className="text-muted-foreground h-6 w-6 p-0 opacity-70 group-hover:opacity-100"
														onClick={e => {
															e.stopPropagation()
															playAudioSample(sampleId, sampleName)
														}}
													>
														▶
													</Button>
												)}
											</div>
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	)
}

interface VoiceSampleDropdownProps {
	systemVoiceId: number
	className?: string
}
