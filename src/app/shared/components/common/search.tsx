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
import { cn } from "@/app/shared/utils"

export type SearchItem = {
	id: string | number
	title: string
}

export type SearchProps = Omit<DialogProps, "open" | "onOpenChange"> & {
	items?: SearchItem[]
	onSelect?: (value: string) => void
	placeholder?: string
	emptyMessage?: string
	groupLabel?: string
}

export const Search = ({
	items = [],
	onSelect,
	placeholder = "Search...",
	emptyMessage = "No results found.",
	groupLabel = "Results",
	...props
}: SearchProps) => {
	const [open, setOpen] = React.useState(false)
	const [search, setSearch] = React.useState("")

	// Deduplicate items by title
	const uniqueItems = React.useMemo(() => {
		const seen = new Set<string>()
		return items.filter(item => {
			const title = item.title || ""
			if (seen.has(title)) return false
			seen.add(title)
			return true
		})
	}, [items])

	// Filter items based on search query
	const filteredItems = React.useMemo(() => {
		if (!search) return uniqueItems
		const searchLower = search.toLowerCase()
		return uniqueItems.filter(item => {
			const title = item.title || ""
			return title.toLowerCase().includes(searchLower)
		})
	}, [uniqueItems, search])

	const displayedItems = filteredItems.slice(0, 10)
	const remainingCount = filteredItems.length - 10

	const handleSelect = React.useCallback(
		(value: string) => {
			setOpen(false)
			setSearch("")
			onSelect?.(value)
		},
		[onSelect]
	)

	// Reset search when dialog closes
	React.useEffect(() => {
		if (!open) setSearch("")
	}, [open])

	// Keyboard shortcut to open
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
				setOpen(prev => !prev)
			}
		}
		document.addEventListener("keydown", down)
		return () => document.removeEventListener("keydown", down)
	}, [])

	return (
		<Dialog open={open} onOpenChange={setOpen} {...props}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"relative h-8 w-full justify-start pl-3 font-medium shadow-none hover:cursor-pointer sm:pr-12 md:w-48 lg:w-56 xl:w-64"
					)}
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
					shouldFilter={false}
				>
					<CommandInput placeholder={placeholder} value={search} onValueChange={setSearch} />
					<CommandList className="no-scrollbar bg-background min-h-80 scroll-pt-2 scroll-pb-1.5">
						{filteredItems.length === 0 && (
							<CommandEmpty className="text-muted-foreground py-12 text-center text-sm">{emptyMessage}</CommandEmpty>
						)}
						{displayedItems.length > 0 && (
							<CommandGroup
								heading={groupLabel}
								className="!p-0 [&_[cmdk-group-heading]]:scroll-mt-16 [&_[cmdk-group-heading]]:!p-3 [&_[cmdk-group-heading]]:!pb-1"
							>
								{displayedItems.map(item => (
									<CommandMenuItem
										key={item.id}
										value={item.title || ""}
										onSelect={handleSelect}
									>
										<ArrowRight />
										{item.title}
									</CommandMenuItem>
								))}
							</CommandGroup>
						)}
						{remainingCount > 0 && (
							<div className="text-muted-foreground px-3 py-2 text-xs">
								... and more
							</div>
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
