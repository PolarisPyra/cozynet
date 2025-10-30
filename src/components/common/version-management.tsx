import React, { useState } from "react";

import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface VersionManagementProps {
	title: string;
	currentVersion: number | undefined;
	availableVersions: number[] | undefined;
	isUpdating: boolean;
	onUpdateVersion: (version: number) => void;
	versions: Record<number, string>;
	buttonLabel?: string;
	updatingLabel?: string;
}

const VersionManagement: React.FC<VersionManagementProps> = ({
	title,
	currentVersion,
	availableVersions,
	isUpdating,
	onUpdateVersion,
	versions,
	buttonLabel = "Update settings",
	updatingLabel = "Updating...",
}) => {
	const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
	const [openDropdown, setOpenDropdown] = useState(false);

	const getGameTitle = (version: number | undefined): string => {
		if (!version) return "Select a version";
		return versions[version] || `Version ${version}`;
	};

	const handleUpdate = () => {
		if (!selectedVersion) {
			toast.error("Please select a version first");
			return;
		}

		onUpdateVersion(selectedVersion);
	};

	return (
		<div className="bg-card rounded-sm p-4 md:p-6">
			<h2 className="text-primary mb-4 text-xl font-semibold">{title}</h2>

			<div className="mb-4">
				<Popover open={openDropdown} onOpenChange={setOpenDropdown}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={openDropdown}
							className="w-full cursor-pointer justify-between"
						>
							{getGameTitle(selectedVersion || currentVersion)}
							<ChevronDown className="opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent align="start" className="w-full p-0">
						<Command>
							<CommandInput placeholder="Search versions..." />
							<CommandList>
								<CommandEmpty>No version found.</CommandEmpty>
								<CommandGroup>
									{availableVersions?.map((version) => (
										<CommandItem
											className="cursor-pointer"
											key={version}
											value={`${version}`}
											onSelect={(val: string) => {
												setSelectedVersion(Number(val));
												setOpenDropdown(false);
											}}
										>
											<span className="text-primary">{getGameTitle(version)}</span>
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			</div>

			<Button onClick={handleUpdate} variant="custom" disabled={isUpdating || !selectedVersion}>
				{isUpdating ? updatingLabel : buttonLabel}
			</Button>
		</div>
	);
};

export default VersionManagement;
