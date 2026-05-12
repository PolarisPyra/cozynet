import type { ReactNode } from "react"

import { Body } from "@/app/shared/pages/layout/layout"
import { cn } from "@/app/shared/utils"

type UserboxPageShellProps = {
	children: ReactNode
	aside?: ReactNode
	asideTitle?: string
	asideDescription?: string
	toolbar?: ReactNode
	className?: string
	contentClassName?: string
}

export function UserboxPageShell({
	children,
	aside,
	asideTitle,
	asideDescription,
	toolbar,
	className,
	contentClassName
}: UserboxPageShellProps) {
	const hasAside = Boolean(aside)

	return (
		<Body className={cn("px-3 pb-8 sm:px-4 lg:px-6", className)}>
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
				{toolbar && <div className={cn(!hasAside && "mx-auto w-full max-w-xl")}>{toolbar}</div>}
				<div
					className={cn(
						"grid gap-5",
						hasAside
							? "lg:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] xl:grid-cols-[24rem_minmax(0,1fr)]"
							: "mx-auto w-full max-w-xl"
					)}
				>
					{hasAside && (
						<aside className="min-w-0 lg:sticky lg:top-20 lg:self-start">
							<div className="border-border/70 bg-card/70 overflow-hidden rounded-md border shadow-sm">
								{(asideTitle || asideDescription) && (
									<div className="border-border/70 bg-muted/30 border-b px-4 py-3">
										{asideTitle && <h2 className="text-foreground text-sm font-semibold">{asideTitle}</h2>}
										{asideDescription && <p className="text-muted-foreground mt-0.5 text-xs">{asideDescription}</p>}
									</div>
								)}
								<div className="p-4">{aside}</div>
							</div>
						</aside>
					)}

					<section className={cn("min-w-0", contentClassName)}>{children}</section>
				</div>
			</div>
		</Body>
	)
}

export function UserboxSetupRequired({ children }: { children: ReactNode }) {
	return (
		<Body className="flex min-h-[calc(100vh-9rem)] items-center justify-center px-4">
			<div className="border-border/70 bg-card/70 w-full max-w-md rounded-md border p-6 text-center shadow-sm">
				<div className="text-foreground text-sm font-semibold">Setup required</div>
				<p className="text-muted-foreground mt-2 text-sm">{children}</p>
			</div>
		</Body>
	)
}
