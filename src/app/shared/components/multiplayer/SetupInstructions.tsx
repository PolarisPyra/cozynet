import { ReactNode, useState } from "react"

import { Button } from "@/app/shared/components/ui/button"

/**
 * Per-game setup instructions shown at the top of the multiplayer page.
 * Rendered inside a collapsible panel so experienced players aren't nagged
 * but newcomers can find the download + config in one click.
 */
export interface GameInstructions {
	/** Mod name shown in the heading and download button, e.g. "Mu3PartyBridge". */
	modName: string
	/** Direct link to the DLL (or a page that links to it). Required. */
	downloadUrl: string
	/** Name of the config file the user edits, e.g. "mu3.ini". */
	configFile: string
	/** Section header to write into the config file, e.g. "Party". */
	configSection: string
	/** Optional extra notes (version-compat caveats, troubleshooting tips). */
	notes?: ReactNode
}

interface SetupInstructionsProps {
	instructions: GameInstructions
	gameLabel: string
}

export function SetupInstructions({ instructions, gameLabel }: SetupInstructionsProps) {
	const [open, setOpen] = useState(false)
	const wsUrl = ((typeof env !== "undefined" && (env as any)?.ARTEMIS_WS_URL) || "wss://<your-artemis-host>/ws/party") as string

	const iniSnippet = `[${instructions.configSection}]\nRelayUrl=${wsUrl}\n`

	return (
		<div className="mb-4 rounded border">
			<button
				type="button"
				onClick={() => setOpen(v => !v)}
				className="flex w-full items-center justify-between p-3 text-left text-sm font-medium"
			>
				<span>
					{open ? "▾" : "▸"} {gameLabel} multiplayer setup — install the {instructions.modName} mod
				</span>
				{!open && <span className="text-muted-foreground text-xs">click to expand</span>}
			</button>
			{open && (
				<div className="flex flex-col gap-3 border-t p-3 text-sm">
					<Step n={1} title={`Install the ${instructions.modName} plugin`}>
						<a href={instructions.downloadUrl} target="_blank" rel="noreferrer">
							<Button size="sm">{instructions.modName}.dll</Button>
						</a>
					</Step>

					<Step n={2} title={`Enable in ${instructions.configFile}`}>
						<p className="text-muted-foreground mb-2">
							Add these lines. Setting <code className="rounded bg-muted px-1">RelayUrl</code> is the
							entire opt-in — clearing it disables the bridge.
						</p>
						<pre className="rounded bg-muted p-2 text-xs">{iniSnippet}</pre>
						<CopyButton text={iniSnippet} />
					</Step>

					{instructions.notes && <div className="border-t pt-3 text-xs">{instructions.notes}</div>}
				</div>
			)}
		</div>
	)
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
	return (
		<div>
			<div className="mb-1 font-medium">
				{n}. {title}
			</div>
			<div className="pl-4">{children}</div>
		</div>
	)
}

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false)
	const copy = () => {
		navigator.clipboard?.writeText(text).then(
			() => {
				setCopied(true)
				setTimeout(() => setCopied(false), 1500)
			},
			() => {}
		)
	}
	return (
		<Button size="sm" variant="ghost" className="mt-1" onClick={copy}>
			{copied ? "Copied" : "Copy"}
		</Button>
	)
}
