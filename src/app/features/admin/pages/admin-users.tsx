import { useMemo, useRef, useState } from "react"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
	Ban,
	Building2,
	ChevronsUpDown,
	CreditCard,
	KeySquare,
	Lock,
	MoreVertical,
	Pencil,
	ShieldAlert,
	ShieldCheck,
	ShieldX,
	Shuffle,
	Trash2,
	Unlock,
	X
} from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import Header from "@/app/shared/components/common/header"
import { Pagination } from "@/app/shared/components/common/pagination"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from "@/app/shared/components/ui/alert-dialog"
import { Badge } from "@/app/shared/components/ui/badge"
import { Button } from "@/app/shared/components/ui/button"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from "@/app/shared/components/ui/command"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/app/shared/components/ui/dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/app/shared/components/ui/dropdown-menu"
import { Input } from "@/app/shared/components/ui/input"
import { Label } from "@/app/shared/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/shared/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/shared/components/ui/select"
import { Skeleton } from "@/app/shared/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/shared/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/shared/components/ui/tabs"
import { STANDARD_PAGE_SIZE } from "@/app/shared/constants/pagination"
import { usePagination } from "@/app/shared/hooks/use-pagination"
import { Body, Container } from "@/app/shared/pages/layout/layout"
import { UserRole } from "@/app/shared/types"
import { api } from "@/app/shared/utils"

import { AdminGameProfiles } from "../components/admin-game-profiles"
import { KeychipGenerator } from "../components/keychip-generator"

type UserWithDetails = {
	id: number
	username: string | null
	email: string | null
	permissions: number
	created_date: string | null
	last_login_date: string | null
	suspend_expire_time: string | null
	cards: {
		id: number
		user: number
		access_code: string
		created_date: string
		is_locked: boolean
		is_banned: boolean
	}[]
	arcades: { user: number; id: number; name: string; nickname: string }[]
	gameUsernames: {
		chunithm: string | null
		ongeki: string | null
		maimaidx: string | null
	}
}

type SortOrder = "id_desc" | "id_asc"
type ArcadeLookup = {
	id: number
	name: string | null
	nickname: string | null
	serial: string
	ownerUser: number | null
	ownerUsername: string | null
}

const getUserLabel = (username: string | null, id: number) => username || `User #${id}`

const getGameUsernameSummary = (gameUsernames: UserWithDetails["gameUsernames"]) =>
	[
		gameUsernames.chunithm && `CHUNITHM: ${gameUsernames.chunithm}`,
		gameUsernames.ongeki && `ONGEKI: ${gameUsernames.ongeki}`,
		gameUsernames.maimaidx && `maimai: ${gameUsernames.maimaidx}`
	]
		.filter(Boolean)
		.join(" · ")

const normalizeSearchText = (value: string) => value.normalize("NFKC").toLocaleLowerCase()

const commandFilter = (value: string, search: string) =>
	normalizeSearchText(value).includes(normalizeSearchText(search)) ? 1 : 0

const getArcadeLabel = (arcade: { id: number; name: string | null; nickname: string | null }) =>
	arcade.nickname || arcade.name || `Arcade #${arcade.id}`

const AdminUsers = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const searchQuery = searchParams.get("search") || ""
	const sortOrder: SortOrder = searchParams.get("sort") === "id_asc" ? "id_asc" : "id_desc"

	const queryClient = useQueryClient()
	const [editingUser, setEditingUser] = useState<UserWithDetails | null>(null)
	const [deletingUser, setDeletingUser] = useState<UserWithDetails | null>(null)
	const [pruneDialogOpen, setPruneDialogOpen] = useState(false)
	const [keychipGeneratorOpen, setKeychipGeneratorOpen] = useState(false)
	const [ownerDialogOpen, setOwnerDialogOpen] = useState(false)
	const [ownerConfirmOpen, setOwnerConfirmOpen] = useState(false)
	const [serialSearch, setSerialSearch] = useState("")
	const [arcadeLookup, setArcadeLookup] = useState<ArcadeLookup | null>(null)
	const [selectedOwnerId, setSelectedOwnerId] = useState("")
	const [serialPickerOpen, setSerialPickerOpen] = useState(false)
	const [ownerPickerOpen, setOwnerPickerOpen] = useState(false)
	const ownerDialogContentRef = useRef<HTMLDivElement>(null)

	const [editForm, setEditForm] = useState({
		username: "",
		email: "",
		permissions: 0
	})

	const { data, isLoading } = useQuery({
		queryKey: ["admin", "users"],
		queryFn: async () => {
			const res = await api.admin.users.$get()
			if (!res.ok) throw new Error("Failed to fetch users")
			return await res.json()
		}
	})

	const { data: arcadeData } = useQuery({
		queryKey: ["admin", "arcades"],
		queryFn: async () => {
			const res = await api.admin.arcades.$get()
			if (!res.ok) throw new Error("Failed to fetch arcades")
			return await res.json()
		}
	})

	const allUsers = useMemo(() => (data?.users as unknown as UserWithDetails[]) || [], [data])
	const availableArcades = useMemo(
		() => (arcadeData as unknown as { arcades?: ArcadeLookup[] } | undefined)?.arcades ?? [],
		[arcadeData]
	)

	const filteredUsers = useMemo(() => {
		if (!searchQuery.trim()) return allUsers
		const query = searchQuery.trim().toLowerCase()
		return allUsers.filter(
			u =>
				(u.username && u.username.toLowerCase().includes(query)) ||
				(u.email && u.email.toLowerCase().includes(query)) ||
				u.id.toString().includes(query)
		)
	}, [allUsers, searchQuery])

	const sortedUsers = useMemo(() => {
		return [...filteredUsers].sort((a, b) => (sortOrder === "id_desc" ? b.id - a.id : a.id - b.id))
	}, [filteredUsers, sortOrder])

	const {
		page,
		setPage,
		totalPages,
		paged: paginatedUsers,
		hasMore
	} = usePagination(sortedUsers, STANDARD_PAGE_SIZE, [searchQuery, sortOrder])

	const searchItems = useMemo(() => {
		return allUsers.map(u => ({
			id: u.id,
			title: `${getUserLabel(u.username, u.id)} (ID ${u.id})`
		}))
	}, [allUsers])

	const setSearchParam = (key: string, value: string | null) => {
		setSearchParams(prev => {
			const next = new URLSearchParams(prev)
			if (value) next.set(key, value)
			else next.delete(key)
			return next
		})
	}

	const updateMutation = useMutation({
		mutationFn: async ({ id, data }: { id: number; data: typeof editForm }) => {
			const res = await api.admin.users[":id"].$put({
				param: { id: id.toString() },
				json: data
			})
			if (!res.ok) throw new Error("Failed to update user")
			return await res.json()
		},
		onSuccess: () => {
			toast.success("User updated successfully")
			setEditingUser(null)
			queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
		},
		onError: () => {
			toast.error("Failed to update user")
		}
	})

	const banMutation = useMutation({
		mutationFn: async ({ id, banned }: { id: number; banned: boolean }) => {
			const res = await api.admin.users[":id"].ban.$post({
				param: { id: id.toString() },
				json: { banned }
			})
			if (!res.ok) throw new Error("Failed to update ban status")
			return await res.json()
		},
		onSuccess: (_, variables) => {
			toast.success(variables.banned ? "User banned successfully" : "User unbanned successfully")
			queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
		},
		onError: () => toast.error("Failed to update ban status")
	})

	const lockMutation = useMutation({
		mutationFn: async ({ id, locked }: { id: number; locked: boolean }) => {
			const res = await api.admin.users[":id"].lock.$post({
				param: { id: id.toString() },
				json: { locked }
			})
			if (!res.ok) throw new Error("Failed to update lock status")
			return await res.json()
		},
		onSuccess: (_, variables) => {
			toast.success(variables.locked ? "Account locked successfully" : "Account unlocked successfully")
			queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
		},
		onError: () => toast.error("Failed to update lock status")
	})

	const ownerMutation = useMutation({
		mutationFn: async ({ arcadeId, userId }: { arcadeId: number; userId: number }) => {
			const res = await api.admin.arcades[":id"].owner.$post({
				param: { id: arcadeId.toString() },
				json: { userId }
			})
			if (!res.ok) {
				const errorBody = (await res.json().catch(() => null)) as { error?: string; message?: string } | null
				throw new Error(errorBody?.error || errorBody?.message || "Failed to reassign arcade owner")
			}
			return await res.json()
		},
		onSuccess: result => {
			toast.success(`Arcade reassigned to ${result.username || `user #${result.userId}`}`)
			setOwnerConfirmOpen(false)
			setOwnerDialogOpen(false)
			setSerialPickerOpen(false)
			setOwnerPickerOpen(false)
			setArcadeLookup(null)
			setSerialSearch("")
			setSelectedOwnerId("")
			queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
			queryClient.invalidateQueries({ queryKey: ["admin", "arcades"] })
		},
		onError: error => toast.error(error instanceof Error ? error.message : "Failed to reassign arcade owner")
	})

	const selectArcade = (serial: string) => {
		setSerialSearch(serial)
		setArcadeLookup(availableArcades.find(arcade => arcade.serial === serial) ?? null)
		setSelectedOwnerId("")
	}

	const openOwnerDialog = () => {
		setSelectedOwnerId("")
		setSerialPickerOpen(false)
		setOwnerPickerOpen(false)
		setOwnerDialogOpen(true)
	}

	const deleteMutation = useMutation({
		mutationFn: async (id: number) => {
			const res = await api.admin.users[":id"].$delete({
				param: { id: id.toString() }
			})
			if (!res.ok) throw new Error("Failed to delete user")
			return await res.json()
		},
		onSuccess: () => {
			toast.success("User cascade deleted successfully")
			setDeletingUser(null)
			queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
		},
		onError: () => {
			toast.error("Failed to delete user")
		}
	})

	const prunePreviewQuery = useQuery({
		queryKey: ["admin", "prune-inactive-preview"],
		enabled: false,
		queryFn: async () => {
			const res = await api.admin.users["prune-inactive"].preview.$get()
			if (!res.ok) throw new Error("Failed to preview inactive users")
			return await res.json()
		}
	})

	const pruneMutation = useMutation({
		mutationFn: async (userIds: number[]) => {
			const res = await api.admin.users["prune-inactive"].$post({ json: { userIds } })
			if (!res.ok) {
				const body = (await res.json().catch(() => null)) as { message?: string; error?: string } | null
				throw new Error(body?.message || body?.error || "Failed to prune inactive users")
			}
			return await res.json()
		},
		onSuccess: result => {
			toast.success(`Pruned ${result.deletedUserIds.length} inactive users`)
			setPruneDialogOpen(false)
			queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
			queryClient.invalidateQueries({ queryKey: ["admin", "arcades"] })
		},
		onError: error => toast.error(error instanceof Error ? error.message : "Failed to prune inactive users")
	})

	const openEditModal = (user: UserWithDetails) => {
		setEditingUser(user)
		setEditForm({
			username: user.username ?? "",
			email: user.email ?? "",
			permissions: user.permissions
		})
	}

	const deferMenuAction = (action: () => void) => {
		window.setTimeout(action, 0)
	}

	const handleEditSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!editingUser) return
		updateMutation.mutate({ id: editingUser.id, data: editForm })
	}

	const formatDate = (dateStr: string | null) => {
		if (!dateStr || dateStr === "0000-00-00 00:00:00") return "Never"
		return new Date(dateStr).toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
			year: "numeric"
		})
	}

	const isBanned = (cards: UserWithDetails["cards"]) => cards.length > 0 && cards.some(c => c.is_banned)
	const isLocked = (cards: UserWithDetails["cards"]) => cards.length > 0 && cards.some(c => c.is_locked)
	return (
		<Container>
			<Header
				title="User Management"
				searchProps={{
					items: searchItems,
					onSelect: (_, item) => setSearchParam("search", item ? item.id.toString() : null),
					placeholder: "Search users...",
					emptyMessage: "No users found.",
					groupLabel: "Users"
				}}
			/>
			<Body>
				<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<Select value={sortOrder} onValueChange={value => setSearchParam("sort", value)}>
							<SelectTrigger size="sm" className="w-[150px] py-0 text-xs">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="id_desc">Newest ID first</SelectItem>
								<SelectItem value="id_asc">Oldest ID first</SelectItem>
							</SelectContent>
						</Select>
						<Dialog open={keychipGeneratorOpen} onOpenChange={setKeychipGeneratorOpen}>
							<DialogTrigger asChild>
								<Button variant="outline" size="sm" className="h-8 text-xs">
									<KeySquare className="mr-1 size-3.5" />
									Generate Keychip
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle>Keychip Generator</DialogTitle>
									<DialogDescription>Makes a new keychip</DialogDescription>
								</DialogHeader>
								<div className="pt-2">
									<KeychipGenerator />
								</div>
							</DialogContent>
						</Dialog>
						<Dialog
							open={ownerDialogOpen}
							onOpenChange={open => {
								setOwnerDialogOpen(open)
								if (!open) {
									setOwnerConfirmOpen(false)
									setSerialPickerOpen(false)
									setOwnerPickerOpen(false)
								}
							}}
						>
							<DialogContent ref={ownerDialogContentRef} className="sm:max-w-lg">
								<DialogHeader>
									<DialogTitle>Reassign Arcade Owner</DialogTitle>
									<DialogDescription>Find an arcade by its exact PCBID/keychip serial.</DialogDescription>
								</DialogHeader>
								<div className="space-y-4 pt-2">
									<Popover modal={false} open={serialPickerOpen} onOpenChange={setSerialPickerOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={serialPickerOpen}
												className="w-full justify-between"
											>
												{serialSearch || "Select PCBID/keychip serial"}
												<ChevronsUpDown className="size-4 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent
											container={ownerDialogContentRef.current}
											className="w-[--radix-popover-trigger-width] p-0"
										>
											<Command filter={commandFilter}>
												<CommandInput autoFocus placeholder="Search serials or arcades..." />
												<CommandList className="max-h-64 overflow-y-auto">
													<CommandEmpty>No matching arcade found.</CommandEmpty>
													<CommandGroup>
														{availableArcades.map(arcade => (
															<CommandItem
																key={`${arcade.id}-${arcade.serial}`}
																value={`${arcade.serial} ${getArcadeLabel(arcade)} ${arcade.ownerUsername ?? ""}`}
																onSelect={() => {
																	selectArcade(arcade.serial)
																	setSerialPickerOpen(false)
																}}
															>
																<div className="flex min-w-0 flex-col">
																	<span className="font-mono text-xs">{arcade.serial}</span>
																	<span className="text-muted-foreground truncate text-xs">
																		{getArcadeLabel(arcade)} ·{" "}
																		{arcade.ownerUsername ? `Owner: ${arcade.ownerUsername}` : "No owner"}
																	</span>
																</div>
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
									{arcadeLookup && (
										<div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-md border p-3 text-sm">
											<span className="text-muted-foreground">Arcade</span>
											<span className="truncate font-medium">{getArcadeLabel(arcadeLookup)}</span>
											<span className="text-muted-foreground">Serial</span>
											<span className="truncate font-mono text-xs">{arcadeLookup.serial}</span>
											<span className="text-muted-foreground">Current owner</span>
											<span className="truncate">
												{arcadeLookup.ownerUser
													? `${getUserLabel(arcadeLookup.ownerUsername, arcadeLookup.ownerUser)} · ID ${arcadeLookup.ownerUser}`
													: "None"}
											</span>
											<span className="text-muted-foreground">New owner</span>
											<span>
												<Popover open={ownerPickerOpen} onOpenChange={setOwnerPickerOpen} modal={false}>
													<PopoverTrigger asChild>
														<Button
															variant="outline"
															role="combobox"
															aria-expanded={ownerPickerOpen}
															className="w-full justify-between"
														>
															{selectedOwnerId
																? getUserLabel(
																		allUsers.find(user => user.id.toString() === selectedOwnerId)?.username ?? null,
																		Number(selectedOwnerId)
																	)
																: "Select intended owner"}
															<ChevronsUpDown className="size-4 opacity-50" />
														</Button>
													</PopoverTrigger>
													<PopoverContent
														align="end"
														container={ownerDialogContentRef.current}
														className="w-[--radix-popover-trigger-width] p-0"
													>
														<Command filter={commandFilter}>
															<CommandInput autoFocus placeholder="Search usernames or player names..." />
															<CommandList className="max-h-64 overflow-y-auto">
																<CommandEmpty>No matching user found.</CommandEmpty>
																<CommandGroup>
																	{allUsers.map(user => (
																		<CommandItem
																			key={user.id}
																			value={`${user.username ?? ""} ${user.id} ${user.gameUsernames.chunithm ?? ""} ${user.gameUsernames.ongeki ?? ""} ${user.gameUsernames.maimaidx ?? ""}`}
																			onSelect={() => {
																				setSelectedOwnerId(user.id.toString())
																				setOwnerPickerOpen(false)
																			}}
																		>
																			<div className="flex min-w-0 flex-col">
																				<span>
																					{getUserLabel(user.username, user.id)} (ID {user.id})
																				</span>
																				<span className="text-muted-foreground truncate text-xs">
																					{getGameUsernameSummary(user.gameUsernames) || "No game usernames"}
																				</span>
																			</div>
																		</CommandItem>
																	))}
																</CommandGroup>
															</CommandList>
														</Command>
													</PopoverContent>
												</Popover>
											</span>
											<span />
											<span>
												{ownerConfirmOpen ? (
													<div className="flex justify-end gap-2">
														<Button
															variant="outline"
															size="sm"
															onClick={() => setOwnerConfirmOpen(false)}
															disabled={ownerMutation.isPending}
														>
															Cancel
														</Button>
														<Button
															size="sm"
															disabled={ownerMutation.isPending || !arcadeLookup || !selectedOwnerId}
															onClick={() => {
																if (arcadeLookup && selectedOwnerId)
																	ownerMutation.mutate({ arcadeId: arcadeLookup.id, userId: Number(selectedOwnerId) })
															}}
														>
															{ownerMutation.isPending ? "Reassigning..." : "Reassign owner"}
														</Button>
													</div>
												) : (
													<Button
														className="w-full"
														disabled={!selectedOwnerId}
														onClick={() => setOwnerConfirmOpen(true)}
													>
														Confirm reassignment
													</Button>
												)}
											</span>
										</div>
									)}
								</div>
							</DialogContent>
						</Dialog>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" className="h-8 text-xs" onClick={openOwnerDialog}>
							<Shuffle className="mr-1 size-3.5" />
							Transfer Arcade Ownership
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive h-8 text-xs focus-visible:ring-0"
							onClick={() => {
								setPruneDialogOpen(true)
								prunePreviewQuery.refetch()
							}}
						>
							<Trash2 className="mr-1 size-3.5" />
							Prune Inactive Users
						</Button>
						{searchQuery && (
							<div className="flex items-center gap-2">
								<div className="text-muted-foreground text-sm">
									{sortedUsers.length} {sortedUsers.length === 1 ? "user" : "users"} found
								</div>
								<Button
									variant="ghost"
									size="sm"
									className="h-8 px-2 text-xs"
									onClick={() => setSearchParam("search", null)}
								>
									<X className="mr-1 size-3" />
									Clear search
								</Button>
							</div>
						)}
					</div>
				</div>

				{isLoading ? (
					<div className="bg-card overflow-hidden rounded-lg border">
						<Table className="w-full min-w-[800px]">
							<TableHeader className="[&_tr]:bg-muted/35">
								<TableRow>
									<TableHead className="w-16">ID</TableHead>
									<TableHead>Username</TableHead>
									<TableHead>Ban Status</TableHead>
									<TableHead>Lock Status</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Activity</TableHead>
									<TableHead>Arcades</TableHead>
									<TableHead>Cards</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{[...Array(5)].map((_, i) => (
									<TableRow key={i}>
										<TableCell>
											<Skeleton className="h-4 w-8" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-24" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-5 w-16 rounded-full" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-5 w-16 rounded-full" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-5 w-12 rounded-full" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-20" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-6 w-8 rounded-md" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-6 w-8 rounded-md" />
										</TableCell>
										<TableCell className="text-right">
											<Skeleton className="ml-auto h-8 w-8 rounded-md" />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				) : (
					<>
						<div className="bg-card overflow-hidden rounded-lg border">
							<Table className="w-full min-w-[1200px]">
								<colgroup>
									<col className="w-16" />
									<col className="w-[15%]" />
									<col className="w-[10%]" />
									<col className="w-[10%]" />
									<col className="w-[10%]" />
									<col className="w-[15%]" />
									<col className="w-[10%]" />
									<col className="w-[10%]" />
									<col className="w-[10%]" />
								</colgroup>
								<TableHeader className="[&_tr]:bg-muted/35">
									<TableRow>
										<TableHead>ID</TableHead>
										<TableHead>Username</TableHead>
										<TableHead>Ban Status</TableHead>
										<TableHead>Lock Status</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>Last Active</TableHead>
										<TableHead>Arcades</TableHead>
										<TableHead>Cards</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{paginatedUsers.length === 0 ? (
										<TableRow>
											<TableCell colSpan={9} className="text-muted-foreground p-8 text-center">
												No users found
											</TableCell>
										</TableRow>
									) : (
										paginatedUsers.map(user => (
											<TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
												<TableCell className="h-16 leading-none font-medium">{user.id}</TableCell>
												<TableCell className="h-16 leading-none font-semibold">
													{user.username || <span className="text-muted-foreground">User #{user.id}</span>}
												</TableCell>
												<TableCell className="h-16 leading-none">
													{isBanned(user.cards) ? (
														<Badge
															variant="secondary"
															className="flex h-4 w-fit items-center gap-1 border-none text-[10px]"
														>
															<ShieldX className="size-2.5" /> Banned
														</Badge>
													) : (
														<span className="text-muted-foreground text-[10px] font-medium">Not Banned</span>
													)}
												</TableCell>
												<TableCell className="h-16 leading-none">
													{isLocked(user.cards) ? (
														<Badge
															variant="secondary"
															className="flex h-4 w-fit items-center gap-1 border-none text-[10px]"
														>
															<Lock className="size-2.5" /> Locked
														</Badge>
													) : (
														<span className="text-muted-foreground text-[10px] font-medium">Not Locked</span>
													)}
												</TableCell>
												<TableCell className="h-16 leading-none">
													{user.permissions === UserRole.Admin ? (
														<Badge variant="default" className="flex w-fit items-center gap-1">
															<ShieldCheck className="size-3" /> Admin
														</Badge>
													) : (
														<Badge variant="secondary" className="flex w-fit items-center gap-1">
															User
														</Badge>
													)}
												</TableCell>
												<TableCell className="text-muted-foreground h-16 text-sm leading-none">
													{formatDate(user.last_login_date)}
												</TableCell>
												<TableCell className="h-16 leading-none">
													{user.arcades.length > 0 ? (
														<Popover>
															<PopoverTrigger asChild>
																<Button variant="outline" size="sm" className="h-6 px-2 py-0 text-xs">
																	<Building2 className="mr-1 size-3" />
																	{user.arcades.length}
																</Button>
															</PopoverTrigger>
															<PopoverContent align="start" className="max-h-64 w-64 overflow-y-auto">
																<div className="space-y-2">
																	<h4 className="text-sm font-semibold">Assigned Arcades</h4>
																	<div className="flex flex-col gap-1">
																		{user.arcades.map(a => (
																			<div
																				key={a.id}
																				className="text-muted-foreground flex items-center gap-2 border-b pb-1 text-xs last:border-0"
																			>
																				<Building2 className="size-3 flex-shrink-0" />
																				<span className="truncate">{getArcadeLabel(a)}</span>
																			</div>
																		))}
																	</div>
																</div>
															</PopoverContent>
														</Popover>
													) : (
														<span className="text-muted-foreground text-xs">None</span>
													)}
												</TableCell>
												<TableCell className="h-16 leading-none">
													{user.cards.length > 0 ? (
														<Popover>
															<PopoverTrigger asChild>
																<Button variant="outline" size="sm" className="h-6 px-2 py-0 text-xs">
																	<CreditCard className="mr-1 size-3" />
																	{user.cards.length}
																</Button>
															</PopoverTrigger>
															<PopoverContent align="start" className="max-h-64 w-56 overflow-y-auto">
																<div className="space-y-2">
																	<h4 className="text-sm font-semibold">Aime Cards</h4>
																	<div className="flex flex-col gap-1">
																		{user.cards.map(c => (
																			<div
																				key={c.id}
																				className="text-muted-foreground flex items-center gap-2 border-b pb-1 font-mono text-xs last:border-0"
																			>
																				<CreditCard className="size-3 flex-shrink-0" />
																				{c.access_code}
																			</div>
																		))}
																	</div>
																</div>
															</PopoverContent>
														</Popover>
													) : (
														<span className="text-muted-foreground text-xs">None</span>
													)}
												</TableCell>
												<TableCell className="h-16 text-right leading-none">
													<DropdownMenu modal={false}>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="icon" className="h-8 w-8">
																<MoreVertical className="size-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem
																onSelect={() => deferMenuAction(() => openEditModal(user))}
																className="cursor-pointer"
															>
																<Pencil className="mr-2 size-4" />
																Edit Account / Profiles
															</DropdownMenuItem>
															<DropdownMenuItem
																onSelect={() => banMutation.mutate({ id: user.id, banned: !isBanned(user.cards) })}
																className="cursor-pointer"
															>
																<Ban className="mr-2 size-4" />
																{isBanned(user.cards) ? "Unban Account" : "Ban Account"}
															</DropdownMenuItem>
															<DropdownMenuItem
																onSelect={() => lockMutation.mutate({ id: user.id, locked: !isLocked(user.cards) })}
																className="cursor-pointer"
															>
																{isLocked(user.cards) ? (
																	<Unlock className="mr-2 size-4" />
																) : (
																	<Lock className="mr-2 size-4" />
																)}
																{isLocked(user.cards) ? "Unlock Account" : "Lock Account"}
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem
																onSelect={() => deferMenuAction(() => setDeletingUser(user))}
																className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
															>
																<Trash2 className="mr-2 size-4" />
																Delete User
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
						{hasMore && (
							<div className="mt-4">
								<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
							</div>
						)}
					</>
				)}
			</Body>

			<Dialog open={!!editingUser} onOpenChange={open => !open && setEditingUser(null)}>
				<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl" onOpenAutoFocus={e => e.preventDefault()}>
					<DialogHeader>
						<DialogTitle>Edit User</DialogTitle>
						<DialogDescription>
							Manage user account settings and game profiles for{" "}
							{editingUser ? getUserLabel(editingUser.username, editingUser.id) : ""}
						</DialogDescription>
					</DialogHeader>

					<Tabs defaultValue="account" className="mt-4">
						<TabsList className="w-full">
							<TabsTrigger value="account" className="flex-1">
								Account Info
							</TabsTrigger>
							<TabsTrigger value="profiles" className="flex-1">
								Game Profiles
							</TabsTrigger>
						</TabsList>

						<TabsContent value="account" className="mt-4">
							<form onSubmit={handleEditSubmit} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="username">Username</Label>
									<Input
										id="username"
										value={editForm.username}
										onChange={e => setEditForm(prev => ({ ...prev, username: e.target.value }))}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="permissions">Role</Label>
									<Select
										value={editForm.permissions.toString()}
										onValueChange={v => setEditForm(prev => ({ ...prev, permissions: parseInt(v) }))}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select role" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value={UserRole.User.toString()}>User</SelectItem>
											<SelectItem value={UserRole.Admin.toString()}>Admin</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{editingUser && (
									<div className="bg-muted mt-6 space-y-4 rounded-md p-4">
										<h3 className="text-sm font-semibold">Linked Resources</h3>
										<div>
											<h4 className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
												<Building2 className="size-3" /> Arcades ({editingUser.arcades.length})
											</h4>
											<ul className="mt-1 max-h-32 list-inside list-disc overflow-y-auto text-xs">
												{editingUser.arcades.length > 0 ? (
													editingUser.arcades.map(a => <li key={a.id}>{getArcadeLabel(a)}</li>)
												) : (
													<li>None</li>
												)}
											</ul>
										</div>
										<div>
											<h4 className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
												<CreditCard className="size-3" /> Cards ({editingUser.cards.length})
											</h4>
											<ul className="mt-1 max-h-32 list-inside list-disc overflow-y-auto font-mono text-xs">
												{editingUser.cards.map(c => (
													<li key={c.id}>{c.access_code}</li>
												))}
											</ul>
										</div>
									</div>
								)}

								<div className="flex justify-end gap-2 pt-4">
									<Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
										Cancel
									</Button>
									<Button type="submit" disabled={updateMutation.isPending}>
										{updateMutation.isPending ? "Saving..." : "Save Changes"}
									</Button>
								</div>
							</form>
						</TabsContent>

						<TabsContent value="profiles" className="mt-4">
							{editingUser && <AdminGameProfiles userId={editingUser.id} />}
						</TabsContent>
					</Tabs>
				</DialogContent>
			</Dialog>

			<AlertDialog open={pruneDialogOpen} onOpenChange={setPruneDialogOpen}>
				<AlertDialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
					<AlertDialogHeader>
						<AlertDialogTitle className="text-destructive flex items-center gap-2">
							<ShieldAlert className="size-5" />
							Prune Inactive Users
						</AlertDialogTitle>
						<AlertDialogDescription>
							This permanently deletes users with no CHUNITHM, ONGEKI, or maimai player name. The preview below is the
							exact deletion chain for this run.
						</AlertDialogDescription>
					</AlertDialogHeader>
					{prunePreviewQuery.isFetching ? (
						<div className="text-muted-foreground py-8 text-center text-sm">Building deletion preview...</div>
					) : prunePreviewQuery.isError ? (
						<div className="text-destructive py-8 text-center text-sm">Failed to build deletion preview.</div>
					) : prunePreviewQuery.data?.users.length ? (
						<div className="space-y-3">
							<div className="text-sm font-medium">
								{prunePreviewQuery.data.total} user{prunePreviewQuery.data.total === 1 ? "" : "s"} will be deleted
							</div>
							<div className="max-h-80 space-y-3 overflow-y-auto rounded-md border p-3">
								{prunePreviewQuery.data.users.map(user => (
									<div key={user.id} className="space-y-1 border-b pb-3 last:border-0 last:pb-0">
										<div className="font-medium">
											{getUserLabel(user.username, user.id)} (ID {user.id})
										</div>
										<div className="text-muted-foreground text-xs">Deletion chain:</div>
										<ul className="text-muted-foreground list-inside list-disc text-xs">
											<li>User account and authentication data</li>
											{user.linkedData.map(item => (
												<li key={item.table}>
													{item.table} ({item.count} row{item.count === 1 ? "" : "s"})
												</li>
											))}
											{user.keychips.length > 0 ? (
												user.keychips.map(keychip => (
													<li key={keychip.serial}>
														Keychip {keychip.serial} and its owned arcade
														{keychip.arcadeName ? ` (${keychip.arcadeName})` : ""}
													</li>
												))
											) : (
												<li>No owned keychip</li>
											)}
											<li>Final aime_user record</li>
										</ul>
									</div>
								))}
							</div>
						</div>
					) : (
						<div className="text-muted-foreground rounded-md border p-6 text-center text-sm">
							No inactive users found.
						</div>
					)}
					<AlertDialogFooter>
						<AlertDialogCancel disabled={pruneMutation.isPending}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-background dark:bg-input/30 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive h-9 rounded-md px-4 py-2 text-sm focus-visible:ring-0"
							disabled={pruneMutation.isPending || !prunePreviewQuery.data?.users.length}
							onClick={event => {
								event.preventDefault()
								const users = prunePreviewQuery.data?.users ?? []
								if (users.length) pruneMutation.mutate(users.map(user => user.id))
							}}
						>
							{pruneMutation.isPending ? "Pruning..." : "Confirm prune"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={!!deletingUser} onOpenChange={open => !open && setDeletingUser(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2 text-red-500">
							<ShieldAlert className="size-5" />
							Cascade Delete User
						</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to completely delete the user{" "}
							<strong>{deletingUser ? getUserLabel(deletingUser.username, deletingUser.id) : ""}</strong>?
							<br />
							<br />
							This action will irrevocably delete:
							<ul className="mt-2 list-inside list-disc text-left">
								<li>User account and authentication data</li>
								<li>All registered Aime cards</li>
								<li>All arcade ownerships</li>
								<li>All associated gameplay data, profiles, and scores</li>
							</ul>
							<br />
							This cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							disabled={deleteMutation.isPending}
							onClick={e => {
								e.preventDefault()
								if (deletingUser) deleteMutation.mutate(deletingUser.id)
							}}
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete User"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Container>
	)
}

export default AdminUsers
