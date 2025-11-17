import { ReactNode, useEffect, useMemo, useState } from "react"

import { ChevronLeft, ChevronRight, Lock, LockOpen, Search } from "lucide-react"

import { Button } from "@/app/shared/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/shared/components/ui/dialog"
import { Input } from "@/app/shared/components/ui/input"
import { cn } from "@/app/shared/utils"

interface Item {
	id: number
	name: string
	imageUrl: string
	locked: boolean
}

interface ItemSelectionDialogProps {
	title: string
	isOpen: boolean
	onClose: () => void
	items: Item[]
	currentItemId?: number
	onSelect: (id: number) => void
	onUnlock?: (id: number) => void
	imageClassName?: string
	headerControls?: ReactNode
}

export function ItemSelectionDialog({
	title,
	isOpen,
	onClose,
	items,
	currentItemId,
	onSelect,
	onUnlock,
	imageClassName = "h-20 w-20",
	headerControls
}: ItemSelectionDialogProps) {
	const [selectedId, setSelectedId] = useState<number | null>(currentItemId ?? null)
	const [currentPage, setCurrentPage] = useState(1)
	const [searchQuery, setSearchQuery] = useState("")
	const itemsPerPage = 12

	// Filter items based on search query
	const filteredItems = useMemo(() => {
		if (!searchQuery.trim()) return items
		return items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
	}, [items, searchQuery])

	// Reset search and page when dialog opens or closes
	useEffect(() => {
		if (isOpen) {
			setSearchQuery("")
			setCurrentPage(1)
			if (currentItemId) {
				const itemIndex = items.findIndex(item => item.id === currentItemId)
				if (itemIndex !== -1) {
					setCurrentPage(Math.floor(itemIndex / itemsPerPage) + 1)
				}
			}
		}
	}, [isOpen, currentItemId, items, itemsPerPage])

	// Reset to page 1 when search changes (but not on initial open)
	useEffect(() => {
		if (searchQuery !== "") {
			setCurrentPage(1)
		}
	}, [searchQuery])

	const totalPages = Math.ceil(filteredItems.length / itemsPerPage)

	const paginatedItems = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage
		return filteredItems.slice(start, start + itemsPerPage)
	}, [filteredItems, currentPage])

	const handleSelect = (id: number) => {
		setSelectedId(id)
	}

	const handleConfirm = () => {
		if (selectedId !== null) {
			onSelect(selectedId)
		}
	}

	const handleUnlock = (id: number, e: React.MouseEvent) => {
		e.stopPropagation()
		if (onUnlock) {
			onUnlock(id)
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-h-[90vh] max-w-4xl">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>

				{/* Header Controls (e.g., slot selector) */}
				{headerControls && <div className="border-border border-b pb-3">{headerControls}</div>}

				{/* Search */}
				<div className="relative">
					<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
					<Input
						type="text"
						placeholder="Search..."
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>

				{/* Items Grid */}
				<div className="max-h-[60vh] min-h-[400px] overflow-y-auto">
					<div className="grid grid-cols-2 gap-3 p-2 sm:grid-cols-3 lg:grid-cols-4">
						{paginatedItems.map(item => (
							<div
								key={item.id}
								className={cn(
									"bg-card flex flex-col rounded-sm border-2 p-3 text-center",
									selectedId === item.id ? "border-primary" : "border-border",
									item.locked && !onUnlock && "cursor-not-allowed opacity-60"
								)}
							>
								<p className="mb-2 line-clamp-2 h-8 overflow-hidden text-xs font-medium">{item.name}</p>
								<div
									onClick={() => !item.locked && handleSelect(item.id)}
									className={cn(
										"relative flex h-20 w-full items-center justify-center",
										!item.locked && "cursor-pointer"
									)}
								>
									<img
										src={item.imageUrl}
										alt={item.name}
										className={cn("rounded-sm object-cover", imageClassName)}
										loading="lazy"
										decoding="async"
									/>
									{item.locked && !onUnlock ? (
										<div className="bg-foreground/70 text-background absolute top-1 right-1 rounded-full p-1">
											<Lock className="h-3 w-3" />
										</div>
									) : null}
								</div>
								{item.locked && onUnlock ? (
									<button
										onClick={e => handleUnlock(item.id, e)}
										className="bg-primary hover:bg-primary/90 text-primary-foreground mt-2 flex w-full items-center justify-center gap-1 rounded-sm px-2 py-1.5 text-xs font-medium"
										title="Click to unlock item"
									>
										<LockOpen className="h-3 w-3" />
										Unlock
									</button>
								) : null}
							</div>
						))}
					</div>
				</div>

				{/* Pagination Bottom */}
				{totalPages > 1 && (
					<div className="border-border flex items-center justify-center gap-2 border-t pt-4">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
							disabled={currentPage === 1}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<span className="text-muted-foreground text-sm">
							Page {currentPage} of {totalPages}
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				)}

				{/* Action Button */}
				<div className="mt-4">
					<Button variant="secondary" onClick={handleConfirm} disabled={selectedId === null} className="w-full">
						OK
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
