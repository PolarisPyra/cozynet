import React from "react"

import { cn } from "@/lib/utils"

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
	children: React.ReactNode
}

export const Container = ({ className, children, ...props }: ContainerProps) => (
	<div className={cn("relative flex-1 overflow-auto", className)} {...props}>
		{children}
	</div>
)

export const Body = ({ className, children, ...props }: ContainerProps) => (
	<div className={cn("mb-4 px-4 pb-4 sm:py-0", className)} {...props}>
		{children}
	</div>
)

export const FilterArea = ({ className, children, ...props }: ContainerProps) => (
	<div
		className={cn("border-border bg-background/95 flex-shrink-0 rounded-sm py-3 backdrop-blur-sm", className)}
		{...props}
	>
		{children}
	</div>
)

export default Container
