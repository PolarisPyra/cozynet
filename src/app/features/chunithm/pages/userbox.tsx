import { useState } from "react"

import { Avatar } from "@/app/features/chunithm/components/userbox/avatar"
import { MapiconCustomization } from "@/app/features/chunithm/components/userbox/map-icon"
import { NameplateCustomization } from "@/app/features/chunithm/components/userbox/nameplate"
import { SystemvoiceCustomization } from "@/app/features/chunithm/components/userbox/system-voice"
import { TrophyCustomization } from "@/app/features/chunithm/components/userbox/trophies"
import Header from "@/app/shared/components/common/header"
import { Button } from "@/app/shared/components/ui/button"
import { useChunithmVersion } from "@/app/features/chunithm/hooks"
import { cn } from "@/app/shared/utils"

const ChunithmUserbox = () => {
	const version = useChunithmVersion()
	const [activeTab, setActiveTab] = useState("avatar")

	const tabs = [
		{ id: "avatar", label: "Avatar" },
		{ id: "nameplate", label: "Nameplate" },
		{ id: "trophy", label: "Trophy" },
		{ id: "systemvoice", label: "System Voice" },
		{ id: "mapicon", label: "Map Icon" }
	]

	const renderTabContent = () => {
		const active = "block h-full w-full"
		return (
			<>
				<div className={activeTab === "avatar" ? active : "hidden"}>
					<Avatar />
				</div>
				<div className={activeTab === "nameplate" ? active : "hidden"}>
					<NameplateCustomization />
				</div>
				<div className={activeTab === "trophy" ? active : "hidden"}>
					<TrophyCustomization />
				</div>
				<div className={activeTab === "systemvoice" ? active : "hidden"}>
					<SystemvoiceCustomization />
				</div>
				<div className={activeTab === "mapicon" ? active : "hidden"}>
					<MapiconCustomization />
				</div>
			</>
		)
	}

	return (
		<div className="relative flex h-full flex-1 flex-col overflow-hidden">
			<Header title={"Userbox"} />
			{version ? (
				<div className="flex flex-1 flex-col overflow-hidden">
					{/* Tab Navigation */}
					<div className="border-border flex-shrink-0 backdrop-blur-sm">
						<div className="flex items-center justify-center px-4 py-3">
							<div className="bg-foreground/70 flex space-x-1 rounded-sm p-1">
								{tabs.map(tab => (
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
	)
}

export default ChunithmUserbox
