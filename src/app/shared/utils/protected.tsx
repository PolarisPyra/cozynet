import { useEffect, useRef } from "react"

import { Navigate, Outlet } from "react-router-dom"

import { Skeleton } from "@/app/shared/components/ui/skeleton"
import { useAuth } from "@/app/shared/hooks/auth/use-auth"

/**
 * ProtectedRoute component that verifies authentication before rendering protected content.
 * Only verifies session if user is not already authenticated, preventing unnecessary API calls.
 */
export const ProtectedRoute = () => {
	const { user, isLoading, isVerifying, verifySession } = useAuth()
	const hasAttemptedVerification = useRef(false)

	// Only verify once if we don't have a user and initial loading is complete
	useEffect(() => {
		if (!user && !isLoading && !isVerifying && !hasAttemptedVerification.current) {
			hasAttemptedVerification.current = true
			verifySession().catch(() => {
				// Error handling is done in verifySession
				hasAttemptedVerification.current = false // Allow retry on error
			})
		}
		// Reset flag if user becomes available
		if (user) {
			hasAttemptedVerification.current = false
		}
	}, [user, isLoading, isVerifying, verifySession])

	// Show loading state while checking authentication
	if (isLoading || (isVerifying && !user)) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
				<Skeleton className="h-10 w-10 rounded-full" />
			</div>
		)
	}

	// Redirect to home if not authenticated
	return user ? <Outlet /> : <Navigate to="/" replace />
}
