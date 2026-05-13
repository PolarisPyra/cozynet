import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { FileArchive, FileKey, FileUp, FolderOpen, HardDriveDownload, RotateCcw, Terminal, Zap } from "lucide-react"
import { toast } from "sonner"

import Header from "@/app/shared/components/common/header"
import { Button } from "@/app/shared/components/ui/button"
import { Progress } from "@/app/shared/components/ui/progress"
import { Separator } from "@/app/shared/components/ui/separator"
import { cn } from "@/app/shared/utils"

import { ReadableByteSource } from "../utils/byte-source"
import { extractExfatContents } from "../utils/exfat"
import { BUILT_IN_KEY_IDS, FSCRYPT_CONTAINER_TYPE, describeContainerType, openFscryptSource } from "../utils/fsdecrypt"
import { NtfsExtractionWriter, appContainersToVhdSources, extractNtfsContents } from "../utils/ntfs"
import { VhdNtfsSource, openVhdChainNtfsSource } from "../utils/vhd"

type ToolMode = "container" | "option" | "vhd"

const TOOL_MODES = [
	{ mode: "container", label: "Base APP", icon: FileArchive },
	{ mode: "option", label: "Option", icon: FileKey },
	{ mode: "vhd", label: "Merge APPs", icon: HardDriveDownload }
] as const

function modeLabel(mode: ToolMode) {
	switch (mode) {
		case "container":
			return "BASE APP"
		case "option":
			return "OPTION"
		case "vhd":
			return "MERGE APPS"
	}
}

type CompletedResult = {
	outputFilename: string
	outputSize: number
	savedToFile: boolean
	details: Array<{ label: string; value: string }>
}

type WritableFile = {
	write: (chunk: Uint8Array) => Promise<void>
	close: () => Promise<void>
}

type SavePickerWindow = Window &
	typeof globalThis & {
		showDirectoryPicker?: (options?: {
			id?: string
			mode?: "read" | "readwrite"
			startIn?: "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos"
		}) => Promise<DirectoryHandle>
	}

type DirectoryHandle = {
	name?: string
	queryPermission?: (descriptor?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>
	requestPermission?: (descriptor?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>
	getDirectoryHandle: (name: string, options?: { create?: boolean }) => Promise<DirectoryHandle>
	getFileHandle: (
		name: string,
		options?: { create?: boolean }
	) => Promise<{ createWritable: () => Promise<WritableFile> }>
}

type StoredOutputRoot = {
	id: string
	handle: DirectoryHandle
}

const OUTPUT_FOLDER_HINT =
	"Create or select an output subfolder, for example Desktop/fsdecrypt-output. Chrome blocks selecting Desktop itself."
const OUTPUT_ROOT_DB_NAME = "fsdecrypt-output-root"
const OUTPUT_ROOT_STORE_NAME = "handles"
const OUTPUT_ROOT_KEY = "current"

function formatBytes(bytes: number) {
	const units = ["B", "KB", "MB", "GB", "TB"]
	let value = bytes
	let unitIndex = 0

	while (value >= 1024 && unitIndex < units.length - 1) {
		value /= 1024
		unitIndex += 1
	}

	return `${value.toLocaleString(undefined, { maximumFractionDigits: unitIndex === 0 ? 0 : 2 })} ${units[unitIndex]}`
}

function sanitizePathSegment(name: string) {
	return Array.from(name, character => {
		const code = character.charCodeAt(0)
		return code < 32 || '<>:"/\\|?*'.includes(character) ? "_" : character
	}).join("")
}

function isProtectedDirectoryPickerError(error: unknown) {
	if (typeof DOMException === "undefined" || !(error instanceof DOMException)) {
		return false
	}

	const message = error.message.toLowerCase()
	return (
		(error.name === "AbortError" || error.name === "NotAllowedError") &&
		(message.includes("system files") ||
			message.includes("sensitive") ||
			message.includes("dangerous") ||
			message.includes("blocked"))
	)
}

function fsdecryptErrorMessage(error: unknown) {
	if (isProtectedDirectoryPickerError(error)) {
		return OUTPUT_FOLDER_HINT
	}

	return error instanceof Error ? error.message : "fsdecrypt failed"
}

function openOutputRootDb() {
	return new Promise<IDBDatabase>((resolve, reject) => {
		if (typeof indexedDB === "undefined") {
			reject(new Error("Saving output folder selection requires IndexedDB support"))
			return
		}

		const request = indexedDB.open(OUTPUT_ROOT_DB_NAME, 1)
		request.onupgradeneeded = () => {
			if (!request.result.objectStoreNames.contains(OUTPUT_ROOT_STORE_NAME)) {
				request.result.createObjectStore(OUTPUT_ROOT_STORE_NAME, { keyPath: "id" })
			}
		}
		request.onerror = () => reject(request.error ?? new Error("Could not open output folder storage"))
		request.onsuccess = () => resolve(request.result)
	})
}

async function readStoredOutputRootHandle() {
	const db = await openOutputRootDb()
	return new Promise<DirectoryHandle | null>((resolve, reject) => {
		const transaction = db.transaction(OUTPUT_ROOT_STORE_NAME, "readonly")
		const request = transaction.objectStore(OUTPUT_ROOT_STORE_NAME).get(OUTPUT_ROOT_KEY)
		request.onerror = () => reject(request.error ?? new Error("Could not read saved output folder"))
		request.onsuccess = () => resolve((request.result as StoredOutputRoot | undefined)?.handle ?? null)
		transaction.oncomplete = () => db.close()
		transaction.onerror = () => reject(transaction.error ?? new Error("Could not read saved output folder"))
	})
}

async function writeStoredOutputRootHandle(handle: DirectoryHandle) {
	const db = await openOutputRootDb()
	return new Promise<void>((resolve, reject) => {
		const transaction = db.transaction(OUTPUT_ROOT_STORE_NAME, "readwrite")
		transaction.objectStore(OUTPUT_ROOT_STORE_NAME).put({ id: OUTPUT_ROOT_KEY, handle } satisfies StoredOutputRoot)
		transaction.oncomplete = () => {
			db.close()
			resolve()
		}
		transaction.onerror = () => reject(transaction.error ?? new Error("Could not save output folder"))
	})
}

async function clearStoredOutputRootHandle() {
	const db = await openOutputRootDb()
	return new Promise<void>((resolve, reject) => {
		const transaction = db.transaction(OUTPUT_ROOT_STORE_NAME, "readwrite")
		transaction.objectStore(OUTPUT_ROOT_STORE_NAME).delete(OUTPUT_ROOT_KEY)
		transaction.oncomplete = () => {
			db.close()
			resolve()
		}
		transaction.onerror = () => reject(transaction.error ?? new Error("Could not clear saved output folder"))
	})
}

async function ensureReadwritePermission(handle: DirectoryHandle) {
	if (!handle.queryPermission || !handle.requestPermission) {
		return handle
	}

	const descriptor = { mode: "readwrite" as const }
	const currentPermission = await handle.queryPermission(descriptor)
	if (currentPermission === "granted") {
		return handle
	}

	const requestedPermission = await handle.requestPermission(descriptor)
	if (requestedPermission === "granted") {
		return handle
	}

	throw new Error("Output folder permission was not restored. Select the output folder again.")
}

function ModeToggle({ mode, onChange }: { mode: ToolMode; onChange: (mode: ToolMode) => void }) {
	const activeIndex = TOOL_MODES.findIndex(item => item.mode === mode)

	return (
		<div className="bg-muted/40 border-border/50 relative grid h-10 w-full max-w-xl grid-cols-3 gap-1 rounded-sm border p-1">
			<div
				className="bg-foreground absolute top-1 bottom-1 left-1 z-0 rounded-sm shadow-sm transition-transform duration-500"
				style={{
					width: "calc((100% - 1rem) / 3)",
					transform: `translateX(calc(${activeIndex} * (100% + 0.25rem)))`,
					transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)"
				}}
			/>
			{TOOL_MODES.map(item => {
				const Icon = item.icon
				const isActive = mode === item.mode
				return (
					<button
						key={item.mode}
						type="button"
						onClick={() => onChange(item.mode)}
						className={cn(
							"relative z-10 flex h-8 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-sm px-2 text-xs font-semibold whitespace-nowrap uppercase transition-colors duration-300 select-none",
							isActive ? "text-background" : "text-muted-foreground hover:text-foreground"
						)}
					>
						<Icon className={cn("size-3.5 shrink-0 transition-transform duration-500", isActive && "scale-110")} />
						<span className="truncate">{item.label}</span>
					</button>
				)
			})}
		</div>
	)
}

function vhdDetails(result: VhdNtfsSource) {
	return [
		{ label: "Layers", value: result.chain.length.toString() },
		{ label: "Parent", value: result.chain[0] ?? "" },
		{ label: "Child", value: result.chain[result.chain.length - 1] ?? "" },
		{ label: "NTFS Offset", value: formatBytes(result.ntfsOffset) }
	]
}

const FsdecryptPage = () => {
	const containerInputRef = useRef<HTMLInputElement>(null)
	const keyInputRef = useRef<HTMLInputElement>(null)
	const vhdInputRef = useRef<HTMLInputElement>(null)
	const terminalRef = useRef<HTMLDivElement>(null)

	const [mode, setMode] = useState<ToolMode>("container")
	const [containerFile, setContainerFile] = useState<File | null>(null)
	const [keyFile, setKeyFile] = useState<File | null>(null)
	const [vhdFiles, setVhdFiles] = useState<File[]>([])
	const [isBusy, setIsBusy] = useState(false)
	const [progress, setProgress] = useState(0)
	const [result, setResult] = useState<CompletedResult | null>(null)
	const [logs, setLogs] = useState<string[]>(["Ready"])
	const [outputRootHandle, setOutputRootHandle] = useState<DirectoryHandle | null>(null)

	useEffect(() => {
		terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight })
	}, [logs])

	const appendLog = useCallback((message: string) => {
		const timestamp = new Date().toLocaleTimeString()
		setLogs(current => [...current.slice(-180), `[${timestamp}] ${message}`])
	}, [])

	useEffect(() => {
		let cancelled = false

		readStoredOutputRootHandle()
			.then(handle => {
				if (cancelled || !handle) {
					return
				}

				setOutputRootHandle(handle)
				appendLog(`Restored output root: ${handle.name ?? "folder"}`)
			})
			.catch(error => {
				if (cancelled) {
					return
				}

				appendLog(
					error instanceof Error ? `Could not restore output root: ${error.message}` : "Could not restore output root"
				)
			})

		return () => {
			cancelled = true
		}
	}, [appendLog])

	const canRun = useMemo(() => {
		if (isBusy) return false
		return mode === "vhd" ? vhdFiles.length > 0 : Boolean(containerFile)
	}, [containerFile, isBusy, mode, vhdFiles.length])

	const clearResult = useCallback(() => {
		setResult(null)
	}, [])

	const chooseDirectoryRoot = useCallback(async () => {
		const picker = (window as SavePickerWindow).showDirectoryPicker
		if (!picker) {
			throw new Error("Saving output requires a browser with directory picker support")
		}

		appendLog("Opening output folder picker")
		appendLog(OUTPUT_FOLDER_HINT)
		const handle = await picker({ id: "fsdecrypt-output", mode: "readwrite", startIn: "desktop" })
		setOutputRootHandle(handle)
		appendLog(`Output root selected: ${handle.name ?? "folder"}`)
		void writeStoredOutputRootHandle(handle).catch(error => {
			appendLog(error instanceof Error ? `Could not save output root: ${error.message}` : "Could not save output root")
		})
		return handle
	}, [appendLog])

	const chooseOrReuseDirectoryRoot = useCallback(
		async () => (outputRootHandle ? ensureReadwritePermission(outputRootHandle) : chooseDirectoryRoot()),
		[chooseDirectoryRoot, outputRootHandle]
	)

	const createFolderWriter = useCallback(
		(rootHandle: DirectoryHandle, folderName: string, totalBytes: number): NtfsExtractionWriter => {
			let outputRoot: Promise<DirectoryHandle> | undefined
			let written = 0
			let lastProgressUpdate = 0
			const outputFolder = sanitizePathSegment(folderName)
			const useSelectedFolder = rootHandle.name === outputFolder

			const directoryFor = async (path: string[]) => {
				let current = await (outputRoot ??= useSelectedFolder
					? Promise.resolve(rootHandle)
					: rootHandle.getDirectoryHandle(outputFolder, { create: true }))
				for (const segment of path) {
					current = await current.getDirectoryHandle(segment, { create: true })
				}
				return current
			}

			const writeFile = async (path: string[], source: ReadableByteSource) => {
				const directory = await directoryFor(path.slice(0, -1))
				const fileHandle = await directory.getFileHandle(path[path.length - 1], { create: true })
				const writable = await fileHandle.createWritable()
				try {
					for (let offset = 0; offset < source.size; offset += 8 * 1024 * 1024) {
						const chunk = await source.read(offset, Math.min(8 * 1024 * 1024, source.size - offset))
						await writable.write(chunk)
						written += chunk.length
						const now = performance.now()
						if (now - lastProgressUpdate > 250 || offset + chunk.length >= source.size) {
							lastProgressUpdate = now
							setProgress(Math.min(99, Math.round((written / Math.max(totalBytes, 1)) * 100)))
						}
					}
				} finally {
					await writable.close()
				}
			}

			return {
				createDirectory: async path => {
					await directoryFor(path)
				},
				writeFile
			}
		},
		[]
	)

	const extractSourceToFolder = useCallback(
		async (rootHandle: DirectoryHandle, ntfsSource: VhdNtfsSource, folderName: string): Promise<CompletedResult> => {
			const writer = createFolderWriter(rootHandle, folderName, ntfsSource.size)
			const extracted = await extractNtfsContents(ntfsSource, writer, { onLog: appendLog })
			return {
				outputFilename: folderName,
				outputSize: extracted.bytes,
				savedToFile: true,
				details: [
					...vhdDetails(ntfsSource),
					{ label: "Files", value: extracted.files.toLocaleString() },
					{ label: "Folders", value: extracted.directories.toLocaleString() },
					{ label: "Saved", value: "Folder" }
				]
			}
		},
		[appendLog, createFolderWriter]
	)

	const handleRun = useCallback(async () => {
		if (!canRun) return

		setIsBusy(true)
		setProgress(0)
		setLogs([])
		clearResult()

		try {
			appendLog(
				mode === "container"
					? "Starting BASE APP extract"
					: mode === "option"
						? "Starting OPTION extract"
						: "Starting MERGE PARENT AND CHILD APPs"
			)
			if (mode === "container") {
				if (!containerFile) return
				const rootHandle = await chooseOrReuseDirectoryRoot()
				const [internalVhd] = await appContainersToVhdSources([containerFile], {
					keyFile: keyFile ?? undefined,
					onLog: appendLog
				})
				const ntfsSource = await openVhdChainNtfsSource([internalVhd], { onLog: appendLog })
				const completed = await extractSourceToFolder(
					rootHandle,
					ntfsSource,
					containerFile.name.replace(/\.[^.]+$/, "")
				)
				setResult(completed)
				toast.success("BASE APP extracted")
			} else if (mode === "option") {
				if (!containerFile) return
				const rootHandle = await chooseOrReuseDirectoryRoot()
				const exfatSource = await openFscryptSource(containerFile, {
					expectedContainerType: FSCRYPT_CONTAINER_TYPE.OPTION,
					keyFile: keyFile ?? undefined,
					onLog: appendLog
				})
				const folderName = exfatSource.outputFilename.replace(/\.[^.]+$/, "")
				const writer = createFolderWriter(rootHandle, folderName, exfatSource.size)
				const extracted = await extractExfatContents(exfatSource, writer, { onLog: appendLog })
				const completed = {
					outputFilename: folderName,
					outputSize: extracted.bytes,
					savedToFile: true,
					details: [
						{ label: "Type", value: describeContainerType(exfatSource.bootId.containerType) },
						{ label: "Game", value: exfatSource.bootId.gameId },
						{ label: "Option", value: exfatSource.bootId.targetOption },
						{ label: "Files", value: extracted.files.toLocaleString() },
						{ label: "Folders", value: extracted.directories.toLocaleString() },
						{ label: "Saved", value: "Folder" }
					]
				}
				setResult(completed)
				toast.success("OPTION extracted")
			} else {
				const rootHandle = await chooseOrReuseDirectoryRoot()
				const appFiles = vhdFiles.filter(file => file.name.toLowerCase().endsWith(".app"))
				const rawVhdFiles = vhdFiles.filter(file => !file.name.toLowerCase().endsWith(".app"))
				const appVhds =
					appFiles.length > 0
						? await appContainersToVhdSources(appFiles, { keyFile: keyFile ?? undefined, onLog: appendLog })
						: []
				const ntfsSource = await openVhdChainNtfsSource([...rawVhdFiles, ...appVhds], { onLog: appendLog })
				const topAppVhd = appVhds.length > 0 ? appVhds[appVhds.length - 1] : undefined
				const topRawVhd = rawVhdFiles.length > 0 ? rawVhdFiles[rawVhdFiles.length - 1] : undefined
				const topInputName = topAppVhd?.appName ?? topRawVhd?.name ?? ntfsSource.name
				const completed = await extractSourceToFolder(rootHandle, ntfsSource, topInputName.replace(/\.[^.]+$/, ""))
				setResult(completed)
				toast.success("MERGE PARENT AND CHILD APPs extracted")
			}
			setProgress(100)
		} catch (error) {
			console.error("fsdecrypt tool failed", error)
			const message = fsdecryptErrorMessage(error)
			appendLog(`ERROR: ${message}`)
			toast.error(message)
		} finally {
			setIsBusy(false)
		}
	}, [
		appendLog,
		canRun,
		clearResult,
		containerFile,
		createFolderWriter,
		extractSourceToFolder,
		chooseOrReuseDirectoryRoot,
		keyFile,
		mode,
		vhdFiles
	])

	const handleReset = useCallback(() => {
		setContainerFile(null)
		setKeyFile(null)
		setVhdFiles([])
		setProgress(0)
		setLogs(["Ready"])
		setOutputRootHandle(null)
		void clearStoredOutputRootHandle().catch(error => {
			appendLog(
				error instanceof Error
					? `Could not clear saved output root: ${error.message}`
					: "Could not clear saved output root"
			)
		})
		clearResult()
		if (containerInputRef.current) containerInputRef.current.value = ""
		if (keyInputRef.current) keyInputRef.current.value = ""
		if (vhdInputRef.current) vhdInputRef.current.value = ""
	}, [appendLog, clearResult])

	const primaryLabel = "Extract"
	const selectedFiles = mode === "vhd" ? vhdFiles : containerFile ? [containerFile] : []
	const keyLabel = keyFile?.name ?? (mode === "option" ? "Option built-in" : "Built-in")
	const outputLabel = outputRootHandle?.name ?? "Select subfolder"

	return (
		<div className="relative flex-1 overflow-auto">
			<Header title="fsdecrypt" />
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 sm:px-6 sm:py-0">
				<section className="bg-card text-card-foreground rounded-sm border">
					<div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
						<ModeToggle
							mode={mode}
							onChange={next => {
								setMode(next)
								clearResult()
							}}
						/>

						<div className="flex flex-wrap gap-2">
							<Button onClick={handleRun} disabled={!canRun}>
								<Zap />
								{primaryLabel}
							</Button>
							<Button variant="outline" onClick={handleReset} disabled={isBusy}>
								<RotateCcw />
								Reset
							</Button>
						</div>
					</div>

					<div className="grid gap-4 p-4 xl:grid-cols-[22rem_1fr_20rem]">
						<div className="space-y-3">
							<input
								ref={containerInputRef}
								className="hidden"
								type="file"
								accept={mode === "option" ? ".opt,application/octet-stream" : ".app,application/octet-stream"}
								onChange={event => {
									setContainerFile(event.target.files?.[0] ?? null)
									clearResult()
								}}
							/>
							<input
								ref={keyInputRef}
								className="hidden"
								type="file"
								accept=".bin,application/octet-stream"
								onChange={event => {
									setKeyFile(event.target.files?.[0] ?? null)
									clearResult()
								}}
							/>
							<input
								ref={vhdInputRef}
								className="hidden"
								type="file"
								accept=".app,.vhd,application/octet-stream"
								multiple
								onChange={event => {
									setVhdFiles(Array.from(event.target.files ?? []))
									clearResult()
								}}
							/>

							{mode !== "vhd" ? (
								<>
									<Button
										type="button"
										variant="outline"
										className="h-12 w-full justify-start rounded-sm"
										disabled={isBusy}
										onClick={() => containerInputRef.current?.click()}
									>
										<FileUp />
										{mode === "option" ? "Choose Option" : "Choose Base APP"}
									</Button>
									{(mode === "container" || mode === "option") && (
										<Button
											type="button"
											variant="outline"
											className="h-12 w-full justify-start rounded-sm"
											disabled={isBusy}
											onClick={() => keyInputRef.current?.click()}
										>
											<FileKey />
											Choose Key
										</Button>
									)}
								</>
							) : (
								<>
									<Button
										type="button"
										variant="outline"
										className="h-12 w-full justify-start rounded-sm"
										disabled={isBusy}
										onClick={() => vhdInputRef.current?.click()}
									>
										<HardDriveDownload />
										Choose APPs
									</Button>
									<Button
										type="button"
										variant="outline"
										className="h-12 w-full justify-start rounded-sm"
										disabled={isBusy}
										onClick={() => keyInputRef.current?.click()}
									>
										<FileKey />
										Choose Key
									</Button>
								</>
							)}
							<Button
								type="button"
								variant="outline"
								className="h-12 w-full justify-start rounded-sm"
								disabled={isBusy}
								onClick={() => {
									void chooseDirectoryRoot().catch(error => {
										const message = fsdecryptErrorMessage(error)
										appendLog(`ERROR: ${message}`)
										toast.error(message)
									})
								}}
							>
								<FolderOpen />
								Output Folder
							</Button>

							<div className="bg-background/60 rounded-sm border p-3">
								<div className="text-muted-foreground text-xs">Selected</div>
								<div className="mt-2 space-y-2">
									{selectedFiles.length === 0 ? (
										<div className="text-muted-foreground text-sm">None</div>
									) : (
										selectedFiles.map(file => (
											<div key={`${file.name}-${file.size}`} className="min-w-0">
												<div className="truncate text-sm font-medium">{file.name}</div>
												<div className="text-muted-foreground text-xs">{formatBytes(file.size)}</div>
											</div>
										))
									)}
								</div>
								<Separator className="my-3" />
								<div className="text-muted-foreground text-xs">Key</div>
								<div className="mt-1 truncate text-sm font-medium">{keyLabel}</div>
								<Separator className="my-3" />
								<div className="text-muted-foreground text-xs">Output Root</div>
								<div className="mt-1 truncate text-sm font-medium">{outputLabel}</div>
							</div>
						</div>

						<div className="bg-background/40 flex min-h-72 flex-col rounded-sm border">
							<div className="grid gap-3 p-4 sm:grid-cols-3">
								<div>
									<div className="text-muted-foreground text-xs">Mode</div>
									<div className="font-medium">{modeLabel(mode)}</div>
								</div>
								<div>
									<div className="text-muted-foreground text-xs">Files</div>
									<div className="font-medium">{selectedFiles.length}</div>
								</div>
								<div>
									<div className="text-muted-foreground text-xs">Output</div>
									<div className={cn("truncate font-medium", !result && "text-muted-foreground")}>
										{result?.outputFilename ?? "Pending"}
									</div>
								</div>
							</div>

							<Separator />

							<div className="flex flex-1 flex-col justify-between gap-4 p-4">
								{(isBusy || progress > 0) && (
									<div className="space-y-2">
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">Progress</span>
											<span className="font-medium">{progress}%</span>
										</div>
										<Progress value={progress} />
									</div>
								)}

								{result ? (
									<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
										{result.details.map(item => (
											<div key={item.label}>
												<div className="text-muted-foreground text-xs">{item.label}</div>
												<div className="truncate font-medium">{item.value}</div>
											</div>
										))}
										<div>
											<div className="text-muted-foreground text-xs">Size</div>
											<div className="font-medium">{formatBytes(result.outputSize)}</div>
										</div>
									</div>
								) : (
									<div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">Ready</div>
								)}
							</div>
						</div>

						<div className="bg-background/40 rounded-sm border">
							<div className="border-b p-3 text-sm font-medium">Built-in keys</div>
							<div className="grid max-h-72 grid-cols-4 gap-1 overflow-auto p-3 xl:grid-cols-3">
								{BUILT_IN_KEY_IDS.map(keyId => (
									<div key={keyId} className="bg-muted/40 rounded-sm px-2 py-1 text-center font-mono text-xs">
										{keyId}
									</div>
								))}
							</div>
						</div>
					</div>
				</section>

				<section className="bg-card text-card-foreground rounded-sm border">
					<div className="flex items-center gap-2 border-b p-3 text-sm font-medium">
						<Terminal className="size-4" />
						Log
					</div>
					<div ref={terminalRef} className="h-56 overflow-auto bg-black p-3 font-mono text-xs text-green-300">
						{logs.map((line, index) => (
							<div key={`${line}-${index}`} className="whitespace-pre-wrap">
								{line}
							</div>
						))}
					</div>
				</section>
			</div>
		</div>
	)
}

export default FsdecryptPage
