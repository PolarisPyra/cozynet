import { useCallback, useEffect, useState } from "react"

import { Download, FileUp, RefreshCw, ShieldAlert } from "lucide-react"
import { toast } from "sonner"

import {
	binToHex,
	decodeIcfEntries,
	decryptIcf,
	encodeIcfEntries,
	encryptIcf,
	getIcfSanityError,
	hexToBin,
	inferIcfFilename,
	xxdDecode,
	xxdEncode
} from "@/app/features/admin/utils/icf"
import { Button } from "@/app/shared/components/ui/button"
import { Input } from "@/app/shared/components/ui/input"
import { Switch } from "@/app/shared/components/ui/switch"
import { Textarea } from "@/app/shared/components/ui/textarea"

const EMPTY_DATA = new Uint8Array(0x40)
const STORAGE_KEY = "admin-icf-editor"

type EditorState = {
	data: Uint8Array
	entries: string[]
	error: string
}

function cloneData(data: Uint8Array) {
	return new Uint8Array(data)
}

function getInitialState(): EditorState {
	if (typeof window === "undefined") {
		return { data: cloneData(EMPTY_DATA), entries: ["SXXXACA0"], error: "" }
	}

	const stored = window.localStorage.getItem(STORAGE_KEY)
	if (!stored) {
		return { data: cloneData(EMPTY_DATA), entries: ["SXXXACA0"], error: "" }
	}

	const bytes = hexToBin(stored)
	if (!bytes) {
		return { data: cloneData(EMPTY_DATA), entries: ["SXXXACA0"], error: "Saved ICF state invalid" }
	}

	return {
		data: bytes,
		entries: decodeIcfEntries(bytes),
		error: getIcfSanityError(bytes) ?? ""
	}
}

export const IcfEditor = function () {
	const [state, setState] = useState<EditorState>(() => getInitialState())
	const [dumpValue, setDumpValue] = useState("")
	const [isBusy, setIsBusy] = useState(false)
	const [showDecryptedDump, setShowDecryptedDump] = useState(true)

	const persist = useCallback((data: Uint8Array) => {
		window.localStorage.setItem(STORAGE_KEY, binToHex(data))
	}, [])

	const importData = useCallback(
		(data: Uint8Array) => {
			const next = cloneData(data)
			setState({
				data: next,
				entries: decodeIcfEntries(next),
				error: getIcfSanityError(next) ?? ""
			})
			persist(next)
		},
		[persist]
	)

	useEffect(() => {
		let cancelled = false

		async function renderDump() {
			if (showDecryptedDump) {
				if (!cancelled) {
					setDumpValue(xxdEncode(state.data))
				}
				return
			}

			const encrypted = await encryptIcf(state.data)
			if (!cancelled) {
				setDumpValue(xxdEncode(encrypted ?? state.data))
			}
		}

		void renderDump()

		return () => {
			cancelled = true
		}
	}, [showDecryptedDump, state.data])

	const loadFromBytes = useCallback(
		async (bytes: Uint8Array) => {
			const directError = getIcfSanityError(bytes)
			if (!directError) {
				importData(bytes)
				return
			}

			const decrypted = await decryptIcf(bytes)
			if (decrypted && !getIcfSanityError(decrypted)) {
				importData(decrypted)
				toast.success("Encrypted ICF loaded")
				return
			}

			setState(current => ({ ...current, error: directError }))
		},
		[importData]
	)

	const handleFile = useCallback(
		async (file: File) => {
			setIsBusy(true)
			try {
				const buffer = await file.slice(0, 0x2800).arrayBuffer()
				await loadFromBytes(new Uint8Array(buffer))
			} catch (error) {
				console.error("Failed to load ICF file", error)
				toast.error("Failed to load ICF file")
			} finally {
				setIsBusy(false)
			}
		},
		[loadFromBytes]
	)

	const handleEntriesChange = useCallback(
		(value: string) => {
			const entries = value
				.split("\n")
				.map(line => line.trim())
				.filter((line, index, lines) => index < lines.length - 1 || line.length > 0)

			if (entries.length === 0) {
				entries.push("")
			}

			const encoded = encodeIcfEntries(entries, state.data)
			if (typeof encoded[0] === "string") {
				setState(current => ({
					...current,
					entries,
					error: encoded[0] as string
				}))
				return
			}

			const nextData = cloneData(encoded[0] as Uint8Array)
			setState({
				data: nextData,
				entries,
				error: ""
			})
			persist(nextData)
		},
		[persist, state.data]
	)

	const handleDumpChange = useCallback(
		async (value: string) => {
			setDumpValue(value)
			const decoded = xxdDecode(value)
			if (!decoded) {
				setState(current => ({ ...current, error: "Malformed Hex Dump" }))
				return
			}

			let data = decoded
			if (!showDecryptedDump) {
				const decrypted = await decryptIcf(decoded)
				if (!decrypted) {
					setState(current => ({ ...current, error: "Malformed Hex Dump" }))
					return
				}
				data = decrypted
			} else if (getIcfSanityError(decoded)) {
				const decrypted = await decryptIcf(decoded)
				if (decrypted && !getIcfSanityError(decrypted)) {
					data = decrypted
				}
			}

			setState({
				data: cloneData(data),
				entries: decodeIcfEntries(data),
				error: getIcfSanityError(data) ?? ""
			})
		},
		[showDecryptedDump]
	)

	const handleDumpBlur = useCallback(() => {
		if (!state.error) {
			persist(state.data)
		}
	}, [persist, state.data, state.error])

	const handleSave = useCallback(async () => {
		setIsBusy(true)
		try {
			const encrypted = await encryptIcf(state.data)
			if (!encrypted) {
				toast.error("Failed to encrypt ICF")
				return
			}

			const name = inferIcfFilename(state.data) ?? "ICF1"
			const url = URL.createObjectURL(new Blob([encrypted], { type: "application/octet-stream" }))
			const link = document.createElement("a")
			link.href = url
			link.download = name
			document.body.appendChild(link)
			link.click()
			link.remove()
			URL.revokeObjectURL(url)
		} catch (error) {
			console.error("Failed to save ICF", error)
			toast.error("Failed to save ICF")
		} finally {
			setIsBusy(false)
		}
	}, [state.data])

	const handleReset = useCallback(() => {
		window.localStorage.removeItem(STORAGE_KEY)
		setState({ data: cloneData(EMPTY_DATA), entries: ["SXXXACA0"], error: "" })
	}, [])

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<h2 className="text-primary text-xl font-semibold">ICF Editor</h2>
					<p className="text-muted-foreground text-sm">
						Load ICF, edit entry names, inspect dump, export encrypted output.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm">
						<FileUp className="h-4 w-4" />
						<span>Load ICF</span>
						<Input
							type="file"
							accept="*/*"
							className="hidden"
							onChange={event => {
								const file = event.target.files?.[0]
								if (file) {
									void handleFile(file)
								}
								event.target.value = ""
							}}
						/>
					</label>
					<Button variant="outline" onClick={() => void handleSave()} disabled={Boolean(state.error) || isBusy}>
						<Download className="h-4 w-4" />
						Save ICF
					</Button>
					<Button variant="outline" onClick={handleReset} disabled={isBusy}>
						<RefreshCw className="h-4 w-4" />
						Clear
					</Button>
				</div>
			</div>

			<div className="flex items-center gap-3">
				<Switch checked={showDecryptedDump} onCheckedChange={setShowDecryptedDump} />
				<div>
					<p className="text-sm font-medium">Show decrypted dump</p>
					<p className="text-muted-foreground text-xs">Turn off when editing encrypted xxd directly.</p>
				</div>
			</div>

			{state.error ? (
				<div className="border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-2 rounded-sm border px-3 py-2 text-sm">
					<ShieldAlert className="h-4 w-4" />
					<span>{state.error}</span>
				</div>
			) : null}

			<div className="grid gap-6 xl:grid-cols-2">
				<div className="space-y-2">
					<p className="text-sm font-medium">Entries</p>
					<Textarea
						value={state.entries.join("\n")}
						onChange={event => handleEntriesChange(event.target.value)}
						className="min-h-[32rem] font-mono text-xs"
						spellCheck={false}
					/>
				</div>
				<div className="space-y-2">
					<p className="text-sm font-medium">Hex Dump</p>
					<Textarea
						value={dumpValue}
						onChange={event => void handleDumpChange(event.target.value)}
						onBlur={handleDumpBlur}
						className="min-h-[32rem] font-mono text-xs"
						spellCheck={false}
					/>
				</div>
			</div>
		</div>
	)
}
