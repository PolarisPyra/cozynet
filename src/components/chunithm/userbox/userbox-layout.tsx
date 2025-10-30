import { useEffect, useState } from "react";

import { Check, ChevronDown, Filter } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import Header from "@/components/common/header";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChunithmVersion } from "@/hooks/chunithm";

const UserboxLayout = () => {
	const version = useChunithmVersion();
	const location = useLocation();
	const navigate = useNavigate();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const tabs = [
		{ id: "avatar", label: "Avatar", path: "/chunithm/userbox/avatar" },
		{ id: "nameplate", label: "Nameplate", path: "/chunithm/userbox/nameplate" },
		{ id: "trophy", label: "Trophy", path: "/chunithm/userbox/trophy" },
		{ id: "systemvoice", label: "System Voice", path: "/chunithm/userbox/systemvoice" },
		{ id: "mapicon", label: "Map Icon", path: "/chunithm/userbox/mapicon" },
		{ id: "character", label: "Character", path: "/chunithm/userbox/character" },
		{ id: "stage", label: "Stage", path: "/chunithm/userbox/stage" },
	];

	const currentTab = tabs.find((tab) => location.pathname === tab.path) || tabs[0];

	const handleTabSelect = (tab: (typeof tabs)[0]) => {
		navigate(tab.path);
		setIsDropdownOpen(false);
	};

	// Redirect to avatar if we're at the base userbox route
	useEffect(() => {
		if (location.pathname === "/chunithm/userbox") {
			navigate("/chunithm/userbox/avatar", { replace: true });
		}
	}, [location.pathname, navigate]);

	return (
		<div className="relative flex h-screen flex-1 flex-col overflow-x-hidden">
			<Header title={"Userbox"} />
			{version ? (
				<div className="flex min-h-0 flex-1 flex-col overflow-x-hidden">
					{/* Tab Navigation */}
					<div className="border-border bg-background/95 flex-shrink-0 backdrop-blur-sm">
						<div className="px-4 py-3">
							{/* Mobile: Dropdown, Desktop: Grid */}
							<div className="flex justify-start">
								{/* Mobile/Tablet Dropdown */}
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
											{tabs.map((tab) => (
												<DropdownMenuItem
													key={tab.id}
													onClick={() => handleTabSelect(tab)}
													className="flex cursor-pointer items-center justify-between"
												>
													<span>{tab.label}</span>
													{currentTab.id === tab.id && <Check className="h-4 w-4" />}
												</DropdownMenuItem>
											))}
										</DropdownMenuContent>
									</DropdownMenu>
								</div>

								{/* Desktop Grid */}
								<div className="hidden w-full gap-2 lg:grid lg:grid-cols-5 xl:grid-cols-7">
									{tabs.map((tab) => (
										<NavLink key={tab.id} to={tab.path}>
											<Button variant="custom" size="sm" className="w-full rounded-sm">
												<span className="truncate">{tab.label}</span>
											</Button>
										</NavLink>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Tab Content */}
					<div className="xs:py-2 min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-0 py-1 sm:py-4">
						<Outlet />
					</div>
				</div>
			) : (
				<div className="flex h-[calc(100vh-64px)] items-center justify-center">
					<p className="text-primary text-sm sm:text-base">Please set your Chunithm version in settings first</p>
				</div>
			)}
		</div>
	);
};

export default UserboxLayout;
