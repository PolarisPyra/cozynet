import { useEffect } from "react"

/**
 * Custom hook for pagination keyboard shortcuts.
 * Handles left/right arrow keys for navigating pages.
 *
 * @param totalPages - Total number of pages
 * @param onPageChange - Callback to change the page. Can accept a function that receives current page.
 * @param enabled - Whether keyboard shortcuts are enabled (default: true)
 */
export function usePaginationKeyboard(
	totalPages: number,
	onPageChange: (page: number | ((prev: number) => number)) => void,
	enabled = true
) {
	useEffect(() => {
		if (!enabled || totalPages <= 1) return

		function handleKeyDown(event: KeyboardEvent) {
			// Only handle arrow keys when not in an input/textarea/select
			if (
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement ||
				event.target instanceof HTMLSelectElement ||
				(event.target as HTMLElement).isContentEditable
			) {
				return
			}

			if (event.key === "ArrowLeft") {
				event.preventDefault()
				onPageChange((prev: number) => Math.max(1, prev - 1))
			} else if (event.key === "ArrowRight") {
				event.preventDefault()
				onPageChange((prev: number) => Math.min(totalPages, prev + 1))
			}
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [totalPages, onPageChange, enabled])
}
