import { useState } from "react";

import Avatar from "@/components/chunithm/userbox/avatar";
import MapIcon from "@/components/chunithm/userbox/map-icon";
import Nameplate from "@/components/chunithm/userbox/nameplate";
import SystemVoice from "@/components/chunithm/userbox/system-voice";
import Trophies from "@/components/chunithm/userbox/trophies";
import Header from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { useChunithmVersion } from "@/hooks/chunithm";
import { cn } from "@/lib/utils";

const ChunithmUserbox = () => {
	const version = useChunithmVersion();
	const [activeTab, setActiveTab] = useState("avatar");

	const tabs = [
		{ id: "avatar", label: "Avatar" },
		{ id: "nameplate", label: "Nameplate" },
		{ id: "trophy", label: "Trophy" },
		{ id: "systemvoice", label: "System Voice" },
		{ id: "mapicon", label: "Map Icon" },
	];

	const renderTabContent = () => {
		const active = "block h-full w-full";
		return (
			<>
				<div className={activeTab === "avatar" ? active : "hidden"}>
					<Avatar />
				</div>
				<div className={activeTab === "nameplate" ? active : "hidden"}>
					<Nameplate />
				</div>
				<div className={activeTab === "trophy" ? active : "hidden"}>
					<Trophies />
				</div>
				<div className={activeTab === "systemvoice" ? active : "hidden"}>
					<SystemVoice />
				</div>
				<div className={activeTab === "mapicon" ? active : "hidden"}>
					<MapIcon />
				</div>
			</>
		);
	};

	return (
		<div className="relative flex h-full flex-1 flex-col overflow-hidden">
			<Header title={"Userbox"} />
			{version ? (
				<div className="flex flex-1 flex-col overflow-hidden">
					{/* Tab Navigation */}
					<div className="border-border flex-shrink-0 backdrop-blur-sm">
						<div className="flex items-center justify-center px-4 py-3">
							<div className="bg-foreground/70 flex space-x-1 rounded-sm p-1">
								{tabs.map((tab) => (
									<Button
										key={tab.id}
										variant={activeTab === tab.id ? "default" : "ghost"}
										size="sm"
										onClick={() => setActiveTab(tab.id)}
										className={cn("cursor-pointer transition-all duration-200")}
									>
										{tab.label}
									</Button>
								))}
							</div>
						</div>
					</div>

					{/* Tab Content */}
					<div className="flex-1 overflow-hidden p-4">
						<div className="h-full">{renderTabContent()}</div>
					</div>
				</div>
			) : (
				<div className="flex h-[calc(100vh-64px)] items-center justify-center">
					<p className="text-primary">Please set your Chunithm version in settings first</p>
				</div>
			)}
		</div>
	);
};

export default ChunithmUserbox;
