import { useMemo, useState } from "react"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Building2, CreditCard, MoreVertical, Pencil, ShieldAlert, ShieldCheck, Trash2, ArrowRightLeft, KeySquare, Ban, Lock, Unlock, ShieldX } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import Header from "@/app/shared/components/common/header"
import { Pagination } from "@/app/shared/components/common/pagination"
import ArcadeOwnership from "@/app/shared/components/settings/arcade-ownership"
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/app/shared/components/ui/dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
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
	username: string
	email: string
	permissions: number
	created_date: string
	last_login_date: string
	suspend_expire_time: string
	cards: { id: number; user: number; access_code: string; created_date: string; is_locked: boolean; is_banned: boolean }[]
	arcades: { user: number; id: number; name: string; nickname: string }[]
}

const AdminUsers = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const searchQuery = searchParams.get("search") || ""

	const queryClient = useQueryClient()

	const [editingUser, setEditingUser] = useState<UserWithDetails | null>(null)
	const [deletingUser, setDeletingUser] = useState<UserWithDetails | null>(null)
	const [arcadeOwnershipOpen, setArcadeOwnershipOpen] = useState(false)
	const [keychipGeneratorOpen, setKeychipGeneratorOpen] = useState(false)

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

	const allUsers = (data?.users as unknown as UserWithDetails[]) || []

	const filteredUsers = useMemo(() => {
		if (!searchQuery.trim()) return allUsers
		const query = searchQuery.trim().toLowerCase()
		return allUsers.filter(
			u =>
				u.username.toLowerCase().includes(query) ||
				(u.email && u.email.toLowerCase().includes(query)) ||
				u.id.toString().includes(query)
		)
	}, [allUsers, searchQuery])

	const { page, setPage, totalPages, paged: paginatedUsers, hasMore } = usePagination(filteredUsers, STANDARD_PAGE_SIZE, [searchQuery])

	const searchItems = useMemo(() => {
		return allUsers.map(u => ({
			id: u.id,
			title: u.username
		}))
	}, [allUsers])

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

	const openEditModal = (user: UserWithDetails) => {
		setEditingUser(user)
		setEditForm({
			username: user.username,
			email: user.email,
			permissions: user.permissions
		})
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

	const isBanned = (cards: any[]) => cards.length > 0 && cards.some(c => c.is_banned)
	const isLocked = (cards: any[]) => cards.length > 0 && cards.some(c => c.is_locked)

	return (
		<Container>
			<Header
				title="User Management"
				searchProps={{
					items: searchItems,
					onSelect: value => setSearchParams({ search: value }),
					placeholder: "Search users...",
					emptyMessage: "No users found.",
					groupLabel: "Users"
				}}
			/>
			<Body>
				<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<Dialog open={arcadeOwnershipOpen} onOpenChange={setArcadeOwnershipOpen}>
							<DialogTrigger asChild>
								<Button variant="outline" size="sm" className="h-8 text-xs">
									<ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
									Transfer Arcade Ownership
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle>Transfer Arcade Ownership</DialogTitle>
									<DialogDescription>
										Change who owns a specific arcade
									</DialogDescription>
								</DialogHeader>
								<div className="pt-2">
									<ArcadeOwnership />
								</div>
							</DialogContent>
						</Dialog>
						<Dialog open={keychipGeneratorOpen} onOpenChange={setKeychipGeneratorOpen}>
							<DialogTrigger asChild>
								<Button variant="outline" size="sm" className="h-8 text-xs">
									<KeySquare className="h-3.5 w-3.5 mr-1" />
									Generate Keychip
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle>Keychip Generator</DialogTitle>
									<DialogDescription>
										Makes a new keychip
									</DialogDescription>
								</DialogHeader>
								<div className="pt-2">
									<KeychipGenerator />
								</div>
							</DialogContent>
						</Dialog>
					</div>
					{searchQuery && (
						<div className="text-muted-foreground text-sm">
							{filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"} found
						</div>
					)}
				</div>

				{isLoading ? (
					<div className="bg-card overflow-hidden rounded-lg border">
						<Table className="min-w-[800px] w-full">
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
										<TableCell><Skeleton className="h-4 w-8" /></TableCell>
										<TableCell><Skeleton className="h-4 w-24" /></TableCell>
										<TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
										<TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
										<TableCell><Skeleton className="h-5 w-12 rounded-full" /></TableCell>
										<TableCell><Skeleton className="h-4 w-20" /></TableCell>
										<TableCell><Skeleton className="h-6 w-8 rounded-md" /></TableCell>
										<TableCell><Skeleton className="h-6 w-8 rounded-md" /></TableCell>
										<TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				) : (
					<>
						<div className="bg-card overflow-hidden rounded-lg border">
							<Table className="min-w-[1200px] w-full">
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
												<TableCell className="h-16 font-medium leading-none">{user.id}</TableCell>
												<TableCell className="h-16 font-semibold leading-none">{user.username}</TableCell>
												<TableCell className="h-16 leading-none">
													{isBanned(user.cards) ? (
														<Badge variant="secondary" className="flex w-fit items-center gap-1 text-[10px] h-4 border-none">
															<ShieldX className="size-2.5" /> Banned
														</Badge>
													) : (
														<span className="text-muted-foreground text-[10px] font-medium">
															Not Banned
														</span>
													)}
												</TableCell>
												<TableCell className="h-16 leading-none">
													{isLocked(user.cards) ? (
														<Badge variant="secondary" className="flex w-fit items-center gap-1 text-[10px] h-4 border-none">
															<Lock className="size-2.5" /> Locked
														</Badge>
													) : (
														<span className="text-muted-foreground text-[10px] font-medium">
															Not Locked
														</span>
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
												<TableCell className="h-16 leading-none text-sm text-muted-foreground">
													{formatDate(user.last_login_date)}
												</TableCell>
												<TableCell className="h-16 leading-none">
													{user.arcades.length > 0 ? (
														<Popover>
															<PopoverTrigger asChild>
																<Button variant="outline" size="sm" className="h-6 text-xs px-2 py-0">
																	<Building2 className="size-3 mr-1" />
																	{user.arcades.length}
																</Button>
															</PopoverTrigger>
															<PopoverContent align="start" className="w-64 max-h-64 overflow-y-auto">
																<div className="space-y-2">
																	<h4 className="font-semibold text-sm">Assigned Arcades</h4>
																	<div className="flex flex-col gap-1">
																		{user.arcades.map(a => (
																			<div key={a.id} className="text-muted-foreground flex items-center gap-2 text-xs border-b pb-1 last:border-0">
																				<Building2 className="size-3 flex-shrink-0" />
																				<span className="truncate">{a.nickname || a.name}</span>
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
																<Button variant="outline" size="sm" className="h-6 text-xs px-2 py-0">
																	<CreditCard className="size-3 mr-1" />
																	{user.cards.length}
																</Button>
															</PopoverTrigger>
															<PopoverContent align="start" className="w-56 max-h-64 overflow-y-auto">
																<div className="space-y-2">
																	<h4 className="font-semibold text-sm">Aime Cards</h4>
																	<div className="flex flex-col gap-1">
																		{user.cards.map(c => (
																			<div key={c.id} className="text-muted-foreground flex items-center gap-2 font-mono text-xs border-b pb-1 last:border-0">
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
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="icon" className="h-8 w-8">
																<MoreVertical className="size-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem onClick={() => openEditModal(user)} className="cursor-pointer">
																<Pencil className="mr-2 size-4" />
																Edit Account / Profiles
															</DropdownMenuItem>
															<DropdownMenuItem 
																onClick={() => banMutation.mutate({ id: user.id, banned: !isBanned(user.cards) })}
																className="cursor-pointer"
															>
																<Ban className="mr-2 size-4" />
																{isBanned(user.cards) ? "Unban Account" : "Ban Account"}
															</DropdownMenuItem>
															<DropdownMenuItem 
																onClick={() => lockMutation.mutate({ id: user.id, locked: !isLocked(user.cards) })}
																className="cursor-pointer"
															>
																{isLocked(user.cards) ? <Unlock className="mr-2 size-4" /> : <Lock className="mr-2 size-4" />}
																{isLocked(user.cards) ? "Unlock Account" : "Lock Account"}
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() => setDeletingUser(user)}
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
				<DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto" onOpenAutoFocus={e => e.preventDefault()}>
					<DialogHeader>
						<DialogTitle>Edit User</DialogTitle>
						<DialogDescription>
							Manage user account settings and game profiles for {editingUser?.username}
						</DialogDescription>
					</DialogHeader>

					<Tabs defaultValue="account" className="mt-4">
						<TabsList className="w-full">
							<TabsTrigger value="account" className="flex-1">Account Info</TabsTrigger>
							<TabsTrigger value="profiles" className="flex-1">Game Profiles</TabsTrigger>
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
											<ul className="mt-1 list-inside list-disc text-xs max-h-32 overflow-y-auto">
												{editingUser.arcades.map(a => (
													<li key={a.id}>{a.nickname || a.name}</li>
												))}
											</ul>
										</div>
										<div>
											<h4 className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
												<CreditCard className="size-3" /> Cards ({editingUser.cards.length})
											</h4>
											<ul className="mt-1 list-inside list-disc font-mono text-xs max-h-32 overflow-y-auto">
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

			<AlertDialog open={!!deletingUser} onOpenChange={open => !open && setDeletingUser(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2 text-red-500">
							<ShieldAlert className="size-5" />
							Cascade Delete User
						</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to completely delete the user <strong>{deletingUser?.username}</strong>?
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
