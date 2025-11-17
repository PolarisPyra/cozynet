import React, { useCallback, useEffect, useMemo, useState } from "react"

import { useNavigate } from "react-router-dom"

import { User } from "@/app/shared/types"
import { api } from "@/app/shared/utils/api"

import { AuthContext } from "./context"

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState("")
	const navigate = useNavigate()

	useEffect(() => {
		const controller = new AbortController()
		const { signal } = controller

		;(async () => {
			try {
				const res = await api.users.verify.$post({ signal })
				if (!res.ok) {
					throw new Error("Invalid token")
				}

				const user = await res.json()
				setUser(user)
			} catch (err) {
				setUser(null)
				setError(err instanceof Error ? err.message : "Authentication failed")
			} finally {
				setIsLoading(false)
			}
		})()

		return () => {
			controller.abort()
		}
	}, [])

	const login = useCallback(async (username: string, password: string): Promise<void> => {
		setIsLoading(true)
		setError("")

		try {
			const res = await api.login.$post({
				json: { username, password }
			})
			if (!res.ok) {
				let errorMessage = "Invalid credentials"
				try {
					const errorData = (await res.json()) as { error?: string }
					if (errorData?.error) {
						errorMessage = errorData.error
					}
				} catch {
					// If JSON parsing fails, use default message
				}
				throw new Error(errorMessage)
			}

			const user = await res.json()
			setUser(user)
			navigate("/home")
		} catch (err) {
			setError(`Login failed: ${err instanceof Error ? err.message : "An unexpected error occurred"}`)
			throw err
		} finally {
			setIsLoading(false)
		}
	}, [])

	const signup = useCallback(async (username: string, password: string, accessCode: string) => {
		setIsLoading(true)
		setError("")

		try {
			const res = await api.signup.$post({
				json: { username, password, accessCode }
			})

			if (!res.ok) {
				let errorMessage = "Signup failed"
				try {
					const errorData = (await res.json()) as { error?: string }
					if (errorData?.error) {
						errorMessage = errorData.error
					}
				} catch {
					// If JSON parsing fails, use default message
				}
				throw new Error(errorMessage)
			}

			const user = await res.json()
			setUser(user)
			navigate("/home")
		} catch (err) {
			setError(err instanceof Error ? err.message : "An unexpected error occurred")
			throw err
		} finally {
			setIsLoading(false)
		}
	}, [])

	const logout = useCallback(async () => {
		setIsLoading(true)
		try {
			const response = await api.logout.$post()
			if (response.ok) {
				setUser(null)
				navigate("")
			}
		} catch (err) {
			console.error("Logout error:", err)
			setError(err instanceof Error ? err.message : "Logout failed")
		} finally {
			setIsLoading(false)
		}
	}, [])

	const value = useMemo(
		() => ({
			user,
			setUser,
			isLoading,
			error,
			login,
			logout,
			signup
		}),
		[user, isLoading, error]
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
