import { z } from "zod"

/**
 * Shared authentication validation schemas
 */

export const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters")
	.max(128, "Password must be less than 128 characters")

export const usernameSchema = z
	.string()
	.min(3, "Username must be at least 3 characters")
	.max(50, "Username must be less than 50 characters")
	.regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")

export const loginSchema = z.object({
	username: z.string().min(1, "Username is required"),
	password: z.string().min(1, "Password is required")
})

export const signupSchema = z.object({
	username: usernameSchema,
	password: passwordSchema,
	accessCode: z.string().min(1, "Access code is required")
})
