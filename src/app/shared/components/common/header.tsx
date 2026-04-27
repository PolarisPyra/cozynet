import { type ReactNode, useEffect, useState } from "react"

import { useAccentColor } from "@/app/shared/components/accent-color-provider"
import { Card, CardHeader, CardTitle } from "@/app/shared/components/ui/card"
import { Separator } from "@/app/shared/components/ui/separator"
import { SidebarTrigger } from "@/app/shared/components/ui/sidebar"

import { Search, type SearchProps } from "./search"
import { ModeToggle } from "./theme-switcher"
import { cn } from "../../utils/cn"

type HeaderProps = {
	title: string
	description?: string
	searchProps?: SearchProps
	actions?: ReactNode
}

const Header = ({ title, description, searchProps, actions }: HeaderProps) => {
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
			className={`sticky top-0 z-50 mb-4 transition-all duration-300 ${isScrolled ? "shadow-lg backdrop-blur-md bg-background/80" : "bg-background"
				}`}
		>
			<style>{`
				[data-sidebar="trigger"] svg {
					color: ${accentColor} !important;
				}
			`}</style>
			<Card className="w-full gap-0 rounded-none border-b border-none bg-transparent py-0 shadow-none">
				<CardHeader
					className={`flex flex-col gap-3 pr-3 pl-3 transition-all duration-300 sm:flex-row sm:items-center sm:justify-between sm:pr-4 sm:pl-4 lg:pr-6 lg:pl-6 ${isScrolled ? "py-1.5 sm:py-2" : "py-2 sm:py-3"
						}`}
				>
					<div className="flex items-center justify-between gap-2 sm:justify-start">
						<div className="flex min-w-0 items-center gap-2">
							<SidebarTrigger className="bg-background hover:bg-accent hover:text-accent-foreground flex-shrink-0 cursor-pointer transition-none" />
							<div className="flex flex-col min-w-0">
								<CardTitle
									className={cn(
										"truncate border-none font-semibold transition-all duration-300",
										isScrolled ? "text-base sm:text-lg" : "text-lg sm:text-xl"
									)}
								>
									{title}
								</CardTitle>
								{description && !isScrolled && (
									<div className="text-muted-foreground hidden truncate text-[10px] font-normal sm:block">
										{description}
									</div>
								)}
							</div>
						</div>
						<div className="flex items-center gap-2 sm:hidden">
							<ModeToggle />
						</div>
					</div>

					<div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-2">
						{actions && <div className="flex items-center justify-end gap-1.5 sm:gap-2">{actions}</div>}
						{searchProps && (
							<div className="w-full sm:max-w-[200px] sm:flex-initial">
								<Search {...searchProps} />
							</div>
						)}
						<div className="hidden items-center gap-2 sm:flex">
							<Separator orientation="vertical" className="ml-1 h-6! sm:ml-2" />
							<ModeToggle />
						</div>
					</div>
				</CardHeader>
			</Card>
		</div>
	)
}

export default Header
