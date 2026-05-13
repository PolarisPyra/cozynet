import { DirectoryHandle, StoredOutputRoot } from "../types"
import { ReadableByteSource } from "./byte-source"
import { abortError, throwIfAborted } from "./extraction-errors"
import { NtfsExtractionWriter } from "./ntfs"
import { sanitizePathSegment } from "./presentation"

const WRITE_CHUNK_SIZE = 32 * 1024 * 1024
const OUTPUT_ROOT_DB_NAME = "fsdecrypt-output-root"
const OUTPUT_ROOT_STORE_NAME = "handles"
const OUTPUT_ROOT_KEY = "current"

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

export async function readStoredOutputRootHandle() {
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

export async function writeStoredOutputRootHandle(handle: DirectoryHandle) {
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

export async function clearStoredOutputRootHandle() {
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

export async function ensureReadwritePermission(handle: DirectoryHandle) {
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

async function directoryExists(rootHandle: DirectoryHandle, name: string) {
	try {
		await rootHandle.getDirectoryHandle(name)
		return true
	} catch {
		return false
	}
}

function promptOverwriteMode(folderName: string) {
	const response = window
		.prompt(
			`Output folder "${folderName}" already exists.\n\nType "replace" to delete it first, "merge" to keep it and overwrite matching files, or "cancel" to stop.`,
			"merge"
		)
		?.trim()
		.toLowerCase()

	if (!response || response === "cancel") {
		return null
	}

	if (response === "replace" || response === "merge") {
		return response
	}

	throw new Error('Choose "replace", "merge", or "cancel" for the existing output folder.')
}

export async function prepareOutputDirectory(rootHandle: DirectoryHandle, folderName: string) {
	const outputFolder = sanitizePathSegment(folderName)
	if (rootHandle.name === outputFolder) {
		return { outputFolder, outputRoot: rootHandle }
	}

	if (await directoryExists(rootHandle, outputFolder)) {
		const mode = promptOverwriteMode(outputFolder)
		if (!mode) {
			throw abortError()
		}

		if (mode === "replace") {
			if (!rootHandle.removeEntry) {
				throw new Error("This browser cannot replace existing folders. Choose merge or delete the folder manually.")
			}
			await rootHandle.removeEntry(outputFolder, { recursive: true })
		}
	}

	return {
		outputFolder,
		outputRoot: await rootHandle.getDirectoryHandle(outputFolder, { create: true })
	}
}

export function createFolderWriter(
	outputRoot: DirectoryHandle,
	getTotalBytes: () => number,
	setProgress: (progress: number) => void,
	signal: AbortSignal,
	onBytesWritten: (bytes: number) => void
): NtfsExtractionWriter {
	let written = 0
	let lastProgressUpdate = 0

	const directoryFor = async (path: string[]) => {
		const safePath = path.map(sanitizePathSegment)
		let current = outputRoot

		for (const segment of safePath) {
			throwIfAborted(signal)
			current = await current.getDirectoryHandle(segment, { create: true })
		}

		return current
	}

	const writeFile = async (path: string[], source: ReadableByteSource) => {
		throwIfAborted(signal)
		const directory = await directoryFor(path.slice(0, -1))
		const fileHandle = await directory.getFileHandle(sanitizePathSegment(path[path.length - 1]), { create: true })
		const writable = await fileHandle.createWritable()

		try {
			for (let offset = 0; offset < source.size; offset += WRITE_CHUNK_SIZE) {
				throwIfAborted(signal)
				const chunk = await source.read(offset, Math.min(WRITE_CHUNK_SIZE, source.size - offset))
				throwIfAborted(signal)
				await writable.write(chunk)
				written += chunk.length
				onBytesWritten(chunk.length)

				const now = performance.now()
				if (now - lastProgressUpdate > 250 || offset + chunk.length >= source.size) {
					lastProgressUpdate = now
					setProgress(Math.min(99, Math.round((written / Math.max(getTotalBytes(), 1)) * 100)))
				}
			}
		} finally {
			await writable.close()
		}
	}

	return {
		createDirectory: path => {
			throwIfAborted(signal)
			return directoryFor(path).then(() => undefined)
		},
		writeFile
	}
}
