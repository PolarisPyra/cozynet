import { Star } from "lucide-react"

import { Button } from "@/app/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/shared/components/ui/select"
import type { BaseFilter, FilterValues } from "@/app/shared/types"
import { cn } from "@/app/shared/utils"

type InlineFiltersProps = {
	filters: BaseFilter[]
	filterValues: FilterValues
	onFilterChange: (identifier: string, value: string) => void
	onClearAll?: () => void
	labelOverrides?: Record<string, string>
	isVertical?: boolean
}

export function InlineFilters({
	filters,
	filterValues,
	onFilterChange,
	onClearAll,
	labelOverrides = {},
	isVertical = false
}: InlineFiltersProps) {
	const activeFilterCount = filters.reduce((count, filter) => {
		const currentValue = filterValues[filter.identifier]
		const defaultValue = filter.options[0]?.value
		return currentValue && currentValue !== defaultValue ? count + 1 : count
	}, 0)

	return (
		<div className={cn("flex flex-wrap items-center gap-2", isVertical && "flex-col items-stretch")}>
			{filters.map(filter => {
				const selectedValue = filterValues[filter.identifier] || "all"
				const selectedOption = filter.options.find(option => option.value === selectedValue)
				const displayLabel = labelOverrides[filter.identifier] || filter.label
				const defaultValue = filter.options[0]?.value ?? "all"
				const isDefaultSelection = selectedValue === defaultValue

				return (
					<div key={filter.identifier} className={cn("flex items-center gap-2", isVertical && "flex-col items-start")}>
						{isVertical && <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">{filter.label}</span>}
						<Select value={selectedValue} onValueChange={value => onFilterChange(filter.identifier, value)}>
							<SelectTrigger
								className={cn(
									"h-8 w-auto min-w-[105px] rounded-full border-transparent bg-secondary/40 px-3 text-xs font-medium transition-colors hover:bg-secondary/60 focus:ring-0",
									isVertical && "w-full rounded-md",
									!isDefaultSelection && "bg-primary text-primary-foreground hover:bg-primary/90"
								)}
							>
								<SelectValue placeholder={displayLabel}>
									{isDefaultSelection ? (
										displayLabel
									) : selectedOption?.value.startsWith("star") ? (
										<div className="flex items-center gap-1">
											{Array.from({ length: parseInt(selectedOption.value.replace("star", ""), 10) }, (_, i) => (
												<Star key={i} className="h-3.5 w-3.5 fill-current" />
											))}
										</div>
									) : (
										selectedOption?.label || displayLabel
									)}
								</SelectValue>
							</SelectTrigger>
							<SelectContent>
								{filter.options.map(option => {
									if (option.value.startsWith("star")) {
										return (
											<SelectItem key={option.value} value={option.value}>
												<div className="flex items-center gap-1.5">
													{Array.from({ length: parseInt(option.value.replace("star", ""), 10) }, (_, i) => (
														<Star key={i} className="h-3.5 w-3.5 fill-current" />
													))}
												</div>
											</SelectItem>
										)
									}
									return (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									)
								})}
							</SelectContent>
						</Select>
					</div>
				)
			})}
			{onClearAll && activeFilterCount > 0 && (
				<Button variant="ghost" size="sm" onClick={onClearAll} className={cn("h-8 px-2 text-xs hover:cursor-pointer", isVertical && "w-full mt-2")}>
					Clear all
				</Button>
			)}
		</div>
	)
}
