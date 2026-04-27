import { Download, Upload, Loader2, Cloud } from "lucide-react"
import { Button } from "@/app/shared/components/ui/button"
import { cn } from "@/app/shared/utils"

interface KamaiSyncButtonsProps {
	onExport: () => void
	isExporting: boolean
	importDialog: React.ReactNode
	className?: string
}

export function KamaiSyncButtons({
	onExport,
	isExporting,
	importDialog,
	className
}: KamaiSyncButtonsProps) {
	return (
		<div
			className={cn(
				"inline-flex items-center gap-1 rounded-lg border border-border/50 bg-muted/40 p-1 backdrop-blur-sm transition-all",
				className
			)}
		>
			<div className="flex items-center gap-2 px-3 py-1.5 border-r border-border/50 mr-1 select-none">
				<Cloud className="h-4 w-4 text-pink-500" />
				<span className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
					Kamaitachi
				</span>
			</div>
			
			<div className="flex gap-1">
				<Button
					onClick={onExport}
					variant="ghost"
					size="sm"
					disabled={isExporting}
					className="h-8 gap-2 rounded-md text-xs font-semibold text-foreground/70 hover:bg-accent hover:text-accent-foreground"
				>
					{isExporting ? (
						<Loader2 className="h-3.5 w-3.5 animate-spin" />
					) : (
						<Upload className="h-3.5 w-3.5" />
					)}
					{isExporting ? "Exporting..." : "Export"}
				</Button>

				<div className="contents [&_button]:h-8 [&_button]:gap-2 [&_button]:rounded-md [&_button]:text-xs [&_button]:font-semibold [&_button]:text-foreground/70 [&_button]:variant-ghost [&_button]:bg-transparent [&_button]:hover:bg-accent [&_button]:hover:text-accent-foreground [&_button]:border-0 [&_button]:shadow-none [&_button]:px-3">
					{importDialog}
				</div>
			</div>
		</div>
	)
}

/**
 * Custom wrapper for the Import Dialog Trigger to match the Kamai style
 */
export function KamaiImportTrigger({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex items-center gap-2">
			<Download className="h-3.5 w-3.5" />
			{children}
		</div>
	)
}
