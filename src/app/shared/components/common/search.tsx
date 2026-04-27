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
	onSelect?: (value: string, item?: SearchItem) => void
	placeholder?: string
	emptyMessage?: string
	groupLabel?: string
	recentStorageKey?: string
}

export const Search = ({
	items = [],
	onSelect,
	placeholder = "Search...",
	emptyMessage = "No results found.",
	groupLabel = "Results",
	recentStorageKey,
	...props
}: SearchProps) => {
	const [open, setOpen] = React.useState(false)
	const [search, setSearch] = React.useState("")
	const [debouncedSearch, setDebouncedSearch] = React.useState("")
	const storageKey = React.useMemo(
		() => recentStorageKey || `search-recent:${groupLabel.toLowerCase().replace(/\s+/g, "-")}`,
		[groupLabel, recentStorageKey]
	)

	const [recentItems, setRecentItems] = React.useState<SearchItem[]>(() => {
		try {
			const raw = localStorage.getItem(storageKey)
			if (!raw) return []
			const parsed = JSON.parse(raw) as SearchItem[]
			return Array.isArray(parsed) ? parsed.slice(0, 5) : []
		} catch {
			return []
		}
	})

	React.useEffect(() => {
		const id = window.setTimeout(() => setDebouncedSearch(search), 180)
		return () => window.clearTimeout(id)
	}, [search])

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
		if (!debouncedSearch) return uniqueItems
		const searchLower = debouncedSearch.toLowerCase()
		return uniqueItems.filter(item => {
			const title = item.title || ""
			return title.toLowerCase().includes(searchLower)
		})
	}, [uniqueItems, debouncedSearch])

	const displayedItems = filteredItems.slice(0, 10)
	const remainingCount = filteredItems.length - 10

	const handleSelect = React.useCallback(
		(item: SearchItem) => {
			setOpen(false)
			setSearch("")
			setRecentItems(prev => {
				const next = [item, ...prev.filter(it => `${it.id}` !== `${item.id}`)].slice(0, 5)
				localStorage.setItem(storageKey, JSON.stringify(next))
				return next
			})
			onSelect?.(item.title, item)
		},
		[onSelect, storageKey]
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
						"relative h-9 w-full justify-start pl-3 font-medium shadow-none hover:cursor-pointer sm:h-8 sm:pr-14 md:w-full"
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
					<CommandInput
						placeholder={placeholder}
						value={search}
						onValueChange={setSearch}
						onKeyDown={e => {
							if (e.key === "Escape") {
								if (search.trim().length > 0) {
									e.preventDefault()
									e.stopPropagation()
									setSearch("")
								} else {
									setOpen(false)
								}
							}
						}}
					/>
					<CommandList className="no-scrollbar bg-background min-h-80 scroll-pt-2 scroll-pb-1.5">
						{filteredItems.length === 0 && (
							<CommandEmpty className="text-muted-foreground py-12 text-center text-sm">{emptyMessage}</CommandEmpty>
						)}
						{!debouncedSearch && recentItems.length > 0 && (
							<CommandGroup
								heading="Recent"
								className="!p-0 [&_[cmdk-group-heading]]:scroll-mt-16 [&_[cmdk-group-heading]]:!p-3 [&_[cmdk-group-heading]]:!pb-1"
							>
								{recentItems.map(item => (
									<CommandMenuItem key={`recent-${item.id}`} value={item.title || ""} onSelect={() => handleSelect(item)}>
										<ArrowRight />
										{item.title}
									</CommandMenuItem>
								))}
							</CommandGroup>
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
										onSelect={() => handleSelect(item)}
									>
										<ArrowRight />
										<HighlightedText text={item.title} query={debouncedSearch} />
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

const HighlightedText = ({ text, query }: { text: string; query: string }) => {
	if (!query.trim()) return <>{text}</>
	const lower = text.toLowerCase()
	const q = query.toLowerCase()
	const index = lower.indexOf(q)
	if (index < 0) return <>{text}</>

	const before = text.slice(0, index)
	const match = text.slice(index, index + query.length)
	const after = text.slice(index + query.length)

	return (
		<>
			{before}
			<mark className="bg-primary/25 text-foreground rounded-sm px-0.5">{match}</mark>
			{after}
		</>
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
