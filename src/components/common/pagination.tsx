import React from "react";

import { Button } from "@/components/ui/button";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	showKeyboardHints?: boolean;
	className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
	currentPage,
	totalPages,
	onPageChange,
	showKeyboardHints = true,
	className,
}) => {
	if (totalPages <= 1) return null;

	return (
		<div className={`flex flex-col items-center justify-between gap-4 pt-4 sm:flex-row ${className || ""}`}>
			<div className="text-muted-foreground flex flex-col items-center space-y-1 text-sm sm:items-start">
				<div className="text-center sm:text-left">
					Page {currentPage} of {totalPages}
				</div>
			</div>
			<div className="flex flex-col items-center space-y-3">
				<div className="flex items-center space-x-2">
					<Button
						variant="secondary"
						size="sm"
						className="bg-card border-border hover:bg-muted min-w-[80px] cursor-pointer border"
						onClick={() => onPageChange(Math.max(1, currentPage - 1))}
						disabled={currentPage === 1}
					>
						Previous
					</Button>
					<Button
						variant="secondary"
						size="sm"
						className="bg-card border-border hover:bg-muted min-w-[80px] cursor-pointer border"
						onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
						disabled={currentPage === totalPages}
					>
						Next
					</Button>
				</div>
				{showKeyboardHints && (
					<div className="text-muted-foreground flex items-center gap-3 text-xs">
						<div className="flex items-center gap-1">
							<kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium select-none">
								←
							</kbd>
							<span className="hidden sm:inline">Previous</span>
						</div>
						<div className="flex items-center gap-1">
							<kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium select-none">
								→
							</kbd>
							<span className="hidden sm:inline">Next</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
