import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BaseFilter, FilterValues } from "@/shared/types";

interface MultiFilterProps {
	filters: BaseFilter[];
	filterValues: FilterValues;
	onFilterChange: (identifier: string, value: string) => void;
	onClearAll: () => void;
}

export const MultiFilter = ({ filters, filterValues, onFilterChange, onClearAll }: MultiFilterProps) => {
	const activeFilterCount = filters.reduce((count, filter) => {
		const currentValue = filterValues[filter.identifier];
		const defaultValue = filter.options[0]?.value;

		// Only count if the current value differs from the default first option
		if (currentValue && currentValue !== defaultValue) {
			return count + 1;
		}
		return count;
	}, 0);

	return (
		<div className="space-y-2">
			<div className="flex flex-wrap items-center gap-2">
				{filters.map((filter) => (
					<Select
						key={filter.identifier}
						value={filterValues[filter.identifier] || "all"}
						onValueChange={(value) => onFilterChange(filter.identifier, value)}
					>
						<SelectTrigger className="w-auto min-w-[100px] rounded-sm px-2">
							<SelectValue placeholder={filter.label} />
						</SelectTrigger>
						<SelectContent>
							{filter.options.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				))}
			</div>
			{activeFilterCount > 0 && (
				<div className="flex items-center gap-2">
					<Badge variant="secondary" className="text-xs">
						{activeFilterCount} active
					</Badge>
					<Button variant="ghost" size="sm" onClick={onClearAll} className="h-7 text-xs hover:cursor-pointer">
						Clear All
					</Button>
				</div>
			)}
		</div>
	);
};
