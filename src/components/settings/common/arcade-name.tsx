import { useEffect, useMemo, useState } from "react";

import { ChevronsUpDown, CircleAlertIcon } from "lucide-react";
import { toast } from "sonner";

import Spinner from "@/components/common/spinner";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCurrentArcade, useUpdateArcadeName } from "@/hooks/users";

type Arcade = {
	id: number;
	name?: string;
	serial: string;
	arcade?: number;
	nickname?: string;
};

const ArcadeName = () => {
	const { data: currentArcade, isLoading } = useCurrentArcade();
	const { mutate: updateArcadeName, isPending } = useUpdateArcadeName();

	const [selectedArcadeIndex, setSelectedArcadeIndex] = useState<number | null>(null);
	const [openArcade, setOpenArcade] = useState(false);
	const [name, setName] = useState("");
	const [nickname, setNickname] = useState("");

	const selectedArcade = selectedArcadeIndex !== null ? (currentArcade?.[selectedArcadeIndex] as Arcade) : null;

	useEffect(() => {
		setName("");
		setNickname("");
	}, [selectedArcadeIndex, isLoading]);

	const canSubmit = useMemo(() => {
		const n = name.trim();
		const nn = nickname.trim();
		return !!selectedArcade && (n.length > 0 || nn.length > 0);
	}, [selectedArcade, name, nickname]);

	const handleSubmit = () => {
		if (!selectedArcade) return;

		const payload: { arcade: number; name?: string; nickname?: string } = {
			arcade: selectedArcade.id,
		};

		const trimmedName = name.trim();
		const trimmedNickname = nickname.trim();

		if (trimmedName) payload.name = trimmedName;
		if (trimmedNickname) payload.nickname = trimmedNickname;

		if (!payload.name && !payload.nickname) return;

		updateArcadeName(payload, {
			onSuccess: () => {
				toast.success("Arcade name updated successfully");
				setName("");
				setNickname("");
			},
			onError: (err) => {
				console.error(err);
				toast.error("Failed to update arcade name");
			},
		});
	};

	return (
		<div className="bg-card">
			<div className="mb-6">
				<h2 className="text-foreground mb-2 text-xl font-semibold">Change Arcade Name</h2>
				{isLoading ? (
					<div className="flex items-center gap-2">
						<Spinner size={16} />
						<span className="text-muted-foreground text-sm">Loading arcades...</span>
					</div>
				) : selectedArcade ? (
					<p className="text-muted-foreground text-sm">
						Update name or nickname for <span className="text-foreground font-medium">{selectedArcade.name}</span>
					</p>
				) : currentArcade && currentArcade.length > 0 ? (
					<p className="text-muted-foreground text-sm">Select an arcade to update its name or nickname</p>
				) : null}
			</div>

			{!isLoading && (!currentArcade || currentArcade.length === 0) ? (
				<div className="rounded-sm border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
					<div className="flex items-start gap-3">
						<div className="mt-0.5 text-amber-600 dark:text-amber-400">
							<CircleAlertIcon />
						</div>
						<div className="text-foreground text-sm dark:text-amber-200">
							<p className="mb-1 font-medium">No Arcade Assigned</p>
							<p>
								You currently have no arcade tied to your account. Please contact{" "}
								<span className="bg-primary text-primary-foreground rounded px-1.5 py-0.5 text-xs font-medium">
									@PolarisPyra
								</span>{" "}
								or{" "}
								<span className="bg-primary text-primary-foreground rounded px-1.5 py-0.5 text-xs font-medium">@azui.573</span>{" "}
								to get your assigned arcade back.
							</p>
						</div>
					</div>
				</div>
			) : (
				<div className="space-y-4">
					<div className="mb-4">
						<label className="text-foreground block pb-2 text-sm font-medium">Select Arcade</label>
						<Popover open={openArcade} onOpenChange={setOpenArcade}>
							<PopoverTrigger asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={openArcade}
							className={`inline-flex w-80 items-center justify-between gap-2 hover:cursor-pointer`}
						>
							{selectedArcade ? selectedArcade.name : "Choose an arcade"}
							<ChevronsUpDown className="opacity-50" />
						</Button>
							</PopoverTrigger>
							<PopoverContent className="w-80 p-0">
								<Command>
									<CommandInput placeholder="Search arcades..." />
									<CommandList>
										<CommandEmpty>No arcade found.</CommandEmpty>
										<CommandGroup>
											{currentArcade?.map((arcade, index) => (
												<CommandItem
													key={arcade.id}
													value={`${arcade.name} ${arcade.serial} ${arcade.nickname ?? ""}`}
													className="w-full cursor-pointer justify-between"
													onSelect={() => {
														setSelectedArcadeIndex(index);
														setOpenArcade(false);
													}}
												>
													<div>
														<span className="text-primary font-medium">
															{arcade.name} {arcade.serial}
														</span>
													</div>
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					</div>

					<div className="space-y-4">
						<div>
							<label className="text-foreground mb-2 block text-sm font-medium">New Name</label>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder={selectedArcade?.name ?? "Enter new name"}
								maxLength={255}
								className="w-full"
								disabled={!selectedArcade}
							/>
						</div>

						<div>
							<label className="text-foreground mb-2 block text-sm font-medium">New Nickname</label>
							<Input
								value={nickname}
								onChange={(e) => setNickname(e.target.value)}
								placeholder={selectedArcade?.nickname ?? "Enter new nickname"}
								maxLength={255}
								className="w-full"
								disabled={!selectedArcade}
							/>
						</div>
					</div>

				<div className="pt-4">
					<Button
						variant="custom"
						onClick={handleSubmit}
						disabled={!canSubmit || isPending}
						className="w-full items-center justify-center gap-2 rounded-md border border-transparent bg-primary p-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:border-muted/50 disabled:bg-muted disabled:text-muted-foreground"
						aria-busy={isPending}
					>
						{isPending ? (
							<>
								<Spinner size={16} className="mr-2" />
								<span>Updating Name...</span>
							</>
						) : (
							<span>Update</span>
						)}
					</Button>
				</div>
				</div>
			)}
		</div>
	);
};

export default ArcadeName;
