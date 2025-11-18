import { ChevronsUpDown, CreditCard, Gamepad, LayoutDashboard, LogOut, SettingsIcon, UserCog } from "lucide-react"
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

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer ring-0"
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
										onClick={() => navigate("/admin")}
										className="text-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground cursor-pointer"
									>
										<LayoutDashboard className="text-primary" />
										Dashboard
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
								Card Management
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => navigate("/keychip")}
								className="text-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground cursor-pointer"
							>
								<Gamepad />
								Keychip Management
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator className="bg-border" />
						<DropdownMenuGroup>
							<DropdownMenuLabel className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
								Games
							</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={() => navigate("/maimaidx/settings")}
								className="text-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground cursor-pointer"
							>
								<SettingsIcon className="text-primary" />
								Maimai DX Settings
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => navigate("/ongeki/settings")}
								className="text-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground cursor-pointer"
							>
								<SettingsIcon className="text-primary" />
								Ongeki Settings
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => navigate("/chunithm/settings")}
								className="text-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground cursor-pointer"
							>
								<SettingsIcon className="text-primary" />
								Chunithm Settings
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
