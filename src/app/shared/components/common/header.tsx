import { Menu } from "lucide-react"

import { Button } from "@/app/shared/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/app/shared/components/ui/card"
import { Separator } from "@/app/shared/components/ui/separator"
import { SidebarTrigger } from "@/app/shared/components/ui/sidebar"

import { Search, type SearchProps } from "./search"
import { ModeToggle } from "./theme-switcher"

type HeaderProps = {
	title: string
	searchProps?: Omit<SearchProps, "open" | "onOpenChange">
}

const Header = ({ title, searchProps }: HeaderProps) => {
	return (
		<div className="my-4">
			<Card className="bg-background top-0 z-50 w-full gap-0 rounded-none border-b border-none py-0 shadow-none">
				<CardHeader className="flex items-center justify-between gap-2 pr-4 pl-4 sm:pr-6 lg:pr-8">
					<div className="flex min-w-0 items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							className="bg-background hover:bg-accent hover:text-accent-foreground flex-shrink-0 cursor-pointer transition-none"
							asChild
						>
							<SidebarTrigger>
								<Menu className="h-[1.2rem] w-[1.2rem]" />
								<span className="sr-only">Toggle sidebar</span>
							</SidebarTrigger>
						</Button>
						<CardTitle className="hidden truncate border-none text-xl font-semibold sm:block sm:text-2xl">
							{title}
						</CardTitle>
					</div>
					<div className="flex flex-1 flex-shrink-0 items-center justify-end gap-2 sm:flex-initial">
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
