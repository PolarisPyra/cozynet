import { useState } from "react"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Copy, Eye, EyeOff, Gamepad, Pencil, Plus, X } from "lucide-react"
import { toast } from "sonner"

import Header from "@/app/shared/components/common/header"
import { Pagination } from "@/app/shared/components/common/pagination"
import { Button } from "@/app/shared/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/app/shared/components/ui/dialog"
import { Input } from "@/app/shared/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/shared/components/ui/popover"
import { STANDARD_PAGE_SIZE } from "@/app/shared/constants/pagination"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import { Body, Container } from "@/app/shared/pages/layout/layout"
import { api } from "@/app/shared/utils"

interface Keychip {
	id: number
	serial: string
	arcade_name: string | null
	arcade_nickname: string | null
	arcade: number
}

interface ErrorResponse {
	message?: string
}

const KeychipPage = () => {
	const queryClient = useQueryClient()
	const [hiddenKeychips, setHiddenKeychips] = useState<Record<number, boolean>>({})
	const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
	const [renameDialogOpen, setRenameDialogOpen] = useState<number | null>(null)
	const [removeDialogOpen, setRemoveDialogOpen] = useState<number | null>(null)
	const [placeName, setPlaceName] = useState("")
	const [hoveredIcon, setHoveredIcon] = useState<{ keychipId: number; type: "eye" | "copy" | "edit" } | null>(null)

	const { data: keychipsData, isLoading } = useQuery<{ keychips: Keychip[] }>({
		queryKey: ["user", "keychips"],
		queryFn: async () => {
			const response = await api.common.keychip.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch keychips")
			}
			return await response.json()
		}
	})

	const generateKeychip = useMutation({
		mutationFn: async () => {
			const response = await api.common.keychip.generate.$post()
			if (!response.ok) {
				const error = (await response.json()) as ErrorResponse
				throw new Error(error.message || "Failed to generate keychip")
			}
			return await response.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user", "keychips"] })
			setGenerateDialogOpen(false)
			toast.success("Keychip generated successfully")
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to generate keychip")
		}
	})

	const renameKeychip = useMutation({
		mutationFn: async ({ keychipId, placeName }: { keychipId: string; placeName: string }) => {
			const response = await api.common.keychip.rename.$post({
				json: { keychipId, placeName }
			})
			if (!response.ok) {
				const error = (await response.json()) as ErrorResponse
				throw new Error(error.message || "Failed to rename keychip")
			}
			return await response.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user", "keychips"] })
			setRenameDialogOpen(null)
			setPlaceName("")
			toast.success("Keychip renamed successfully")
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to rename keychip")
		}
	})

	const removeKeychip = useMutation({
		mutationFn: async (keychipId: number) => {
			const response = await api.common.keychip[":id"].$delete({
				param: { id: keychipId.toString() }
			})
			if (!response.ok) {
				const error = (await response.json()) as ErrorResponse
				throw new Error(error.message || "Failed to remove keychip")
			}
			return await response.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user", "keychips"] })
			setRemoveDialogOpen(null)
			toast.success("Keychip removed successfully")
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to remove keychip")
		}
	})

	const toggleKeychipVisibility = (keychipId: number) => {
		setHiddenKeychips(prev => ({
			...prev,
			[keychipId]: !(prev[keychipId] ?? true)
		}))
	}

	/**
	 * Formats keychip ID for display: A69E01A85421811 -> A69E-01A85421811
	 * This is purely for frontend display - server stores raw format
	 */
	const formatKeychipId = (keychipId: string, hidden: boolean): string => {
		if (hidden) {
			// Display as: A69E-****** (first 4 chars, dash, then masked)
			return keychipId.substring(0, 4) + "-******"
		}
		// Format: A69E01A85421811 -> A69E-01A85421811 (add dash after E for display)
		return keychipId.substring(0, 4) + "-" + keychipId.substring(4)
	}

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text)
		toast.success("Copied to clipboard")
	}

	const allKeychips = keychipsData?.keychips || []
	const { page, setPage, totalPages, paged: paginatedKeychips, hasMore } = usePagination(allKeychips, STANDARD_PAGE_SIZE, [allKeychips.length])

	return (
		<Container>
			<Header title="Keychip Management" />
			<Body>
				<div className="mb-4 space-y-6">
					<div className="bg-card text-card-foreground rounded-sm p-4">
						<div className="mb-2 flex items-center gap-2">
							<Gamepad />
							<h2 className="text-lg font-semibold">My Keychips</h2>
						</div>
						<p className="text-muted-foreground text-sm">
							Manage your keychips. Generate new keychips, rename them, or remove them.
						</p>
					</div>

					{isLoading ? (
						<div className="flex h-64 items-center justify-center">
							<div className="text-muted-foreground">Loading keychips...</div>
						</div>
					) : (
						<>
							<div className="grid gap-4 md:grid-cols-2">
								{paginatedKeychips.map(keychip => {
									const isHidden = hiddenKeychips[keychip.id] ?? true
									const displayId = formatKeychipId(keychip.serial, isHidden)
									const placeNameDisplay = keychip.arcade_nickname || keychip.arcade_name || `Keychip ${keychip.id}`

									return (
										<div key={keychip.id} className="bg-card text-card-foreground rounded-sm border p-4">
											<div className="mb-3 flex items-center justify-between">
												<div className="flex items-center gap-2">
													<Gamepad className="h-5 w-5" />
													<span className="font-semibold">{placeNameDisplay}</span>
												</div>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => setRemoveDialogOpen(keychip.id)}
													className="text-destructive hover:text-destructive"
												>
													<X className="h-4 w-4" />
												</Button>
											</div>

											<div className="mb-3 space-y-2">
												<div>
													<label className="text-muted-foreground mb-1 block text-sm font-medium">Keychip ID</label>
													<div className="flex items-center gap-2">
														<code className="bg-muted flex-1 rounded px-2 py-1 font-mono text-sm">{displayId}</code>
														<Popover
															open={hoveredIcon?.keychipId === keychip.id && hoveredIcon?.type === "eye"}
															onOpenChange={() => {}}
														>
															<PopoverTrigger asChild>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => toggleKeychipVisibility(keychip.id)}
																	onMouseEnter={() => setHoveredIcon({ keychipId: keychip.id, type: "eye" })}
																	onMouseLeave={() => setHoveredIcon(null)}
																	onBlur={e => e.currentTarget.blur()}
																	className="h-8 w-8 p-0 focus-visible:ring-0 focus-visible:outline-none"
																>
																	{isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
																</Button>
															</PopoverTrigger>
															<PopoverContent
																className="w-auto p-2 text-xs"
																side="top"
																onMouseEnter={() => setHoveredIcon({ keychipId: keychip.id, type: "eye" })}
																onMouseLeave={() => setHoveredIcon(null)}
															>
																{isHidden ? "Show keychip ID" : "Hide keychip ID"}
															</PopoverContent>
														</Popover>
														<Popover
															open={hoveredIcon?.keychipId === keychip.id && hoveredIcon?.type === "copy"}
															onOpenChange={() => {}}
														>
															<PopoverTrigger asChild>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => copyToClipboard(keychip.serial)}
																	onMouseEnter={() => setHoveredIcon({ keychipId: keychip.id, type: "copy" })}
																	onMouseLeave={() => setHoveredIcon(null)}
																	onBlur={e => e.currentTarget.blur()}
																	className="h-8 w-8 p-0 focus-visible:ring-0 focus-visible:outline-none"
																>
																	<Copy className="h-4 w-4" />
																</Button>
															</PopoverTrigger>
															<PopoverContent
																className="w-auto p-2 text-xs"
																side="top"
																onMouseEnter={() => setHoveredIcon({ keychipId: keychip.id, type: "copy" })}
																onMouseLeave={() => setHoveredIcon(null)}
															>
																Copy keychip ID to clipboard
															</PopoverContent>
														</Popover>
													</div>
												</div>
											</div>

											<div className="flex gap-2">
												<Popover
													open={hoveredIcon?.keychipId === keychip.id && hoveredIcon?.type === "edit"}
													onOpenChange={() => {}}
												>
													<PopoverTrigger asChild>
														<Button
															variant="outline"
															size="sm"
															onClick={() => {
																setPlaceName(placeNameDisplay)
																setRenameDialogOpen(keychip.id)
															}}
															onMouseEnter={() => setHoveredIcon({ keychipId: keychip.id, type: "edit" })}
															onMouseLeave={() => setHoveredIcon(null)}
															onBlur={e => e.currentTarget.blur()}
															className="focus-visible:ring-0 focus-visible:outline-none"
														>
															<Pencil className="mr-2 h-4 w-4" />
															Rename
														</Button>
													</PopoverTrigger>
													<PopoverContent
														className="w-auto p-2 text-xs"
														side="top"
														onMouseEnter={() => setHoveredIcon({ keychipId: keychip.id, type: "edit" })}
														onMouseLeave={() => setHoveredIcon(null)}
													>
														Rename arcade
													</PopoverContent>
												</Popover>
											</div>

											{/* Rename Dialog */}
											<Dialog
												open={renameDialogOpen === keychip.id}
												onOpenChange={open => setRenameDialogOpen(open ? keychip.id : null)}
											>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>Rename Keychip</DialogTitle>
														<DialogDescription>Enter a new name for this keychip.</DialogDescription>
													</DialogHeader>
													<div className="space-y-4">
														<Input
															value={placeName}
															onChange={e => setPlaceName(e.target.value)}
															placeholder="Enter place name"
															maxLength={20}
														/>
													</div>
													<DialogFooter>
														<Button variant="outline" onClick={() => setRenameDialogOpen(null)}>
															Cancel
														</Button>
														<Button
															onClick={() => renameKeychip.mutate({ keychipId: keychip.serial, placeName })}
															disabled={renameKeychip.isPending || !placeName.trim()}
														>
															{renameKeychip.isPending ? "Renaming..." : "Rename"}
														</Button>
													</DialogFooter>
												</DialogContent>
											</Dialog>

											{/* Remove Dialog */}
											<Dialog
												open={removeDialogOpen === keychip.id}
												onOpenChange={open => setRemoveDialogOpen(open ? keychip.id : null)}
											>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>Remove Keychip</DialogTitle>
														<DialogDescription>
															Are you sure you want to remove this keychip? This action cannot be undone.
														</DialogDescription>
													</DialogHeader>
													<DialogFooter>
														<Button variant="outline" onClick={() => setRemoveDialogOpen(null)}>
															Cancel
														</Button>
														<Button
															variant="destructive"
															onClick={() => removeKeychip.mutate(keychip.id)}
															disabled={removeKeychip.isPending}
														>
															{removeKeychip.isPending ? "Removing..." : "Remove"}
														</Button>
													</DialogFooter>
												</DialogContent>
											</Dialog>
										</div>
									)
								})}

								{/* Generate Keychip Button */}
								<Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
									<DialogTrigger asChild>
										<button className="bg-card text-card-foreground hover:bg-muted/50 flex h-full min-h-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed transition-colors">
											<Plus className="text-muted-foreground h-8 w-8" />
											<span className="text-muted-foreground font-medium">Generate Keychip</span>
										</button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Generate Keychip</DialogTitle>
											<DialogDescription>Generate a new keychip for your account.</DialogDescription>
										</DialogHeader>
										<DialogFooter>
											<Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
												Cancel
											</Button>
											<Button onClick={() => generateKeychip.mutate()} disabled={generateKeychip.isPending}>
												{generateKeychip.isPending ? "Generating..." : "Generate"}
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</div>
							{hasMore && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
						</>
					)}
				</div>
			</Body>
		</Container>
	)
}

export default KeychipPage
