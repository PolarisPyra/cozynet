import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/app/shared/utils"

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
	return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-2", className)} {...props} />
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
	return (
		<TabsPrimitive.List
			data-slot="tabs-list"
			className={cn(
				"inline-flex h-10 items-center justify-center rounded-lg bg-muted/40 p-1 text-muted-foreground backdrop-blur-sm border border-border/50 w-fit",
				className
			)}
			{...props}
		/>
	)
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
	return (
		<TabsPrimitive.Trigger
			data-slot="tabs-trigger"
			className={cn(
				"inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-foreground/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:text-foreground cursor-pointer active:scale-95 h-full",
				className
			)}
			{...props}
		/>
	)
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
	return <TabsPrimitive.Content data-slot="tabs-content" className={cn("flex-1 outline-none mt-4", className)} {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
