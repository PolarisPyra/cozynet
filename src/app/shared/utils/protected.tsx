import { Navigate, Outlet } from "react-router-dom"

import { Skeleton } from "@/app/shared/components/ui/skeleton"
import { useAuth } from "@/app/shared/hooks/auth/use-auth"

/**
 * ProtectedRoute component that verifies authentication before rendering protected content.
 * Verification is handled automatically by React Query via useVerifySession in AuthProvider.
 */
export const ProtectedRoute = () => {
	const { user, isLoading } = useAuth()

	// Show loading state while checking authentication
	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
				<Skeleton className="h-10 w-10 rounded-full" />
			</div>
		)
	}

	// Redirect to home if not authenticated
	return user ? <Outlet /> : <Navigate to="/" replace />
}
