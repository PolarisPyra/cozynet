import { type ChangeEvent, useCallback, useEffect, useRef, useState } from "react"

import { RotateCcw, X, Zap } from "lucide-react"
import { toast } from "sonner"

import Header from "@/app/shared/components/common/header"
import { Button } from "@/app/shared/components/ui/button"

import { BuiltInKeysPanel, ControlPanel, LogPanel, ModeToggle, WorkspacePanel } from "../components/fsdecrypt-panels"
import { CompletedResult, Detail, DirectoryHandle, RunStats, SavePickerWindow, ToolMode } from "../types"
import { extractExfatContents } from "../utils/exfat"
import { OUTPUT_FOLDER_HINT, fsdecryptErrorMessage, isAbortError, throwIfAborted } from "../utils/extraction-errors"
import { FSCRYPT_CONTAINER_TYPE, describeContainerType, openFscryptSource } from "../utils/fsdecrypt"
import { appContainersToVhdSources, extractNtfsContents } from "../utils/ntfs"
import {
	clearStoredOutputRootHandle,
	createFolderWriter,
	ensureReadwritePermission,
	prepareOutputDirectory,
	readStoredOutputRootHandle,
	writeStoredOutputRootHandle
} from "../utils/output-directory"
import { formatDuration, modeLabel, stripExtension, vhdDetails } from "../utils/presentation"
import { VhdNtfsSource, openVhdChainNtfsSource } from "../utils/vhd"

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
	const [runStats, setRunStats] = useState<RunStats>({ elapsedMs: 0, bytesWritten: 0, totalBytes: 0 })
	const [logs, setLogs] = useState<string[]>(["Ready"])
	const [result, setResult] = useState<CompletedResult | null>(null)
	const [outputRootHandle, setOutputRootHandle] = useState<DirectoryHandle | null>(null)
	const abortControllerRef = useRef<AbortController | null>(null)
	const runStartedAtRef = useRef(0)

	useEffect(() => {
		terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight })
	}, [logs])

	useEffect(() => {
		if (!isBusy) return

		const interval = window.setInterval(() => {
			setRunStats(current => ({ ...current, elapsedMs: performance.now() - runStartedAtRef.current }))
		}, 250)

		return () => window.clearInterval(interval)
	}, [isBusy])

	const appendLog = useCallback((message: string) => {
		const timestamp = new Date().toLocaleTimeString()
		setLogs(current => [...current.slice(-220), `[${timestamp}] ${message}`])
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

	const selectedFiles = mode === "vhd" ? vhdFiles : containerFile ? [containerFile] : []
	const canRun = !isBusy && (mode === "vhd" ? vhdFiles.length > 0 : Boolean(containerFile))
	const keyLabel = keyFile?.name ?? (mode === "option" ? " Built-in" : "Built-in")
	const outputLabel = outputRootHandle?.name ?? "Select subfolder"

	const clearResult = useCallback(() => {
		setResult(null)
	}, [])

	const handleModeChange = useCallback(
		(next: ToolMode) => {
			setMode(next)
			clearResult()
		},
		[clearResult]
	)

	const handleContainerChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			setContainerFile(event.target.files?.[0] ?? null)
			clearResult()
		},
		[clearResult]
	)

	const handleKeyChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			setKeyFile(event.target.files?.[0] ?? null)
			clearResult()
		},
		[clearResult]
	)

	const handleVhdChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			setVhdFiles(Array.from(event.target.files ?? []))
			clearResult()
		},
		[clearResult]
	)

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

	const handleChooseOutput = useCallback(() => {
		void chooseDirectoryRoot().catch(error => {
			const message = fsdecryptErrorMessage(error)
			appendLog(`ERROR: ${message}`)
			toast.error(message)
		})
	}, [appendLog, chooseDirectoryRoot])

	const handleCancel = useCallback(() => {
		abortControllerRef.current?.abort()
		appendLog("Cancelling extraction...")
	}, [appendLog])

	const extractNtfsSource = useCallback(
		async (
			rootHandle: DirectoryHandle,
			ntfsSource: VhdNtfsSource,
			folderName: string,
			getExtraDetails: () => Detail[],
			signal: AbortSignal,
			onBytesWritten: (bytes: number) => void
		): Promise<CompletedResult> => {
			const { outputFolder, outputRoot } = await prepareOutputDirectory(rootHandle, folderName)
			let totalBytes = 1
			const writer = createFolderWriter(outputRoot, () => totalBytes, setProgress, signal, onBytesWritten)
			const extracted = await extractNtfsContents(ntfsSource, writer, {
				onLog: appendLog,
				onTotalBytes: bytes => {
					totalBytes = bytes
					setRunStats(current => ({ ...current, totalBytes: bytes }))
				},
				signal
			})

			return {
				outputFolder,
				outputSize: extracted.bytes,
				details: [
					...getExtraDetails(),
					...vhdDetails(ntfsSource),
					{ label: "Files", value: extracted.files.toLocaleString() },
					{ label: "Folders", value: extracted.directories.toLocaleString() }
				]
			}
		},
		[appendLog]
	)

	const handleRun = useCallback(async () => {
		if (!canRun) return

		const abortController = new AbortController()
		abortControllerRef.current = abortController
		runStartedAtRef.current = performance.now()
		setIsBusy(true)
		setProgress(0)
		setRunStats({ elapsedMs: 0, bytesWritten: 0, totalBytes: 0 })
		setLogs([])
		clearResult()

		const elapsedDetails = (): Detail[] => {
			const ms = performance.now() - runStartedAtRef.current
			const value = formatDuration(ms)
			return [{ label: "Elapsed", value }]
		}
		const noteBytesWritten = (bytes: number) => {
			setRunStats(current => ({
				...current,
				bytesWritten: current.bytesWritten + bytes,
				elapsedMs: performance.now() - runStartedAtRef.current
			}))
		}

		try {
			appendLog(`Starting ${modeLabel(mode)} extract`)
			const rootHandle = await chooseOrReuseDirectoryRoot()

			if (mode === "container") {
				if (!containerFile) return
				throwIfAborted(abortController.signal)
				const [internalVhd] = await appContainersToVhdSources([containerFile], {
					keyFile: keyFile ?? undefined,
					onLog: appendLog
				})
				throwIfAborted(abortController.signal)
				const ntfsSource = await openVhdChainNtfsSource([internalVhd], { onLog: appendLog })
				setResult(
					await extractNtfsSource(
						rootHandle,
						ntfsSource,
						stripExtension(containerFile.name),
						elapsedDetails,
						abortController.signal,
						noteBytesWritten
					)
				)
				toast.success("BASE APP extracted")
			} else if (mode === "option") {
				if (!containerFile) return
				throwIfAborted(abortController.signal)
				const exfatSource = await openFscryptSource(containerFile, {
					expectedContainerType: FSCRYPT_CONTAINER_TYPE.OPTION,
					keyFile: keyFile ?? undefined,
					onLog: appendLog
				})
				const folderName = stripExtension(exfatSource.outputFilename)
				const { outputFolder, outputRoot } = await prepareOutputDirectory(rootHandle, folderName)
				let totalBytes = exfatSource.size
				setRunStats(current => ({ ...current, totalBytes }))
				const writer = createFolderWriter(
					outputRoot,
					() => totalBytes,
					setProgress,
					abortController.signal,
					noteBytesWritten
				)
				const extracted = await extractExfatContents(exfatSource, writer, {
					onLog: appendLog,
					onTotalBytes: bytes => {
						totalBytes = bytes
						setRunStats(current => ({ ...current, totalBytes: bytes }))
					},
					signal: abortController.signal
				})

				setResult({
					outputFolder,
					outputSize: extracted.bytes,
					details: [
						...elapsedDetails(),
						{ label: "Type", value: describeContainerType(exfatSource.bootId.containerType) },
						{ label: "Game", value: exfatSource.bootId.gameId },
						{ label: "Option", value: exfatSource.bootId.targetOption },
						{ label: "Files", value: extracted.files.toLocaleString() },
						{ label: "Folders", value: extracted.directories.toLocaleString() }
					]
				})
				toast.success("OPTION extracted")
			} else {
				throwIfAborted(abortController.signal)
				const appFiles = vhdFiles.filter(file => file.name.toLowerCase().endsWith(".app"))
				const rawVhdFiles = vhdFiles.filter(file => !file.name.toLowerCase().endsWith(".app"))
				const appVhds =
					appFiles.length > 0
						? await appContainersToVhdSources(appFiles, { keyFile: keyFile ?? undefined, onLog: appendLog })
						: []
				throwIfAborted(abortController.signal)
				const ntfsSource = await openVhdChainNtfsSource([...rawVhdFiles, ...appVhds], { onLog: appendLog })
				const topAppVhd = appVhds.length > 0 ? appVhds[appVhds.length - 1] : undefined
				const topRawVhd = rawVhdFiles.length > 0 ? rawVhdFiles[rawVhdFiles.length - 1] : undefined
				const topInputName = topAppVhd?.appName ?? topRawVhd?.name ?? ntfsSource.name

				setResult(
					await extractNtfsSource(
						rootHandle,
						ntfsSource,
						stripExtension(topInputName),
						elapsedDetails,
						abortController.signal,
						noteBytesWritten
					)
				)
				toast.success("MERGE APPS extracted")
			}

			setProgress(100)
			appendLog("Done")
		} catch (error) {
			console.error("fsdecrypt tool failed", error)
			if (isAbortError(error)) {
				setProgress(0)
				appendLog("Cancelled")
				toast.info("Extraction cancelled")
			} else {
				const message = fsdecryptErrorMessage(error)
				appendLog(`ERROR: ${message}`)
				toast.error(message)
			}
		} finally {
			abortControllerRef.current = null
			setIsBusy(false)
		}
	}, [
		appendLog,
		canRun,
		chooseOrReuseDirectoryRoot,
		clearResult,
		containerFile,
		extractNtfsSource,
		keyFile,
		mode,
		vhdFiles
	])

	const handleReset = useCallback(() => {
		setContainerFile(null)
		setKeyFile(null)
		setVhdFiles([])
		setProgress(0)
		setRunStats({ elapsedMs: 0, bytesWritten: 0, totalBytes: 0 })
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

	return (
		<div className="relative flex-1 overflow-auto">
			<Header title="fsdecrypt" />
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 sm:px-6 sm:py-0">
				<section className="bg-card text-card-foreground rounded-sm border">
					<div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
						<ModeToggle mode={mode} onChange={handleModeChange} />

						<div className="flex flex-wrap gap-2">
							<Button onClick={handleRun} disabled={!canRun}>
								<Zap />
								Extract
							</Button>
							{isBusy ? (
								<Button variant="outline" onClick={handleCancel}>
									<X />
									Cancel
								</Button>
							) : (
								<Button variant="outline" onClick={handleReset}>
									<RotateCcw />
									Reset
								</Button>
							)}
						</div>
					</div>

					<div className="grid gap-4 p-4 xl:grid-cols-[22rem_minmax(0,1fr)_20rem]">
						<ControlPanel
							containerInputRef={containerInputRef}
							keyInputRef={keyInputRef}
							vhdInputRef={vhdInputRef}
							mode={mode}
							isBusy={isBusy}
							keyLabel={keyLabel}
							outputLabel={outputLabel}
							selectedFiles={selectedFiles}
							onChooseOutput={handleChooseOutput}
							onContainerChange={handleContainerChange}
							onKeyChange={handleKeyChange}
							onVhdChange={handleVhdChange}
						/>
						<WorkspacePanel
							mode={mode}
							isBusy={isBusy}
							progress={progress}
							runStats={runStats}
							result={result}
							selectedFileCount={selectedFiles.length}
						/>
						<BuiltInKeysPanel />
					</div>
				</section>

				<LogPanel logs={logs} terminalRef={terminalRef} />
			</div>
		</div>
	)
}

export default FsdecryptPage
