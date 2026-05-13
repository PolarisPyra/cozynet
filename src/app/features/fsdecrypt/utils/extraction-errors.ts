export const OUTPUT_FOLDER_HINT =
	"Create or select an output subfolder, for example Desktop/fsdecrypt-output. Chrome blocks selecting Desktop itself."

export function abortError() {
	return new DOMException("Extraction cancelled", "AbortError")
}

export function throwIfAborted(signal: AbortSignal) {
	if (signal.aborted) {
		throw abortError()
	}
}

export function isAbortError(error: unknown) {
	return error instanceof DOMException && error.name === "AbortError"
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

export function fsdecryptErrorMessage(error: unknown) {
	if (isProtectedDirectoryPickerError(error)) {
		return OUTPUT_FOLDER_HINT
	}

	return error instanceof Error ? error.message : "fsdecrypt failed"
}
