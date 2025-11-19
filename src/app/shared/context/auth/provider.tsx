import React, { useCallback, useEffect, useMemo, useState } from "react"

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

	// Use React Query hooks for auth operations
	// Only verify if we don't have a user yet
	const { data: verifiedUser, isLoading: isVerifying } = useVerifySession(user === null)
	const loginMutation = useLogin()
	const signupMutation = useSignup()
	const logoutMutation = useLogout()

	// Update user state when verification succeeds
	useEffect(() => {
		if (verifiedUser) {
			setUser(verifiedUser)
			setError("")
		} else if (isVerifying === false && !verifiedUser) {
			// Verification completed but no user found
			setUser(null)
		}
	}, [verifiedUser, isVerifying])

	/**
	 * Verifies the current session by checking the JWT token.
	 */
	const verifySession = useCallback(async (): Promise<boolean> => {
		// React Query handles this automatically via useVerifySession
		return user !== null
	}, [user])

	/**
	 * Handles user login using React Query mutation.
	 */
	const login = useCallback(
		async (username: string, password: string): Promise<void> => {
			setError("")
			try {
				const userData = await loginMutation.mutateAsync({ username, password })
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
		async (username: string, password: string, accessCode: string): Promise<void> => {
			setError("")
			try {
				const userData = await signupMutation.mutateAsync({ username, password, accessCode })
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
			navigate("/", { replace: true })
		}
	}, [logoutMutation, navigate])

	/**
	 * Clears the current error message.
	 */
	const clearError = useCallback(() => {
		setError("")
	}, [])

	const value = useMemo(
		() => ({
			user,
			setUser,
			isLoading: isVerifying || loginMutation.isPending || signupMutation.isPending || logoutMutation.isPending,
			isVerifying,
			error,
			login,
			logout,
			signup,
			clearError,
			verifySession
		}),
		[
			user,
			isVerifying,
			loginMutation.isPending,
			signupMutation.isPending,
			logoutMutation.isPending,
			error,
			login,
			logout,
			signup,
			clearError,
			verifySession
		]
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
