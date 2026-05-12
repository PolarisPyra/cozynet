import { LayoutGrid, List } from "lucide-react"

import type { Density } from "@/app/shared/hooks/use-score-page-state"
import { cn } from "@/app/shared/utils"

interface DensityToggleProps {
	density: Density
	onChange: (density: Density) => void
	className?: string
}

export function DensityToggle({ density, onChange, className }: DensityToggleProps) {
	return (
		<div
			className={cn(
				"bg-muted/40 border-border/50 relative grid h-10 w-[160px] grid-cols-2 rounded-xl border p-1",
				className
			)}
		>
			{/* Sliding Pill - Percentage based movement for perfect centering */}
			<div
				className={cn(
					"bg-foreground absolute top-1 z-0 h-8 rounded-lg shadow-md transition-all duration-500",
					density === "grid" ? "left-1 w-[76px]" : "left-[81px] w-[76px]"
				)}
				style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
			/>

			<button
				onClick={() => onChange("grid")}
				className={cn(
					"relative z-10 flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg transition-colors duration-300 select-none",
					density === "grid" ? "text-background" : "text-muted-foreground hover:text-foreground"
				)}
			>
				<LayoutGrid className={cn("size-3.5 transition-transform duration-500", density === "grid" && "scale-110")} />
				<span className="pt-[0.5px] text-[11px] font-bold tracking-wide uppercase">Grid</span>
			</button>

			<button
				onClick={() => onChange("list")}
				className={cn(
					"relative z-10 flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg transition-colors duration-300 select-none",
					density === "list" ? "text-background" : "text-muted-foreground hover:text-foreground"
				)}
			>
				<List className={cn("size-3.5 transition-transform duration-500", density === "list" && "scale-110")} />
				<span className="pt-[0.5px] text-[11px] font-bold tracking-wide uppercase">List</span>
			</button>
		</div>
	)
}
