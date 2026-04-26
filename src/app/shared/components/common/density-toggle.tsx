import { LayoutGrid, List } from "lucide-react"

import { Button } from "@/app/shared/components/ui/button"
import { cn } from "@/app/shared/utils"

import type { Density } from "@/app/shared/hooks/use-score-page-state"

interface DensityToggleProps {
	density: Density
	onChange: (density: Density) => void
	className?: string
}

export function DensityToggle({ density, onChange, className }: DensityToggleProps) {
	return (
		<div className={cn("flex items-center gap-2", className)}>
			<Button
				variant={density === "grid" ? "secondary" : "outline"}
				size="sm"
				onClick={() => onChange("grid")}
				className="h-8 text-xs"
			>
				<LayoutGrid className="h-3.5 w-3.5" />
				Grid
			</Button>

			<Button
				variant={density === "list" ? "secondary" : "outline"}
				size="sm"
				onClick={() => onChange("list")}
				className="h-8 text-xs"
			>
				<List className="h-3.5 w-3.5" />
				List
			</Button>
		</div>
	)
}
