import * as React from "react"

import { type DialogProps } from "@radix-ui/react-dialog"
import { ArrowRight, CornerDownLeft } from "lucide-react"

import { Button } from "@/app/shared/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/app/shared/components/ui/command"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/app/shared/components/ui/dialog"
import { cn } from "@/app/shared/utils/cn"

export type SearchItem = {
	id: string | number
	title: string
}

export type SearchProps = DialogProps & {
	items?: SearchItem[]
	searchQuery?: string
	onSearchChange?: (value: string) => void
	placeholder?: string
	emptyMessage?: string
	groupLabel?: string
}

export const Search = ({
	items = [],
	searchQuery,
	onSearchChange,
	placeholder = "Search...",
	emptyMessage = "No results found.",
	groupLabel = "Results",
	...props
}: SearchProps) => {
	const [open, setOpen] = React.useState(false)

	const uniqueItems = React.useMemo(() => {
		if (!items) return []
		const seen = new Set<string>()
		return items.filter(item => {
			const title = item.title || ""
			if (seen.has(title)) return false
			seen.add(title)
			return true
		})
	}, [items])

	const runCommand = React.useCallback((command: () => unknown) => {
		setOpen(false)
		command()
	}, [])

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
				if (
					(e.target instanceof HTMLElement && e.target.isContentEditable) ||
					e.target instanceof HTMLInputElement ||
					e.target instanceof HTMLTextAreaElement ||
					e.target instanceof HTMLSelectElement
				) {
					return
				}
				e.preventDefault()
				setOpen(open => !open)
			}
		}
		document.addEventListener("keydown", down)
		return () => document.removeEventListener("keydown", down)
	}, [])

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"relative h-8 w-full justify-start pl-3 font-medium shadow-none hover:cursor-pointer sm:pr-12 md:w-48 lg:w-56 xl:w-64"
					)}
					onClick={() => setOpen(true)}
					{...props}
				>
					<span className="hidden lg:inline-flex">{placeholder}</span>
					<span className="inline-flex lg:hidden">Search...</span>
					<div className="absolute top-1.5 right-1.5 hidden gap-1 sm:flex">
						<CommandMenuKbd>Ctrl</CommandMenuKbd>
						<CommandMenuKbd>K</CommandMenuKbd>
					</div>
				</Button>
			</DialogTrigger>
			<DialogContent showCloseButton={false} className="ring-accent p-2 pb-11 ring-4">
				<DialogHeader className="sr-only">
					<DialogTitle>{placeholder}</DialogTitle>
					<DialogDescription>{placeholder}</DialogDescription>
				</DialogHeader>
				<Command
					className="**:data-[slot=command-input-wrapper]:bg-input/50 **:data-[slot=command-input-wrapper]:border-input rounded-none bg-transparent **:data-[slot=command-input]:!h-9 **:data-[slot=command-input]:py-0 **:data-[slot=command-input-wrapper]:mb-1.5 **:data-[slot=command-input-wrapper]:!h-9 **:data-[slot=command-input-wrapper]:rounded-sm **:data-[slot=command-input-wrapper]:border"
					filter={(value, search, keywords) => {
						const extendValue = value + " " + (keywords?.join(" ") || "")
						if (extendValue.toLowerCase().includes(search.toLowerCase())) {
							return 1
						}
						return 0
					}}
				>
					<CommandInput
						placeholder={placeholder}
						{...(onSearchChange ? { value: searchQuery || "", onValueChange: onSearchChange } : {})}
					/>
					<CommandList className="no-scrollbar bg-background min-h-80 scroll-pt-2 scroll-pb-1.5">
						<CommandEmpty className="text-muted-foreground py-12 text-center text-sm">{emptyMessage}</CommandEmpty>
						{uniqueItems && uniqueItems.length > 0 && (
							<CommandGroup
								heading={groupLabel}
								className="!p-0 [&_[cmdk-group-heading]]:scroll-mt-16 [&_[cmdk-group-heading]]:!p-3 [&_[cmdk-group-heading]]:!pb-1"
							>
								{uniqueItems.slice(0, 10).map(item => (
									<CommandMenuItem
										key={item.id}
										value={item.title || ""}
										keywords={[(item.title || "").toLowerCase()]}
										onSelect={() => {
											runCommand(() => onSearchChange && onSearchChange(item.title || ""))
										}}
									>
										<ArrowRight />
										{item.title}
									</CommandMenuItem>
								))}
								{uniqueItems.length > 10 && (
									<CommandMenuItem disabled className="text-muted-foreground py-2 text-center">
										<span className="text-xs">... and {uniqueItems.length - 10} more results</span>
									</CommandMenuItem>
								)}
							</CommandGroup>
						)}
					</CommandList>
				</Command>
				<div className="bg-background text-muted-foreground border-bg-foreground absolute inset-x-0 bottom-0 z-20 flex h-10 items-center gap-2 rounded-b-xl border-t px-4 text-xs font-medium">
					<div className="flex items-center gap-2">
						<CommandMenuKbd>
							<CornerDownLeft />
						</CommandMenuKbd>{" "}
						Select
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

const CommandMenuItem = ({ children, className, ...props }: React.ComponentProps<typeof CommandItem>) => {
	return (
		<CommandItem
			className={cn(
				"data-[selected=true]:border-input data-[selected=true]:bg-input/50 hover:bg-background h-9 cursor-pointer rounded-sm border border-transparent !px-3 font-medium",
				className
			)}
			{...props}
		>
			{children}
		</CommandItem>
	)
}

const CommandMenuKbd = ({ className, ...props }: React.ComponentProps<"kbd">) => {
	return (
		<kbd
			className={cn(
				"bg-background text-muted-foreground pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm border px-1 font-sans text-xs font-medium select-none [&_svg:not([class*='size-'])]:size-3",
				className
			)}
			{...props}
		/>
	)
}
