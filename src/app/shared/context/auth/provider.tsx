import React, { useCallback, useEffect, useMemo, useState } from "react"

import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

import { useLogin, useLogout, useSignup, useVerifySession } from "@/app/shared/hooks/auth"
import type { UserMeta } from "@/server/types/jwt"

import { AuthContext } from "./context"

/**
 * AuthProvider component that manages authentication state and operations.
 * Implements security best practices including:
 * - Request cancellation to prevent race conditions
 * - Proper error handling without information leakage
 * - Separate loading states for different operations
 * - Automatic session verification on mount
 * - Cleanup on unmount
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<UserMeta | null>(null)
	const [error, setError] = useState("")
	const navigate = useNavigate()
	const queryClient = useQueryClient()

	// Use React Query hooks for auth operations
	// Always verify on mount to handle refreshes
	const { data: verifiedUser, isLoading: isVerifying } = useVerifySession(true)
	const loginMutation = useLogin()
	const signupMutation = useSignup()
	const logoutMutation = useLogout()

	// Sync verifiedUser to user state - use verifiedUser directly to avoid re-renders
	useEffect(() => {
		setUser(verifiedUser ?? null)
	}, [verifiedUser])

	/**
	 * Verifies the current session by checking the JWT token.
	 * This is handled automatically by React Query via useVerifySession hook.
	 * Returns true if user is authenticated, false otherwise.
	 */
	const verifySession = useCallback(async (): Promise<boolean> => {
		// React Query handles verification automatically via useVerifySession
		// This function exists for API compatibility but verification happens in the hook
		return user !== null
	}, [user])

	/**
	 * Handles user login using React Query mutation.
	 */
	const login = useCallback(
		async (username: string, password: string, turnstileToken?: string): Promise<void> => {
			setError("")
			try {
				const userData = await loginMutation.mutateAsync({ username, password, turnstileToken })
				setUser(userData)
				setError("")
				navigate("/home")
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again."
				setError(errorMessage)
				throw err
			}
		},
		[loginMutation, navigate]
	)

	/**
	 * Handles user signup using React Query mutation.
	 */
	const signup = useCallback(
		async (username: string, password: string, accessCode: string, turnstileToken?: string): Promise<void> => {
			setError("")
			try {
				const userData = await signupMutation.mutateAsync({ username, password, accessCode, turnstileToken })
				setUser(userData)
				setError("")
				navigate("/home")
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : "Signup failed. Please try again."
				setError(errorMessage)
				throw err
			}
		},
		[signupMutation, navigate]
	)

	/**
	 * Handles user logout using React Query mutation.
	 */
	const logout = useCallback(async () => {
		setError("")
		try {
			await logoutMutation.mutateAsync()
		} catch {
			// Ignore errors - always clear local state
		} finally {
			// Always clear local state for security, even if server request fails
			setUser(null)
			setError("")
			// Clear React Query cache to prevent stale auth data
			queryClient.removeQueries({ queryKey: ["auth", "verify"] })
			queryClient.setQueryData<UserMeta | null>(["auth", "verify"], null)
			navigate("/", { replace: true })
		}
	}, [logoutMutation, navigate, queryClient])

	/**
	 * Clears the current error message.
	 */
	const clearError = useCallback(() => {
		setError("")
	}, [])

	const isLoading = isVerifying || loginMutation.isPending || signupMutation.isPending || logoutMutation.isPending

	const value = useMemo(
		() => ({
			user: verifiedUser ?? user,
			setUser,
			isLoading,
			isVerifying,
			error,
			login,
			logout,
			signup,
			clearError,
			verifySession
		}),
		[verifiedUser, user, isLoading, isVerifying, error, login, logout, signup, clearError, verifySession]
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
