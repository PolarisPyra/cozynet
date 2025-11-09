
import { Navigate, Outlet } from "react-router-dom"

import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/auth"

export const ProtectedRoute = () => {
	const { user, isLoading } = useAuth()

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
				<Skeleton className="h-10 w-10 rounded-full" />
			</div>
		)
	}

	return user ? <Outlet /> : <Navigate to="/" replace />
}
