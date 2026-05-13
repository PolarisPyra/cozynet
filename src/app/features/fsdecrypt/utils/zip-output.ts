import { Zip, ZipPassThrough } from "fflate"

import type { ReadableByteSource } from "./byte-source"
import { throwIfAborted } from "./extraction-errors"
import type { NtfsExtractionWriter } from "./ntfs"
import { sanitizePathSegment } from "./presentation"

const ZIP_CHUNK_SIZE = 32 * 1024 * 1024

function zipPath(path: string[]) {
	return path.map(sanitizePathSegment).filter(Boolean).join("/")
}

export function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob)
	const link = document.createElement("a")
	link.href = url
	link.download = filename
	link.style.display = "none"
	document.body.append(link)
	link.click()
	link.remove()
	window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export function createZipWriter(
	rootFolder: string,
	getTotalBytes: () => number,
	setProgress: (progress: number) => void,
	signal: AbortSignal,
	onBytesWritten: (bytes: number) => void
): NtfsExtractionWriter & { finish: () => Promise<Blob> } {
	const chunks: Uint8Array[] = []
	const rootPath = sanitizePathSegment(rootFolder)
	const createdDirectories = new Set<string>()
	let written = 0
	let lastProgressUpdate = 0
	let zipError: Error | null = null
	let finished = false
	let finishStarted = false
	let resolveFinished: ((blob: Blob) => void) | null = null
	let rejectFinished: ((error: Error) => void) | null = null

	const finishedPromise = new Promise<Blob>((resolve, reject) => {
		resolveFinished = resolve
		rejectFinished = reject
	})

	const zip = new Zip((error, chunk, final) => {
		if (error) {
			zipError = error
			if (finishStarted) {
				rejectFinished?.(error)
			}
			return
		}

		chunks.push(chunk)
		if (final) {
			finished = true
			resolveFinished?.(new Blob(chunks, { type: "application/zip" }))
		}
	})

	const abort = () => {
		zipError = new DOMException("Extraction cancelled", "AbortError")
		zip.terminate()
		if (finishStarted) {
			rejectFinished?.(zipError)
		}
	}
	signal.addEventListener("abort", abort, { once: true })

	const throwIfZipFailed = () => {
		if (zipError) {
			throw zipError
		}
	}

	const noteBytesWritten = (bytes: number) => {
		written += bytes
		onBytesWritten(bytes)

		const now = performance.now()
		if (now - lastProgressUpdate > 250 || written >= getTotalBytes()) {
			lastProgressUpdate = now
			setProgress(Math.min(99, Math.round((written / Math.max(getTotalBytes(), 1)) * 100)))
		}
	}

	const createDirectory = async (path: string[]) => {
		throwIfAborted(signal)
		throwIfZipFailed()
		const directoryPath = zipPath([rootPath, ...path])
		if (!directoryPath || createdDirectories.has(directoryPath)) {
			return
		}

		createdDirectories.add(directoryPath)
		const entry = new ZipPassThrough(`${directoryPath}/`)
		zip.add(entry)
		entry.push(new Uint8Array(), true)
		throwIfZipFailed()
	}

	const writeFile = async (path: string[], source: ReadableByteSource) => {
		throwIfAborted(signal)
		throwIfZipFailed()
		await createDirectory(path.slice(0, -1))

		const entry = new ZipPassThrough(zipPath([rootPath, ...path]))
		zip.add(entry)

		if (source.size === 0) {
			entry.push(new Uint8Array(), true)
			throwIfZipFailed()
			return
		}

		for (let offset = 0; offset < source.size; offset += ZIP_CHUNK_SIZE) {
			throwIfAborted(signal)
			throwIfZipFailed()
			const length = Math.min(ZIP_CHUNK_SIZE, source.size - offset)
			const chunk = await source.read(offset, length)
			throwIfAborted(signal)
			entry.push(chunk, offset + length >= source.size)
			throwIfZipFailed()
			noteBytesWritten(chunk.length)
		}
	}

	const finish = async () => {
		throwIfAborted(signal)
		throwIfZipFailed()
		finishStarted = true
		try {
			zip.end()
			const blob = await finishedPromise
			if (!finished) {
				throw new Error("Could not finish ZIP archive")
			}
			return blob
		} finally {
			signal.removeEventListener("abort", abort)
		}
	}

	return {
		createDirectory,
		writeFile,
		finish
	}
}
