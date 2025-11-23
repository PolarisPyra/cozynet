import React, { useCallback, useEffect, useMemo, useState } from "react"

import {
	Bell,
	BoomBox,
	ChevronRight,
	Folder,
	FolderOpen,
	HeartIcon,
	Joystick,
	LayoutGrid,
	List,
	NotepadText,
	Pencil,
	RectangleVertical,
	Swords,
	Trophy,
	User
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

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

const DEFAULT_BANNER_COLOR = "#ef4444"
const BANNER_COLOR_KEY = "profile-banner-color"

const isValidHex = (value: string): boolean => /^#[0-9A-Fa-f]{6}$/.test(value)

const useBannerColor = (): string => {
	const [bannerColor, setBannerColor] = useState<string>(() => {
		if (typeof window === "undefined") return DEFAULT_BANNER_COLOR
		const stored = localStorage.getItem(BANNER_COLOR_KEY)
		return stored && isValidHex(stored) ? stored : DEFAULT_BANNER_COLOR
	})

	useEffect(() => {
		const handleStorageChange = () => {
			const stored = localStorage.getItem(BANNER_COLOR_KEY)
			if (stored && isValidHex(stored)) {
				setBannerColor(stored)
			}
		}

		window.addEventListener("storage", handleStorageChange)
		window.addEventListener("bannerColorChange", handleStorageChange)

		const interval = setInterval(() => {
			const stored = localStorage.getItem(BANNER_COLOR_KEY)
			if (stored && isValidHex(stored) && stored !== bannerColor) {
				setBannerColor(stored)
			}
		}, 100)

		return () => {
			window.removeEventListener("storage", handleStorageChange)
			window.removeEventListener("bannerColorChange", handleStorageChange)
			clearInterval(interval)
		}
	}, [bannerColor])

	return bannerColor
}

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
					{ name: "Userbox", href: "/ongeki/userbox", icon: Pencil },
					{ name: "Rivals", href: "/ongeki/rivals", icon: Swords },
					{ name: "Leaderboard", href: "/ongeki/leaderboard", icon: Trophy },
					{ name: "All Songs", href: "/ongeki/allsongs", icon: BoomBox },
					{ name: "Rating Frame", href: "/ongeki/rating", icon: List },
					{ name: "Cards", href: "/ongeki/cards", icon: RectangleVertical },
					{ name: "Profile", href: "/ongeki/profile", icon: User }
				]
			},
			{
				name: "Maimai DX",
				icon: Folder,
				children: [
					{ name: "Scores", href: "/maimaidx/scores", icon: NotepadText },
					{ name: "All Songs", href: "/maimaidx/allsongs", icon: BoomBox },
					{ name: "Rating Frame", href: "/maimaidx/rating", icon: List }
				]
			}
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
			next.has(name) ? next.delete(name) : next.add(name)
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
	bannerColor?: string
}

const MenuItemComponent = React.memo(function MenuItemComponent({
	item,
	depth = 0,
	isExpanded,
	onToggle,
	currentPath,
	bannerColor
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

	const borderColor = isActive && bannerColor ? bannerColor : undefined

	const buttonContent = (
		<>
			{DisplayIcon && <DisplayIcon className={cn("size-4 shrink-0", isActive && "text-primary")} />}
			<span className={cn("truncate", isActive && "text-primary")}>{name}</span>
			{hasChildren && (
				<ChevronRight
					className={cn("ml-auto size-4 shrink-0 transition-transform duration-200", isOpen && "rotate-90")}
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
						bannerColor={bannerColor}
					/>
				))}
			</SidebarMenuSub>
		)
	}

	if (depth === 0) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton onClick={() => hasChildren && onToggle(name)} className="cursor-pointer">
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
					className={cn(isActive && "border-l-2", !borderColor && isActive && "border-primary")}
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
	const bannerColor = useBannerColor()

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
								bannerColor={bannerColor}
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
