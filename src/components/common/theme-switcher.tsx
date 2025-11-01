// animated theme switcher idea from https://x.com/saltyAom
import { useCallback, useEffect } from "react"

import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ModeToggle() {
	const { theme, setTheme } = useTheme()

	useEffect(() => {
		const root = document.documentElement as HTMLElement & { style: any }
		try {
			if (root && root.style) root.style.viewTransitionName = "root"
		} catch {}
	}, [])

	const handleSetTheme = useCallback(
		(_e: React.MouseEvent<HTMLElement>, next: "light" | "dark" | "system") => {
			const root = document.documentElement
			const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
			const currentIsDark = root.classList.contains("dark")
			const nextIsDark = next === "dark" ? true : next === "light" ? false : systemPrefersDark

			// No-op if selecting currently active theme
			if (
				(next === "dark" && currentIsDark) ||
				(next === "light" && !currentIsDark) ||
				(next === "system" && theme === "system")
			) {
				return
			}

			const applyTheme = () => flushSync(() => setTheme(next))
			const freeze = (ms = 700) => {
				root.classList.add("no-theme-transition")
				setTimeout(() => root.classList.remove("no-theme-transition"), ms)
			}
			const showMascot = (size = 320, duration = 3000) => {
				const img = document.createElement("img")
				img.src = "/assets/shiguri.gif"
				img.alt = ""
				Object.assign(img.style, {
					position: "fixed",
					left: "50%",
					top: "50%",
					width: `${size}px`,
					height: `${size}px`,
					pointerEvents: "none",
					zIndex: "2147483647",
					transform: "translate(-50%, -50%) scale(0.85) translateZ(0)",
					opacity: "0",
					backfaceVisibility: "hidden",
					willChange: "transform, opacity"
				} as CSSStyleDeclaration)
				if (!currentIsDark && nextIsDark) img.style.filter = "invert(1) brightness(1.15) saturate(0.2)"
				document.body.appendChild(img)
				img
					.animate(
						[
							{ transform: "translate(-50%, -50%) scale(0.85)", opacity: 0 },
							{ transform: "translate(-50%, -50%) scale(1)", opacity: 1, offset: 0.15 },
							{ transform: "translate(-50%, -50%) scale(1)", opacity: 1, offset: 0.85 },
							{ transform: "translate(-50%, -50%) scale(0.95)", opacity: 0 }
						],
						{ duration, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
					)
					.finished.finally(() => img.remove())
			}

			freeze()
			const start = (document as any).startViewTransition as undefined | ((cb: () => void) => any)
			const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
			const run = () => applyTheme()
			if (typeof start === "function" && !reduced) {
				try {
					const vt = start(run)
					vt.ready.then(() => {
						const cx = innerWidth / 2
						const cy = innerHeight / 2
						const r = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy))
						const from = `circle(0px at ${cx}px ${cy}px)`
						const to = `circle(${r}px at ${cx}px ${cy}px)`
						;(document.documentElement as any).animate([{ clipPath: from }, { clipPath: to }], {
							duration: 600,
							easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
							pseudoElement: "::view-transition-new(root)"
						} as any)
						;(document.documentElement as any).animate([{ clipPath: to }, { clipPath: from }], {
							duration: 600,
							easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
							pseudoElement: "::view-transition-old(root)"
						} as any)
						showMascot()
					})
				} catch {
					run()
					showMascot()
				}
			} else {
				run()
				showMascot()
			}
		},
		[theme, setTheme]
	)

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="hover:cursor-pointer">
					<Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
					<Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem className="hover:cursor-pointer" onClick={e => handleSetTheme(e, "light")}>
					Light
				</DropdownMenuItem>
				<DropdownMenuItem className="hover:cursor-pointer" onClick={e => handleSetTheme(e, "dark")}>
					Dark
				</DropdownMenuItem>
				<DropdownMenuItem className="hover:cursor-pointer" onClick={e => handleSetTheme(e, "system")}>
					System
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
