import React, { useRef, useState } from "react"

import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import Spinner from "@/app/shared/components/common/spinner"
import { Button } from "@/app/shared/components/ui/button"
import { useAuth } from "@/app/shared/hooks/auth"
import { turnstile } from "@/app/shared/utils/constants"

export const LoginContent = () => {
	const { login, isLoading } = useAuth()
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [canSubmit, setCanSubmit] = useState(!turnstile)
	const refTurnstile = useRef<TurnstileInstance>(null)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			refTurnstile.current?.reset()
			await login(username, password)
		} catch (err: any) {
			const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
			toast.error(errorMessage)
		}
	}

	return (
		<div className="bg-card border-border mx-4 w-full max-w-md rounded-sm border p-8 shadow-sm">
			<h1 className="text-foreground mb-8 text-center text-4xl font-bold">Welcome Back</h1>
			<form className="space-y-6" onSubmit={handleSubmit}>
				<div>
					<label htmlFor="username" className="text-foreground block text-sm font-medium">
						Username
					</label>
					<input
						type="text"
						id="username"
						className="text-foreground placeholder:text-muted-foreground bg-background border-border focus-visible:ring-primary focus-visible:ring-offset-background mt-1 block w-full rounded-sm border px-4 py-3 transition duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
						placeholder="Username"
						autoComplete="username"
						value={username}
						onChange={e => setUsername(e.target.value)}
						disabled={isLoading}
					/>
				</div>
				<div>
					<label htmlFor="password" className="text-foreground block text-sm font-medium">
						Password
					</label>
					<input
						type="password"
						id="password"
						className="text-foreground placeholder:text-muted-foreground bg-background border-border focus-visible:ring-primary focus-visible:ring-offset-background mt-1 block w-full rounded-sm border px-4 py-3 transition duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
						placeholder="••••••••"
						autoComplete="current-password"
						value={password}
						onChange={e => setPassword(e.target.value)}
						disabled={isLoading}
					/>
				</div>
				{turnstile && (
					<Turnstile id="turnstile-1" ref={refTurnstile} siteKey={turnstile} onSuccess={() => setCanSubmit(true)} />
				)}
				<Button
					disabled={!canSubmit || !username.trim() || !password.trim() || isLoading}
					variant="custom"
					className="w-full"
				>
					{isLoading ? <Spinner size={24} /> : "Login"}
				</Button>
				<Link to="/">
					<Button variant="custom" className="w-full">
						Back
					</Button>
				</Link>
			</form>
		</div>
	)
}
