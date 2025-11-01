import React, { useState } from "react"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useUpdateName } from "@/hooks/chunithm/use-update-name"

const UpdateUsernameBox = () => {
	const [userName, setUserName] = useState("")
	const { mutate: updateUsername, isPending } = useUpdateName()

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!userName.trim()) {
			toast.error("Username cannot be empty")
			return
		}
		updateUsername(
			{ userName },
			{
				onSuccess: () => {
					toast.success("Username updated!")
					setUserName("")
				},
				onError: () => toast.error("Failed to update username.")
			}
		)
	}

	return (
		<div className="bg-card rounded-sm p-6">
			<h2 className="text-primary mb-2 text-xl font-semibold">Username Settings</h2>
			<div className="text-primary mb-4 text-sm">Change your in-game username here.</div>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="username" className="text-primary mb-1 block text-sm font-medium">
						New Username
					</label>
					<input
						id="username"
						type="text"
						value={userName}
						onChange={e => setUserName(e.target.value)}
						className="bg-background text-foreground border-input w-full rounded border p-2"
						placeholder="Enter new username"
						required
						maxLength={8}
					/>
				</div>
				<Button variant="custom" disabled={isPending || !userName.trim()} className="mt-4 w-full">
					{isPending ? "Updating..." : "Update Username"}
				</Button>
			</form>
		</div>
	)
}

export default UpdateUsernameBox
