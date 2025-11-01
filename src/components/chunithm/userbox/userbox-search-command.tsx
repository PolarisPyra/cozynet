import * as React from "react"

import { type DialogProps } from "@radix-ui/react-dialog"
import { ArrowRight, CornerDownLeft } from "lucide-react"

import { BaseItem } from "@/components/chunithm/userbox/grid/grid"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog"
import { TrophyRareType } from "@/lib/enums"
import { cn } from "@/lib/utils"

type ItemType = "avatar" | "character" | "trophy" | "nameplate" | "mapicon" | "stage" | "systemvoice"

type UserboxSearchCommandProps<T extends BaseItem> = DialogProps & {
	items?: T[]
	searchQuery?: string
	onSearchChange?: (value: string) => void
	onItemSelect?: (item: T) => void
	itemType?: ItemType
}

const itemTypeLabels: Record<ItemType, { singular: string; plural: string }> = {
	avatar: { singular: "Avatar Item", plural: "Avatar Items" },
	character: { singular: "Character", plural: "Characters" },
	trophy: { singular: "Trophy", plural: "Trophies" },
	nameplate: { singular: "Nameplate", plural: "Nameplates" },
	mapicon: { singular: "Map Icon", plural: "Map Icons" },
	stage: { singular: "Stage", plural: "Stages" },
	systemvoice: { singular: "System Voice", plural: "System Voices" }
}

const slotLabels: Record<string, string> = {
	back: "Back",
	face: "Face",
	head: "Head",
	item: "Item",
	skin: "Skin",
	wear: "Wear"
}

const trophyRareTypeLabels: Record<TrophyRareType, string> = {
	[TrophyRareType.Normal]: "Normal",
	[TrophyRareType.Bronze]: "Bronze",
	[TrophyRareType.Silver]: "Silver",
	[TrophyRareType.Gold]: "Gold",
	[TrophyRareType.Gold2]: "Gold+",
	[TrophyRareType.Platinum]: "Platinum",
	[TrophyRareType.Platinum2]: "Platinum+",
	[TrophyRareType.Rainbow]: "Rainbow",
	[TrophyRareType.Staff]: "Staff",
	[TrophyRareType.Ongeki]: "Ongeki",
	[TrophyRareType.Maimai]: "Maimai",
	[TrophyRareType.Duals]: "Duals",
	[TrophyRareType.Idori]: "Idori",
	[TrophyRareType.Pheonix_g]: "Phoenix",
	[TrophyRareType.Pheonix_p]: "Phoenix+",
	[TrophyRareType.Pheonix_r]: "Phoenix++",
	[TrophyRareType.Lamp]: "Lamp",
	[TrophyRareType.Lamp2]: "Lamp+",
	[TrophyRareType.Lamp3]: "Lamp++",
	[TrophyRareType.Kop]: "KOP",
	[TrophyRareType.Kop2]: "KOP+"
}

const UserboxSearchCommand = <T extends BaseItem>({
	items,
	searchQuery,
	onSearchChange,
	onItemSelect,
	itemType,
	...props
}: UserboxSearchCommandProps<T>) => {
	const [open, setOpen] = React.useState(false)

	const getItemId = React.useCallback((item: T): number => {
		return (
			item.avatarAccessoryId ??
			item.characterId ??
			item.trophyId ??
			item.nameplateId ??
			item.mapiconId ??
			item.stageId ??
			item.systemVoiceId ??
			item.id ??
			0
		)
	}, [])

	const detectItemType = React.useCallback((items: T[]): ItemType => {
		if (!items || items.length === 0) return "avatar"

		const firstItem = items[0]
		if (firstItem.avatarAccessoryId !== undefined) return "avatar"
		if (firstItem.characterId !== undefined) return "character"
		if (firstItem.trophyId !== undefined) return "trophy"
		if (firstItem.nameplateId !== undefined) return "nameplate"
		if (firstItem.mapiconId !== undefined) return "mapicon"
		if (firstItem.stageId !== undefined) return "stage"
		if (firstItem.systemVoiceId !== undefined) return "systemvoice"

		return "avatar"
	}, [])

	const detectedType = React.useMemo(() => {
		return itemType || detectItemType(items || [])
	}, [itemType, items, detectItemType])

	const placeholder = React.useMemo(() => {
		return `Search ${itemTypeLabels[detectedType].plural.toLowerCase()}...`
	}, [detectedType])

	const uniqueItems = React.useMemo(() => {
		if (!items) return []

		// For trophies, show all variants (don't deduplicate by name)
		if (detectedType === "trophy") {
			// Return all trophy items, they'll be grouped by rare type in the display
			return items
		}

		// For other items, use the original deduplication logic
		const seen = new Set<number>()
		return items.filter(item => {
			const itemId = getItemId(item)
			if (seen.has(itemId)) return false
			seen.add(itemId)
			return true
		})
	}, [items, getItemId, detectedType])

	const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
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
			setOpen(prevOpen => !prevOpen)
		}
	}, [])

	const handleItemSelect = React.useCallback(
		(item: T) => {
			setOpen(false)
			if (onItemSelect) {
				onItemSelect(item)
			} else if (onSearchChange) {
				onSearchChange(item.label)
			}
		},
		[onItemSelect, onSearchChange]
	)

	const handleFilter = React.useCallback((value: string, search: string, keywords?: string[]) => {
		const extendValue = value + " " + (keywords?.join(" ") || "")
		if (extendValue.toLowerCase().includes(search.toLowerCase())) {
			return 1
		}
		return 0
	}, [])

	React.useEffect(() => {
		document.addEventListener("keydown", handleKeyDown)
		return () => document.removeEventListener("keydown", handleKeyDown)
	}, [handleKeyDown])

	// Group items by slot (for avatar items), rare type (for trophies), or show as single group (for other items)
	const itemsByGroup = React.useMemo(() => {
		const grouped: Record<string, T[]> = {}

		if (detectedType === "avatar") {
			uniqueItems.forEach(item => {
				const slot = "slot" in item && typeof item.slot === "string" ? item.slot : "all"
				if (!grouped[slot]) {
					grouped[slot] = []
				}
				grouped[slot].push(item)
			})
		} else if (detectedType === "trophy") {
			// For trophies, group by rare type
			uniqueItems.forEach(item => {
				const rareType =
					"trophyRareType" in item ? ((item as any).trophyRareType as TrophyRareType) : TrophyRareType.Normal
				const rareTypeLabel = trophyRareTypeLabels[rareType] || "Unknown"
				if (!grouped[rareTypeLabel]) {
					grouped[rareTypeLabel] = []
				}
				grouped[rareTypeLabel].push(item)
			})
		} else {
			// For other items, use a single group
			grouped[itemTypeLabels[detectedType].plural] = uniqueItems
		}

		return grouped
	}, [uniqueItems, detectedType])

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className={cn("relative h-8 w-full justify-start pl-3 font-medium shadow-none hover:cursor-pointer sm:pr-12")}
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
			<DialogContent
				showCloseButton={false}
				className="ring-border/80 dark:bg-popover dark:ring-border rounded-xl border-none bg-clip-padding p-2 pb-11 shadow-2xl ring-4"
			>
				<DialogHeader className="sr-only">
					<DialogTitle>{placeholder}</DialogTitle>
					<DialogDescription>Search for {itemTypeLabels[detectedType].plural.toLowerCase()}...</DialogDescription>
				</DialogHeader>
				<Command
					className="**:data-[slot=command-input-wrapper]:bg-input/50 **:data-[slot=command-input-wrapper]:border-input rounded-none bg-transparent **:data-[slot=command-input]:!h-9 **:data-[slot=command-input]:py-0 **:data-[slot=command-input-wrapper]:mb-1.5 **:data-[slot=command-input-wrapper]:!h-9 **:data-[slot=command-input-wrapper]:rounded-sm **:data-[slot=command-input-wrapper]:border"
					filter={handleFilter}
				>
					<CommandInput
						placeholder={placeholder}
						{...(onSearchChange ? { value: searchQuery || "", onValueChange: onSearchChange } : {})}
					/>
					<CommandList className="no-scrollbar max-h-96 min-h-80 scroll-pt-2 scroll-pb-1.5">
						<CommandEmpty className="text-muted-foreground py-12 text-center text-sm">No items found.</CommandEmpty>
						{Object.entries(itemsByGroup).map(([groupName, groupItems]) => (
							<CommandGroup
								key={groupName}
								heading={
									detectedType === "avatar"
										? slotLabels[groupName] || groupName.charAt(0).toUpperCase() + groupName.slice(1)
										: groupName
								}
								className="!p-0 [&_[cmdk-group-heading]]:scroll-mt-16 [&_[cmdk-group-heading]]:!p-3 [&_[cmdk-group-heading]]:!pb-1"
							>
								{groupItems.slice(0, 10).map(item => {
									const rareType =
										detectedType === "trophy" && "trophyRareType" in item
											? ((item as any).trophyRareType as TrophyRareType)
											: null
									const rareTypeLabel = rareType !== null ? trophyRareTypeLabels[rareType] : null

									return (
										<CommandMenuItem
											key={getItemId(item)}
											value={`${item.label} (${rareTypeLabel || "Unknown"})`}
											keywords={[detectedType, groupName, item.label.toLowerCase(), rareTypeLabel?.toLowerCase() || ""]}
											onSelect={() => handleItemSelect(item)}
										>
											<div className="flex items-center gap-2">
												<ArrowRight className="h-4 w-4" />
												<span>{item.label}</span>
											</div>
										</CommandMenuItem>
									)
								})}
								{groupItems.length > 10 && (
									<CommandMenuItem disabled className="text-muted-foreground py-2 text-center">
										<span className="text-xs">... and {groupItems.length - 10} more items</span>
									</CommandMenuItem>
								)}
							</CommandGroup>
						))}
					</CommandList>
				</Command>
				<div className="text-muted-foreground border-t-border bg-muted dark:border-t-border dark:bg-muted/80 absolute inset-x-0 bottom-0 z-20 flex h-10 items-center gap-2 rounded-b-xl border-t px-4 text-xs font-medium">
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
				"bg-muted text-muted-foreground pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm border px-1 font-sans text-xs font-medium select-none [&_svg:not([class*='size-'])]:size-3",
				className
			)}
			{...props}
		/>
	)
}

export { UserboxSearchCommand }
export type { ItemType }
