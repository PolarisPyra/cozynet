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
		<div className={cn("relative grid grid-cols-2 bg-muted/40 p-1 rounded-xl border border-border/50 w-[160px] h-10", className)}>
			{/* Sliding Pill - Percentage based movement for perfect centering */}
			<div 
				className={cn(
					"absolute h-8 transition-all duration-500 rounded-lg bg-foreground shadow-md z-0 top-1",
					density === "grid" ? "left-1 w-[76px]" : "left-[81px] w-[76px]"
				)}
				style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
			/>

			<button
				onClick={() => onChange("grid")}
				className={cn(
					"relative z-10 flex items-center justify-center gap-1.5 h-8 rounded-lg transition-colors duration-300 select-none cursor-pointer",
					density === "grid" ? "text-background" : "text-muted-foreground hover:text-foreground"
				)}
			>
				<LayoutGrid className={cn("size-3.5 transition-transform duration-500", density === "grid" && "scale-110")} />
				<span className="text-[11px] font-bold uppercase tracking-wide pt-[0.5px]">Grid</span>
			</button>

			<button
				onClick={() => onChange("list")}
				className={cn(
					"relative z-10 flex items-center justify-center gap-1.5 h-8 rounded-lg transition-colors duration-300 select-none cursor-pointer",
					density === "list" ? "text-background" : "text-muted-foreground hover:text-foreground"
				)}
			>
				<List className={cn("size-3.5 transition-transform duration-500", density === "list" && "scale-110")} />
				<span className="text-[11px] font-bold uppercase tracking-wide pt-[0.5px]">List</span>
			</button>
		</div>
	)
}
