import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

const DEFAULT_ACCENT_COLOR = "#ef4444"
const ACCENT_COLOR_KEY = "profile-banner-color"

const isValidHex = (value: string): boolean => /^#[0-9A-Fa-f]{6}$/.test(value)

type AccentColorProviderProps = {
	children: React.ReactNode
	defaultColor?: string
	storageKey?: string
}

type AccentColorProviderState = {
	accentColor: string
	setAccentColor: (color: string) => void
}

const initialState: AccentColorProviderState = {
	accentColor: DEFAULT_ACCENT_COLOR,
	setAccentColor: () => null
}

const AccentColorProviderContext = createContext<AccentColorProviderState>(initialState)

export function AccentColorProvider({
	children,
	defaultColor = DEFAULT_ACCENT_COLOR,
	storageKey = ACCENT_COLOR_KEY,
	...props
}: AccentColorProviderProps) {
	const [accentColor, setAccentColorState] = useState<string>(() => {
		if (typeof window === "undefined") return defaultColor
		const stored = localStorage.getItem(storageKey)
		return stored && isValidHex(stored) ? stored : defaultColor
	})

	useEffect(() => {
		const handleStorageChange = () => {
			const stored = localStorage.getItem(storageKey)
			if (stored && isValidHex(stored) && stored !== accentColor) {
				setAccentColorState(stored)
			}
		}

		window.addEventListener("storage", handleStorageChange)
		window.addEventListener("bannerColorChange", handleStorageChange)

		return () => {
			window.removeEventListener("storage", handleStorageChange)
			window.removeEventListener("bannerColorChange", handleStorageChange)
		}
	}, [accentColor, storageKey])

	const setAccentColor = useCallback(
		(color: string) => {
			if (isValidHex(color)) {
				localStorage.setItem(storageKey, color)
				setAccentColorState(color)
				window.dispatchEvent(new Event("bannerColorChange"))
			}
		},
		[storageKey]
	)

	const value = useMemo(
		() => ({
			accentColor,
			setAccentColor
		}),
		[accentColor, setAccentColor]
	)

	return (
		<AccentColorProviderContext.Provider {...props} value={value}>
			{children}
		</AccentColorProviderContext.Provider>
	)
}

export const useAccentColor = () => {
	const context = useContext(AccentColorProviderContext)

	if (context === undefined) throw new Error("useAccentColor must be used within an AccentColorProvider")

	return context.accentColor
}

export const useAccentColorContext = () => {
	const context = useContext(AccentColorProviderContext)

	if (context === undefined) throw new Error("useAccentColorContext must be used within an AccentColorProvider")

	return context
}
