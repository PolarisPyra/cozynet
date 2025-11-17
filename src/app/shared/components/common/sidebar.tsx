import React from "react"

import {
	BarChart3,
	BoomBox,
	ChevronRight,
	Folder,
	FolderOpen,
	HeartIcon,
	HomeIcon,
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
	SidebarMenuSub,
	SidebarSeparator
} from "@/app/shared/components/ui/sidebar"
import { useAuth } from "@/app/shared/hooks/auth"
import { cn } from "@/app/shared/utils"

import { NavUser } from "./nav-user"

type MenuItem = {
	name: string
	href?: string
	icon?: React.ElementType
	subnav?: MenuItem[]
}

const chunithmSubnav: MenuItem[] = [
	{
		name: "Scores",
		href: "/chunithm/scores",
		icon: NotepadText
	},
	{
		name: "Userbox",
		href: "/chunithm/userbox",
		icon: Pencil
	},
	{
		name: "Favorites",
		href: "/chunithm/favorites",
		icon: HeartIcon
	},
	{ name: "Rivals", href: "/chunithm/rivals", icon: Swords },
	{
		name: "Leaderboard",
		href: "/chunithm/leaderboard",
		icon: Trophy
	},
	{
		name: "All Songs",
		href: "/chunithm/allsongs",
		icon: BoomBox
	},
	{
		name: "Rating Frame",
		href: "/chunithm/rating",
		icon: List
	},
	{
		name: "Profile",
		href: "/chunithm/profile",
		icon: User
	}
]

const ongekiSubnav: MenuItem[] = [
	{
		name: "Scores",
		href: "/ongeki/scores",
		icon: NotepadText
	},
	{ name: "Rivals", href: "/ongeki/rivals", icon: Swords },
	{
		name: "Leaderboard",
		href: "/ongeki/leaderboard",
		icon: Trophy
	},
	{
		name: "All Songs",
		href: "/ongeki/allsongs",
		icon: BoomBox
	},
	{
		name: "Rating Frame",
		href: "/ongeki/rating",
		icon: List
	},
	{
		name: "Cards",
		href: "/ongeki/cards",
		icon: RectangleVertical
	},
	{
		name: "Profile",
		href: "/ongeki/profile",
		icon: User
	}
]

const maimaiSubNav: MenuItem[] = [
	{
		name: "Scores",
		href: "/maimaidx/scores",
		icon: NotepadText
	},
	{
		name: "All Songs",
		href: "/maimaidx/allsongs",
		icon: BoomBox
	}
]

const sidebarItems: MenuItem[] = [
	{ name: "Home", icon: HomeIcon, href: "/home" },
	{
		name: "SEGA",
		subnav: [
			{
				name: "Chunithm",
				icon: Folder,
				subnav: chunithmSubnav
			},
			{
				name: "Ongeki",
				icon: Folder,
				subnav: ongekiSubnav
			},
			{
				name: "Maimai DX",
				icon: Folder,
				subnav: maimaiSubNav
			}
		]
	}
]

export function SidebarComponent() {
	const [openCategories, setOpenCategories] = React.useState<Record<string, boolean>>(() => {
		const saved = localStorage.getItem("sidebar-open-categories")
		return saved ? JSON.parse(saved) : { SEGA: true }
	})
	const [openSubCategories, setOpenSubCategories] = React.useState<Record<string, boolean>>(() => {
		const saved = localStorage.getItem("sidebar-open-subcategories")
		return saved ? JSON.parse(saved) : { Chunithm: true, Ongeki: true, "Maimai DX": true }
	})
	const { user } = useAuth()
	const location = useLocation()

	// Save to localStorage whenever state changes
	React.useEffect(() => {
		localStorage.setItem("sidebar-open-categories", JSON.stringify(openCategories))
	}, [openCategories])

	React.useEffect(() => {
		localStorage.setItem("sidebar-open-subcategories", JSON.stringify(openSubCategories))
	}, [openSubCategories])

	const toggleCategory = (categoryName: string) => {
		setOpenCategories(prev => ({
			...prev,
			[categoryName]: !prev[categoryName]
		}))
	}

	const toggleSubCategory = (categoryName: string) => {
		setOpenSubCategories(prev => ({
			...prev,
			[categoryName]: !prev[categoryName]
		}))
	}

	if (!user) return null

	const userData = {
		username: user.username,
		aimeCardId: user.aimeCardId || "",
		avatar: ""
	}

	const isActiveRoute = (href?: string) => {
		if (!href) return false
		return location.pathname === href
	}

	const renderMenuItem = (item: MenuItem, isNestedSubmenuItem = false) => {
		const isActive = item.href ? isActiveRoute(item.href) : false
		const isOpen = isNestedSubmenuItem ? (openSubCategories[item.name] ?? false) : (openCategories[item.name] ?? false)
		const hasSubnav = item.subnav && item.subnav.length > 0

		// Use FolderOpen when expanded, Folder otherwise for subcategory folders
		let IconComponent = item.icon
		if (hasSubnav && !item.href && item.icon === Folder) {
			IconComponent = isOpen ? FolderOpen : Folder
		}

		if (item.href) {
			return (
				<SidebarMenuButton
					className={cn(
						"group relative flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-none",
						"hover:bg-sidebar-accent focus:bg-sidebar-accent focus:outline-none",
						isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary"
					)}
					asChild
					isActive={isActive}
				>
					<Link to={item.href} className="flex w-full items-center gap-3">
						{IconComponent && (
							<IconComponent
								className={cn("h-4 w-4 shrink-0 transition-none", isActive ? "text-foreground" : "text-foreground")}
							/>
						)}
						<span className="flex-1 truncate">{item.name}</span>
					</Link>
				</SidebarMenuButton>
			)
		} else {
			return (
				<>
					<SidebarMenuButton
						className={cn(
							"group relative flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-none",
							"hover:bg-sidebar-accent focus:bg-sidebar-accent cursor-pointer focus:outline-none"
						)}
						onClick={(e: React.MouseEvent) => {
							e.stopPropagation()
							if (isNestedSubmenuItem) {
								toggleSubCategory(item.name)
							} else {
								toggleCategory(item.name)
							}
						}}
					>
						{IconComponent && <IconComponent className="text-sidebar-foreground h-4 w-4 shrink-0" />}
						<span className="flex-1 truncate text-left">{item.name}</span>
						{hasSubnav && (
							<ChevronRight
								className={cn(
									"text-sidebar-foreground h-4 w-4 shrink-0 transition-transform duration-200",
									isOpen && "rotate-90"
								)}
							/>
						)}
					</SidebarMenuButton>
				</>
			)
		}
	}

	return (
		<Sidebar className="bg-background text-sidebar-foreground border-r">
			<SidebarHeader className="bg-background border-b px-6 py-5">
				<h2 className="text-sidebar-foreground text-xl font-bold">Cozynet</h2>
			</SidebarHeader>
			<SidebarContent className="bg-background px-3 py-4">
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu className="space-y-1">
							{sidebarItems.map((item, index) => (
								<React.Fragment key={index}>
									<SidebarMenuItem>
										{renderMenuItem(item)}
										{item.subnav && openCategories[item.name] && (
											<SidebarMenuSub className="mt-1 ml-0 space-y-1 border-none pl-0">
												{item.subnav.map((subItem, subIndex) => (
													<SidebarMenuItem key={`${index}-${subIndex}`}>
														{renderMenuItem(subItem, true)}
														{subItem.subnav && openSubCategories[subItem.name] && (
															<SidebarMenuSub className="mt-1 ml-4 space-y-1 pl-2">
																{subItem.subnav.map((nestedItem, nestedIndex) => (
																	<SidebarMenuItem key={`${index}-${subIndex}-${nestedIndex}`}>
																		{renderMenuItem(nestedItem)}
																	</SidebarMenuItem>
																))}
															</SidebarMenuSub>
														)}
													</SidebarMenuItem>
												))}
											</SidebarMenuSub>
										)}
									</SidebarMenuItem>
									{index < sidebarItems.length - 1 && item.name !== "Home" && (
										<SidebarSeparator className="bg-sidebar-border my-2" />
									)}
								</React.Fragment>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className="bg-background border-t px-3 py-4">
				<NavUser user={userData} />
			</SidebarFooter>
		</Sidebar>
	)
}
