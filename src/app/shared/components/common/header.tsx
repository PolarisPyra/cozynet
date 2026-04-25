import { type ReactNode, useEffect, useState } from "react"

import { useAccentColor } from "@/app/shared/components/accent-color-provider"
import { Card, CardHeader, CardTitle } from "@/app/shared/components/ui/card"
import { Separator } from "@/app/shared/components/ui/separator"
import { SidebarTrigger } from "@/app/shared/components/ui/sidebar"

import { Search, type SearchProps } from "./search"
import { ModeToggle } from "./theme-switcher"

type HeaderProps = {
	title: string
	searchProps?: SearchProps
	actions?: ReactNode
}

const Header = ({ title, searchProps, actions }: HeaderProps) => {
	const accentColor = useAccentColor()
	const [isScrolled, setIsScrolled] = useState(false)

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10)
		}

		window.addEventListener("scroll", handleScroll)
		return () => window.removeEventListener("scroll", handleScroll)
	}, [])

	return (
		<div
			className={`sticky top-0 z-50 mb-4 transition-all duration-300 ${
				isScrolled ? "shadow-lg backdrop-blur-md bg-background/80" : "bg-background"
			}`}
		>
			<style>{`
				[data-sidebar="trigger"] svg {
					color: ${accentColor} !important;
				}
			`}</style>
			<Card className="w-full gap-0 rounded-none border-b border-none bg-transparent py-0 shadow-none">
				<CardHeader
					className={`flex items-center justify-between gap-2 pr-3 pl-3 transition-all duration-300 sm:pr-4 sm:pl-4 lg:pr-6 lg:pl-6 ${
						isScrolled ? "py-1.5 sm:py-2" : "py-2 sm:py-3"
					}`}
				>
					<div className="flex min-w-0 items-center gap-2">
						<SidebarTrigger className="bg-background hover:bg-accent hover:text-accent-foreground flex-shrink-0 cursor-pointer transition-none" />
						<CardTitle
							className={`hidden truncate border-none font-semibold transition-all duration-300 sm:block ${
								isScrolled ? "text-base sm:text-lg" : "text-lg sm:text-xl"
							}`}
						>
							{title}
						</CardTitle>
					</div>
					<div className="flex flex-1 flex-shrink-0 items-center justify-end gap-2 sm:flex-initial">
						{actions}
						{searchProps && (
							<div className="max-w-[200px] flex-1 sm:max-w-none sm:flex-initial">
								<Search {...searchProps} />
							</div>
						)}
						<Separator orientation="vertical" className="ml-2 h-6!" />
						<ModeToggle />
					</div>
				</CardHeader>
			</Card>
		</div>
	)
}

export default Header
