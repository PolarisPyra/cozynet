import React, { useState } from "react"

import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/auth"
import { useUpdateAimecard } from "@/hooks/users"

const AimeCardSwap = () => {
	const [accessCode, setAccessCode] = useState("")
	const updateAimecard = useUpdateAimecard()
	const { user } = useAuth()

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		if (/^\d{0,20}$/.test(value)) {
			setAccessCode(value)
		}
	}

	const handleUpdateAimecard = async (e: React.FormEvent) => {
		e.preventDefault()
		if (accessCode.length !== 20) {
			toast.error("Access code must be 20 digits")
			return
		}
		try {
			await updateAimecard.mutateAsync(accessCode)
			toast.success("Aime card updated successfully! Don't forget to relog to see the changes.")
			setAccessCode("")
		} catch (error) {
			console.error("Failed to update aime card:", error)
			toast.error("Failed to update aime card")
		}
	}

	const isFormValid = accessCode.length === 20 && !updateAimecard.isPending

	return (
		<div className="bg-card">
			<div className="mb-6">
				<h2 className="text-primary mb-2 text-xl font-semibold">Aime Card Settings</h2>
				<p className="text-primary-muted text-sm">
					Changes the in-game aime card (affects the aime.txt for artemis games - don't forget to update it)
				</p>
			</div>

			<div className="space-y-4">
				<div className="bg-muted/50 rounded-sm p-4">
					<div className="text-sm">
						<span className="text-primary-muted">Current Aime Card: </span>
						<span className="text-primary font-bold">{user?.aimeCardId || "Not set"}</span>
					</div>
				</div>

				<form onSubmit={handleUpdateAimecard} className="space-y-4">
					<div>
						<label htmlFor="accessCode" className="text-primary mb-2 block text-sm font-medium">
							Access Code ({accessCode.length}/20 digits)
						</label>
						<Input
							type="text"
							id="accessCode"
							value={accessCode}
							onChange={handleInputChange}
							placeholder="Enter 20-digit access code"
							required
							pattern="\d{20}"
							maxLength={20}
							inputMode="numeric"
							className="w-full border-none"
						/>
					</div>

					<div className="pt-4">
						<Button
							variant="custom"
							type="submit"
							disabled={!isFormValid}
							className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:border-muted/50 disabled:bg-muted disabled:text-muted-foreground w-full items-center justify-center gap-2 rounded-md border border-transparent p-3 font-semibold transition-colors disabled:cursor-not-allowed"
							aria-busy={updateAimecard.isPending}
						>
							{updateAimecard.isPending ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									<span>Updating...</span>
								</>
							) : (
								<span>Update</span>
							)}
						</Button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default AimeCardSwap
