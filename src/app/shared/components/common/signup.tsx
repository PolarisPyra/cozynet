import { ChangeEvent, FormEvent, useRef, useState } from "react"

import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/app/shared/components/ui/button"
import { useAuth } from "@/app/shared/hooks/auth"
import { turnstile } from "@/app/shared/utils/constants"
import { signupSchema } from "@/app/shared/types/validation/auth"

type FormData = z.infer<typeof signupSchema>
type FormErrors = Partial<Record<keyof FormData, string[]>>

export function SignUpContent() {
	const { signup, isLoading } = useAuth()
	const [formData, setFormData] = useState<FormData>({
		username: "",
		password: "",
		accessCode: ""
	})
	const [errors, setErrors] = useState<FormErrors>({})
	const [canSubmit, setCanSubmit] = useState(false)
	const refTurnstile = useRef<TurnstileInstance>(null)

	const validateForm = (data: FormData): FormErrors => {
		try {
			signupSchema.parse(data)
			return {}
		} catch (error) {
			if (error instanceof z.ZodError) {
				return error.flatten().fieldErrors
			}
			return {}
		}
	}

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		const newErrors = validateForm(formData)
		setErrors(newErrors)

		if (Object.keys(newErrors).length === 0) {
			// Form is valid, proceed with submission
			try {
				refTurnstile.current?.reset()
				await signup(formData.username, formData.password, formData.accessCode)
				toast.success("Account created successfully!")
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
				toast.error(errorMessage)
			}
		}
	}

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		const updatedFormData = { ...formData, [name]: value }
		setFormData(updatedFormData)
		// Validate form on each change
		const newErrors = validateForm(updatedFormData)
		setErrors(newErrors)
	}

	const isAccessCodeValid = /^\d{20}$/.test(formData.accessCode.trim())

	return (
		<div className="bg-card border-border mx-4 w-full max-w-md rounded-sm border p-8 shadow-sm">
			<h1 className="text-foreground mb-8 text-center text-4xl font-bold">Create Account</h1>
			<form className="space-y-6" onSubmit={handleSubmit}>
				<div>
					<label htmlFor="username" className="text-foreground block text-sm font-medium">
						Username
					</label>
					<input
						type="text"
						name="username"
						id="username"
						className="text-foreground placeholder:text-muted-foreground bg-background border-border focus-visible:ring-primary focus-visible:ring-offset-background mt-1 block w-full rounded-sm border px-4 py-3 transition duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
						placeholder="Username"
						value={formData.username}
						onChange={handleChange}
					/>
					{errors.username && errors.username.length > 0 && (
						<span className="text-destructive mt-1 block text-sm">{errors.username[0]}</span>
					)}
				</div>

				<div>
					<label htmlFor="password" className="text-foreground block text-sm font-medium">
						Password
					</label>
					<input
						type="password"
						name="password"
						id="password"
						className="text-foreground placeholder:text-muted-foreground bg-background border-border focus-visible:ring-primary focus-visible:ring-offset-background mt-1 block w-full rounded-sm border px-4 py-3 transition duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
						placeholder="••••••••"
						value={formData.password}
						onChange={handleChange}
					/>
					{errors.password && errors.password.length > 0 && (
						<span className="text-destructive mt-1 block text-sm">{errors.password[0]}</span>
					)}
				</div>

				<div>
					<label htmlFor="accessCode" className="text-foreground block text-sm font-medium">
						Access Code
					</label>
					<input
						type="text"
						name="accessCode"
						id="accessCode"
						className="text-foreground placeholder:text-muted-foreground bg-background border-border focus-visible:ring-primary focus-visible:ring-offset-background mt-1 block w-full rounded-sm border px-4 py-3 transition duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
						inputMode="numeric"
						pattern="\\d*"
						maxLength={20}
						placeholder="Enter your access code"
						value={formData.accessCode}
						onChange={handleChange}
					/>
					{errors.accessCode && errors.accessCode.length > 0 && (
						<span className="text-destructive mt-1 block text-sm">{errors.accessCode[0]}</span>
					)}
				</div>

				<Turnstile id="turnstile-1" ref={refTurnstile} siteKey={turnstile} onSuccess={() => setCanSubmit(true)} />

				<Button
					type="submit"
					disabled={
						!canSubmit || isLoading || !formData.username.trim() || !formData.password.trim() || !isAccessCodeValid
					}
					variant="custom"
					className="block w-full transform text-center transition duration-300 hover:scale-105 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isLoading ? "Creating Account..." : "Create Account"}
				</Button>
			</form>
			<p className="text-muted-foreground mt-6 text-center text-sm">
				Already have an account?{" "}
				<Link to="/login" className="text-primary hover:opacity-90">
					Log in
				</Link>
			</p>
		</div>
	)
}
