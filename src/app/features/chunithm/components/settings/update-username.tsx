import React, { useState } from "react"

import { toast } from "sonner"

import { useUpdateName } from "@/app/features/chunithm/hooks/use-update-name"
import { Button } from "@/app/shared/components/ui/button"

/**
 * Converts half-width ASCII characters to full-width characters
 * Used for Chunithm usernames which require full-width characters
 */
const toFullWidth = (input: string): string => {
	return input.replace(/[\u0020-\u007E]/g, char => {
		return String.fromCharCode(char.charCodeAt(0) + 0xfee0)
	})
}

const UpdateUsernameBox = () => {
	const [userName, setUserName] = useState("")
	const { mutate: updateUsername, isPending } = useUpdateName()

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		// Convert to full-width and limit to 8 characters
		const fullWidthValue = toFullWidth(value).substring(0, 8)
		setUserName(fullWidthValue)
	}

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
			<div className="text-primary mb-4 text-sm">
				Change your in-game username here. Characters will be automatically converted to full-width (全角).
			</div>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="username" className="text-primary mb-1 block text-sm font-medium">
						New Username
					</label>
					<input
						id="username"
						type="text"
						value={userName}
						onChange={handleInputChange}
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
