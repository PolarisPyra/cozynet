import { type ReactNode, useEffect, useMemo, useState } from "react"

import { Check, ChevronDown, Filter } from "lucide-react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"

import Header from "@/app/shared/components/common/header"
import { Button } from "@/app/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/shared/components/ui/dropdown-menu"
import { useChunithmVersion } from "@/app/features/chunithm/hooks"
import { cn } from "@/app/shared/utils/cn"

const TABS = [
	{ id: "avatar", label: "Avatar", path: "/chunithm/userbox/avatar" },
	{ id: "nameplate", label: "Nameplate", path: "/chunithm/userbox/nameplate" },
	{ id: "trophy", label: "Trophy", path: "/chunithm/userbox/trophy" },
	{ id: "systemvoice", label: "System Voice", path: "/chunithm/userbox/systemvoice" },
	{ id: "mapicon", label: "Map Icon", path: "/chunithm/userbox/mapicon" },
	{ id: "character", label: "Character", path: "/chunithm/userbox/character" },
	{ id: "stage", label: "Stage", path: "/chunithm/userbox/stage" }
] as const

export function UserboxSearchBar({ children }: UserboxSearchBarProps) {
	return (
		<div className="border-border bg-background/95 flex-shrink-0 backdrop-blur-sm">
			<div className="px-4 py-3">
				<div className="flex items-center gap-2">{children}</div>
			</div>
		</div>
	)
}

export function UserboxContent({ children, className }: UserboxContentProps) {
	return <div className={cn("px-2 pb-2 sm:p-4", className)}>{children}</div>
}

export function UserboxPreviewWrapper({ children, title, description }: UserboxPreviewWrapperProps) {
	return (
		<div className="mb-4 flex h-fit flex-col items-center justify-center">
			{title && <h3 className="text-primary text-xl font-semibold">{title}</h3>}
			{description && <p className="text-muted-foreground mt-2">{description}</p>}
			{children}
		</div>
	)
}

export function UserboxPreviewEmpty({ title, description }: UserboxPreviewEmptyProps) {
	return <UserboxPreviewWrapper title={title} description={description} />
}

export function UserboxPageWrapper({ children }: UserboxPageWrapperProps) {
	return <div className="flex h-full w-full flex-col">{children}</div>
}

export function UserboxSearchCommandWrapper({ children }: UserboxSearchCommandWrapperProps) {
	return <div className="flex-1">{children}</div>
}

export function UserboxPreviewImage({ src, alt, width, height, className }: UserboxPreviewImageProps) {
	return (
		<div style={{ maxWidth: "100%" }}>
			<img
				src={src}
				alt={alt}
				className={cn("mx-auto mb-2", className)}
				style={{ width, height, objectFit: "contain", borderRadius: "0.5rem" }}
			/>
		</div>
	)
}

export function UserboxEquipUnlockButton({
	item,
	hasChanges,
	onEquip,
	onUnlock,
	className
}: UserboxEquipUnlockButtonProps) {
	return (
		<Button
			onClick={() => (item.locked ? onUnlock() : onEquip())}
			disabled={!hasChanges && !item.locked}
			variant="custom"
			className={cn("mt-2 rounded-sm text-sm", className)}
		>
			{item.locked ? "Unlock" : "Equip"}
		</Button>
	)
}

function TabNavigation({ currentTab, onTabSelect }: TabNavigationProps) {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)

	return (
		<>
			<div className="block w-full lg:hidden">
				<DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							size="sm"
							className="border-input bg-background hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-between gap-2 rounded-sm hover:cursor-pointer"
						>
							<div className="flex items-center gap-2">
								<Filter className="h-4 w-4" />
								<span>{currentTab.label}</span>
							</div>
							<ChevronDown className="h-3 w-3 opacity-50" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="center" className="w-48">
						{TABS.map(tab => (
							<DropdownMenuItem
								key={tab.id}
								onClick={() => {
									onTabSelect(tab)
									setIsDropdownOpen(false)
								}}
								className="flex cursor-pointer items-center justify-between"
							>
								<span>{tab.label}</span>
								{currentTab.id === tab.id && <Check className="h-4 w-4" />}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="hidden w-full gap-2 lg:grid lg:grid-cols-5 xl:grid-cols-7">
				{TABS.map(tab => (
					<NavLink key={tab.id} to={tab.path}>
						<Button variant="custom" size="sm" className="w-full rounded-sm">
							<span className="truncate">{tab.label}</span>
						</Button>
					</NavLink>
				))}
			</div>
		</>
	)
}

export function UserboxLayout() {
	const version = useChunithmVersion()
	const location = useLocation()
	const navigate = useNavigate()

	const currentTab = useMemo(() => TABS.find(tab => location.pathname === tab.path) || TABS[0], [location.pathname])

	const handleTabSelect = (tab: (typeof TABS)[number]) => navigate(tab.path)

	useEffect(() => {
		if (location.pathname === "/chunithm/userbox") navigate("/chunithm/userbox/avatar", { replace: true })
	}, [location.pathname, navigate])

	if (!version) {
		return (
			<div className="relative flex h-screen flex-1 flex-col overflow-x-hidden">
				<Header title="Userbox" />
				<div className="flex h-[calc(100vh-64px)] items-center justify-center">
					<p className="text-primary text-sm sm:text-base">Please set your Chunithm version in settings first</p>
				</div>
			</div>
		)
	}

	return (
		<div className="relative flex h-screen flex-1 flex-col overflow-x-hidden">
			<Header title="Userbox" />
			<div className="flex min-h-0 flex-1 flex-col overflow-x-hidden">
				<div className="border-border bg-background/95 flex-shrink-0 backdrop-blur-sm">
					<div className="px-4 py-3">
						<TabNavigation currentTab={currentTab} onTabSelect={handleTabSelect} />
					</div>
				</div>
				<div className="xs:py-2 min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-0 py-1 sm:py-4">
					<Outlet />
				</div>
			</div>
		</div>
	)
}

interface UserboxSearchBarProps {
	children: ReactNode
}

interface UserboxContentProps {
	children: ReactNode
	className?: string
}

interface UserboxPreviewWrapperProps {
	children?: ReactNode
	title?: string
	description?: string
}

interface UserboxPreviewEmptyProps {
	title: string
	description?: string
}

interface UserboxPageWrapperProps {
	children: ReactNode
}

interface UserboxSearchCommandWrapperProps {
	children: ReactNode
}

interface UserboxPreviewImageProps {
	src: string
	alt: string
	width: number
	height: number
	className?: string
}

interface UserboxEquipUnlockButtonProps {
	item: { locked: boolean }
	hasChanges: boolean
	onEquip: () => void
	onUnlock: () => void
	className?: string
}

interface TabNavigationProps {
	currentTab: (typeof TABS)[number]
	onTabSelect: (tab: (typeof TABS)[number]) => void
}
