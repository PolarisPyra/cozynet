import React, { useState } from "react";

import { Check, ChevronDown, Filter as FilterIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface FilterOption {
	value: string;
	label: string;
}

interface FilterProps {
	filters: FilterOption[];
	selectedFilter?: string;
	onFilterChange: (value: string) => void;
	className?: string;
	placeholder?: string;
	showIcon?: boolean;
	size?: "sm" | "lg";
	variant?: "default" | "outline" | "secondary";
	label?: string;
}

export const Filter: React.FC<FilterProps> = ({
	filters,
	selectedFilter,
	onFilterChange,
	className,
	placeholder = "All",
	showIcon = true,
	size = "sm",
	variant = "outline",
	label,
}) => {
	const [isOpen, setIsOpen] = useState(false);

	if (filters.length === 0) return null;

	const selectedFilterLabel = filters.find((f) => f.value === selectedFilter)?.label || placeholder;

	const handleFilterChange = (value: string) => {
		onFilterChange(value);
		setIsOpen(false);
	};

	const filterButton = (
		<Button
			variant={variant}
			size={size}
			className={cn(
				"border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center gap-2 hover:cursor-pointer",
				className
			)}
		>
			{showIcon && <FilterIcon className="h-4 w-4" />}
			<span className="hidden sm:inline">{selectedFilterLabel}</span>
			<ChevronDown className="h-3 w-3 opacity-50" />
		</Button>
	);

	const dropdown = (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>{filterButton}</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				{filters.map((filter) => (
					<DropdownMenuItem
						key={filter.value}
						onClick={() => handleFilterChange(filter.value)}
						className="flex cursor-pointer items-center justify-between"
					>
						<span>{filter.label}</span>
						{selectedFilter === filter.value && <Check className="h-4 w-4" />}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);

	if (label) {
		return (
			<div className={cn("flex items-center gap-2", className)}>
				<span className="text-muted-foreground text-sm font-medium">{label}</span>
				{dropdown}
			</div>
		);
	}

	return dropdown;
};
