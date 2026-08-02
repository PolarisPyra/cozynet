import React, { useCallback, useEffect, useMemo, useState } from "react"

import {
	Bell,
	BoomBox,
	ChevronRight,
	Folder,
	FolderOpen,
	Globe2,
	HeartIcon,
	Joystick,
	LayoutGrid,
	List,
	MonitorCog,
	NotepadText,
	Pencil,
	SettingsIcon,
	Swords,
	Trophy,
	User
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import { useAccentColor } from "@/app/shared/components/accent-color-provider"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub
} from "@/app/shared/components/ui/sidebar"
import { useAuth } from "@/app/shared/hooks/auth/use-auth"
import { cn } from "@/app/shared/utils"

import { NavUser } from "./nav-user"

interface MenuItem {
	name: string
	href?: string
	icon?: React.ElementType
	children?: MenuItem[]
}

const MENU_CONFIG: MenuItem[] = [
	{
		name: "General",
		icon: LayoutGrid,
		children: [
			{ name: "Announcements", icon: Bell, href: "/home" },
			{ name: "Profile", icon: User, href: "/profile" }
		]
	},
	{
		name: "SEGA",
		icon: Joystick,
		children: [
			{
				name: "Chunithm",
				icon: Folder,
				children: [
					{ name: "Scores", href: "/chunithm/scores", icon: NotepadText },
					{ name: "Userbox", href: "/chunithm/userbox", icon: Pencil },
					{ name: "Favorites", href: "/chunithm/favorites", icon: HeartIcon },
					{ name: "Rivals", href: "/chunithm/rivals", icon: Swords },
					{ name: "Leaderboard", href: "/chunithm/leaderboard", icon: Trophy },
					{ name: "All Songs", href: "/chunithm/allsongs", icon: BoomBox },
					{ name: "Rating Frame", href: "/chunithm/rating", icon: List },
					{ name: "Profile", href: "/chunithm/profile", icon: User }
				]
			},
			{
				name: "Ongeki",
				icon: Folder,
				children: [
					{ name: "Scores", href: "/ongeki/scores", icon: NotepadText },
					{ name: "Deck Builder", href: "/ongeki/cards", icon: LayoutGrid },
					{ name: "Rivals", href: "/ongeki/rivals", icon: Swords },
					{ name: "Leaderboard", href: "/ongeki/leaderboard", icon: Trophy },
					{ name: "All Songs", href: "/ongeki/allsongs", icon: BoomBox },
					{ name: "Rating Frame", href: "/ongeki/rating", icon: List },
					{ name: "Profile", href: "/ongeki/profile", icon: User }
				]
			}
		]
	},
	{
		name: "Konami",
		icon: Joystick,
		children: [
			{
				name: "Pop'n Music",
				icon: Folder,
				children: [
					{ name: "Scores", href: "/konami/popn/scores", icon: NotepadText },
					{ name: "All Songs", href: "/konami/popn/allsongs", icon: BoomBox }
				]
			}
		]
	},
	{
		name: "Account",
		icon: User,
		children: [
			{ name: "General", icon: SettingsIcon, href: "/account/general" },
			{ name: "Cabinets", icon: MonitorCog, href: "/account/cabinets" },
			{ name: "Allnet", icon: Globe2, href: "/account/allnet" },
			{ name: "Bemani", icon: Globe2, href: "/account/bemani" }
		]
	}
]

const STORAGE_KEY = "sidebar-expanded"

function getAllExpandableNames(items: MenuItem[]): string[] {
	return items.flatMap(item => (item.children ? [item.name, ...getAllExpandableNames(item.children)] : []))
}

function useExpandedState() {
	const [expanded, setExpanded] = useState<Set<string>>(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY)
			return new Set(saved ? JSON.parse(saved) : getAllExpandableNames(MENU_CONFIG))
		} catch {
			return new Set(getAllExpandableNames(MENU_CONFIG))
		}
	})

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify([...expanded]))
	}, [expanded])

	const toggle = useCallback((name: string) => {
		setExpanded(prev => {
			const next = new Set(prev)
			if (next.has(name)) {
				next.delete(name)
			} else {
				next.add(name)
			}
			return next
		})
	}, [])

	const isExpanded = useCallback((name: string) => expanded.has(name), [expanded])

	return { toggle, isExpanded }
}

interface MenuItemProps {
	item: MenuItem
	depth?: number
	isExpanded: (name: string) => boolean
	onToggle: (name: string) => void
	currentPath: string
	accentColor?: string
}

const MenuItemComponent = React.memo(function MenuItemComponent({
	item,
	depth = 0,
	isExpanded,
	onToggle,
	currentPath,
	accentColor: accentColorProp
}: MenuItemProps) {
	const { name, href, icon: Icon, children } = item
	const hasChildren = children && children.length > 0
	const isOpen = isExpanded(name)
	const isActive = href === currentPath

	const DisplayIcon = useMemo(() => {
		if (hasChildren && Icon === Folder) {
			return isOpen ? FolderOpen : Folder
		}
		return Icon
	}, [hasChildren, Icon, isOpen])

	const borderColor = isActive && accentColorProp ? accentColorProp : undefined
	const iconColor = isActive && accentColorProp ? accentColorProp : undefined
	const textColor = isActive && accentColorProp ? accentColorProp : undefined

	const buttonContent = (
		<>
			{DisplayIcon && (
				<DisplayIcon
					className={cn("size-4 shrink-0", !iconColor && isActive && "text-primary")}
					style={iconColor ? { color: iconColor } : undefined}
				/>
			)}
			<span
				className={cn("truncate font-medium", !textColor && isActive && "text-primary")}
				style={textColor ? { color: textColor } : undefined}
			>
				{name}
			</span>
			{hasChildren && (
				<ChevronRight
					className={cn("ml-auto size-4 shrink-0 transition-all duration-500", isOpen && "scale-125 rotate-90")}
					style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
				/>
			)}
		</>
	)

	const renderChildren = () => {
		if (!hasChildren || !isOpen) return null

		return (
			<SidebarMenuSub className="mr-0 pr-0">
				{children.map(child => (
					<MenuItemComponent
						key={child.name}
						item={child}
						depth={depth + 1}
						isExpanded={isExpanded}
						onToggle={onToggle}
						currentPath={currentPath}
						accentColor={accentColorProp}
					/>
				))}
			</SidebarMenuSub>
		)
	}

	if (depth === 0) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton onClick={() => hasChildren && onToggle(name)} className="cursor-pointer !font-normal">
						{buttonContent}
					</SidebarMenuButton>
					{renderChildren()}
				</SidebarMenuItem>
			</SidebarMenu>
		)
	}

	return (
		<SidebarMenuItem>
			{href ? (
				<SidebarMenuButton
					asChild
					isActive={isActive}
					className={cn(
						"hover:bg-accent/50 transition-colors duration-200",
						isActive && "border-l-2",
						!borderColor && isActive && "border-primary"
					)}
					style={borderColor ? { borderLeftColor: borderColor } : undefined}
				>
					<Link to={href}>{buttonContent}</Link>
				</SidebarMenuButton>
			) : (
				<SidebarMenuButton onClick={() => hasChildren && onToggle(name)} className="cursor-pointer">
					{buttonContent}
				</SidebarMenuButton>
			)}
			{renderChildren()}
		</SidebarMenuItem>
	)
})

export function SidebarComponent() {
	const { user } = useAuth()
	const location = useLocation()
	const { toggle, isExpanded } = useExpandedState()
	const accentColor = useAccentColor()

	const userData = useMemo(() => {
		if (!user) return null
		return {
			username: user.username,
			aimeCardId: user.aimeCardId ?? "",
			avatar: ""
		}
	}, [user])

	if (!userData) return null

	return (
		<Sidebar className="bg-background">
			<SidebarHeader>
				<div className="flex items-center gap-2 px-2 py-4">
					<span className="text-lg font-semibold">Cozynet</span>
				</div>
			</SidebarHeader>

			<SidebarContent>
				{MENU_CONFIG.map(section => (
					<SidebarGroup key={section.name} className="py-0">
						<SidebarGroupContent>
							<MenuItemComponent
								item={section}
								isExpanded={isExpanded}
								onToggle={toggle}
								currentPath={location.pathname}
								accentColor={accentColor}
							/>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>

			<SidebarFooter>
				<NavUser user={userData} />
			</SidebarFooter>
		</Sidebar>
	)
}
