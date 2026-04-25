import { ReactNode, useEffect, useMemo, useState } from "react"

import { Lock, LockOpen, Search } from "lucide-react"

import { Pagination } from "@/app/shared/components/common/pagination"
import { Button } from "@/app/shared/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/shared/components/ui/dialog"
import { Input } from "@/app/shared/components/ui/input"
import { STANDARD_PAGE_SIZE } from "@/app/shared/constants/pagination"
import { usePagination } from "@/app/shared/hooks/use-pagination"
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
	const [searchQuery, setSearchQuery] = useState("")
	const itemsPerPage = STANDARD_PAGE_SIZE

	// Filter items based on search query
	const filteredItems = useMemo(() => {
		if (!searchQuery.trim()) return items
		return items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
	}, [items, searchQuery])

	const { page, setPage, totalPages, paged: paginatedItems, hasMore } = usePagination(filteredItems, itemsPerPage, [searchQuery, isOpen])

	// Reset search when dialog opens or closes
	useEffect(() => {
		if (isOpen) {
			setSearchQuery("")
			if (currentItemId) {
				const itemIndex = items.findIndex(item => item.id === currentItemId)
				if (itemIndex >= 0) {
					setPage(Math.floor(itemIndex / itemsPerPage) + 1)
				}
			}
		}
	}, [isOpen, currentItemId, items, itemsPerPage, setPage])

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
			<DialogContent className="flex max-h-[90vh] max-w-[calc(100%-2rem)] flex-col overflow-hidden sm:max-w-[calc(100%-3rem)] lg:max-w-4xl">
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
				<div className="min-h-0 flex-1 overflow-y-auto">
					<div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
						{paginatedItems.map(item => (
							<div
								key={item.id}
								className={cn(
									"bg-card flex h-[160px] flex-col rounded-sm border-2 p-2 text-center sm:h-[180px] sm:p-3",
									selectedId === item.id ? "border-primary" : "border-border",
									item.locked && !onUnlock && "cursor-not-allowed opacity-60"
								)}
							>
								<p className="mb-1 line-clamp-2 h-7 overflow-hidden text-xs font-medium sm:mb-2 sm:h-8">{item.name}</p>
								<div
									onClick={() => !item.locked && handleSelect(item.id)}
									className={cn(
										"relative flex h-16 w-full items-center justify-center overflow-hidden sm:h-20",
										!item.locked && "cursor-pointer"
									)}
								>
									<img
										src={item.imageUrl}
										alt={item.name}
										className={cn("max-h-full max-w-full rounded-sm object-contain", imageClassName)}
										loading="lazy"
										decoding="async"
									/>
									{item.locked && !onUnlock ? (
										<div className="bg-foreground/70 text-background absolute top-1 right-1 rounded-full p-1">
											<Lock className="h-3 w-3" />
										</div>
									) : null}
								</div>
								<div className="mt-auto">
									{item.locked && onUnlock ? (
										<button
											onClick={e => handleUnlock(item.id, e)}
											className="bg-primary hover:bg-primary/90 text-primary-foreground flex w-full items-center justify-center gap-1 rounded-sm px-2 py-1 text-xs font-medium sm:py-1.5"
											title="Click to unlock item"
										>
											<LockOpen className="h-3 w-3" />
											Unlock
										</button>
									) : null}
								</div>
							</div>
						))}
					</div>
				</div>

				{hasMore && (
					<div className="border-border shrink-0 border-t">
						<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
					</div>
				)}

				{/* Action Button */}
				<div className="mt-3 shrink-0 sm:mt-4">
					<Button variant="secondary" onClick={handleConfirm} disabled={selectedId === null} className="w-full">
						OK
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
