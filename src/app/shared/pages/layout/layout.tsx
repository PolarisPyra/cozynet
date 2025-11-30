import React from "react"

import { cn } from "@/app/shared/utils"

type LayoutProps = React.HTMLAttributes<HTMLDivElement> & {
	children: React.ReactNode
}

export const Container = ({ className, children, ...props }: LayoutProps) => (
	<div className={cn("relative flex-1 overflow-auto", className)} {...props}>
		{children}
	</div>
)

export const Body = ({ className, children, ...props }: LayoutProps) => (
	<div className={cn("mb-4 px-4 pb-4 sm:py-0", className)} {...props}>
		{children}
	</div>
)

export const FilterArea = ({ className, children, ...props }: LayoutProps) => (
	<div className={cn("border-border flex-shrink-0 rounded-sm px-4 py-3 backdrop-blur-sm", className)} {...props}>
		{children}
	</div>
)

export const CardGrid = ({ className, children, ...props }: LayoutProps) => (
	<div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4", className)} {...props}>
		{children}
	</div>
)

export default Container
