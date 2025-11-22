import { Building2, ChevronsUpDown, CreditCard, KeySquare, LogOut, SettingsIcon, UserCog } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useAdmin } from "@/app/features/admin/hooks"
import { hasAdminAccess } from "@/app/features/admin/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/shared/components/ui/avatar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/app/shared/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/app/shared/components/ui/sidebar"
import { useAuth } from "@/app/shared/hooks/auth/use-auth"

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

		// Listen for storage events (from other tabs)
		window.addEventListener("storage", handleStorageChange)
		// Listen for custom events (from same tab)
		window.addEventListener("bannerColorChange", handleStorageChange)

		// Poll for changes in the same tab (since storage event doesn't fire in same tab)
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

export function NavUser({
	user
}: {
	user: {
		username: string
		aimeCardId: string
		avatar: string
	}
}) {
	const { isMobile } = useSidebar()
	const { logout } = useAuth()
	const navigate = useNavigate()
	const { data: systemAdmin } = useAdmin()
	const adminPerms = hasAdminAccess(systemAdmin)
	const bannerColor = useBannerColor()

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer border-t ring-0 focus-visible:ring-0 focus-visible:outline-none rounded-none"
							style={{ borderTopColor: bannerColor, borderTopWidth: "1px" }}
						>
							<Avatar className="bg-background h-8 w-8 rounded-sm">
								<AvatarImage src={user.avatar} alt={user.username} />
								<AvatarFallback className="bg-background text-primary rounded-sm">
									{user.username.substring(0, 2).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="text-primary truncate font-semibold">{user.username}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4 text-gray-400" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="bg-background border-sidebar-border w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-sm border"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="bg-background h-8 w-8 rounded-sm">
									<AvatarImage src={user.avatar} alt={user.username} />
									<AvatarFallback className="text-primary bg-background rounded-sm">
										{user.username.substring(0, 2).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="text-primary truncate font-semibold">{user.username}</span>
									<span className="text-primary truncate text-xs">{user.aimeCardId}</span>
								</div>
							</div>
						</DropdownMenuLabel>

						<DropdownMenuSeparator className="bg-border" />
						{adminPerms && (
							<>
								<DropdownMenuGroup>
									<DropdownMenuLabel className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
										Admin
									</DropdownMenuLabel>
									<DropdownMenuItem
										onClick={() => navigate("/admin/keychip-generator")}
										className="text-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground cursor-pointer"
									>
										<KeySquare className="text-primary" />
										Keychip Generator
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => navigate("/admin/arcade-ownership")}
										className="text-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground cursor-pointer"
									>
										<Building2 className="text-primary" />
										Arcade Ownership
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => navigate("/admin/cards")}
										className="text-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground cursor-pointer"
									>
										<CreditCard className="text-primary" />
										Card Management
									</DropdownMenuItem>
								</DropdownMenuGroup>
								<DropdownMenuSeparator className="bg-border" />
							</>
						)}
						<DropdownMenuGroup>
							<DropdownMenuLabel className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
								Management
							</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={() => navigate("/cards")}
								className="text-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground cursor-pointer"
							>
								<CreditCard className="text-primary" />
								Edit Cards
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => navigate("/keychip")}
								className="text-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground cursor-pointer"
							>
								<KeySquare className="text-primary" />
								Edit keychips
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator className="bg-border" />
						<DropdownMenuGroup>
							<DropdownMenuLabel className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
								Game Settings
							</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={() => navigate("/chunithm/settings")}
								className="text-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground cursor-pointer"
							>
								<SettingsIcon className="text-primary" />
								Chunithm
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => navigate("/ongeki/settings")}
								className="text-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground cursor-pointer"
							>
								<SettingsIcon className="text-primary" />
								Ongeki
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => navigate("/maimaidx/settings")}
								className="text-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground cursor-pointer"
							>
								<SettingsIcon className="text-primary" />
								Maimai DX
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator className="bg-border" />
						<DropdownMenuGroup>
							<DropdownMenuItem
								onClick={() => navigate("/account")}
								className="text-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground cursor-pointer"
							>
								<UserCog className="text-primary" />
								Account Settings
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator className="bg-border" />
						<DropdownMenuItem
							onClick={logout}
							className="text-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground cursor-pointer"
						>
							<LogOut className="text-primary" />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
