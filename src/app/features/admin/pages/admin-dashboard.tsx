import { useEffect } from "react"

import { TriangleAlert } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { KeychipGenerator } from "@/app/features/admin/components/keychip-generator"
import { useIsAdmin } from "@/app/features/admin/hooks"
import Header from "@/app/shared/components/common/header"
import Spinner from "@/app/shared/components/common/spinner"
import ArcadeOwnership from "@/app/shared/components/settings/arcade-ownership"
import { useAuth } from "@/app/shared/hooks/auth/use-auth"

const AdminDashboard = () => {
	const isAdmin = useIsAdmin()
	const { isLoading } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		if (!isLoading && !isAdmin) {
			navigate("/home", { replace: true })
		}
	}, [isAdmin, navigate, isLoading])

	// Show loading state while checking authentication
	if (isLoading) {
		return (
			<div className="relative flex-1 overflow-auto">
				<Header title="Admin Dashboard" />
				<div className="flex h-64 items-center justify-center">
					<Spinner />
				</div>
			</div>
		)
	}

	// Return null while redirecting (prevents flash of content)
	if (!isAdmin) {
		return null
	}

	return (
		<div className="relative flex-1 overflow-auto">
			<Header title="Admin Dashboard" />
			<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
				<div className="bg-card text-card-foreground space-y-6 rounded-sm p-6">
					<div className="border-border flex items-center gap-2 border-b pb-3">
						<TriangleAlert className="text-red-500" />
						<h2 className="text-lg font-semibold text-red-500">Keychip Generator</h2>
					</div>
					<KeychipGenerator />
				</div>

				<div className="bg-card text-card-foreground space-y-6 rounded-sm p-6">
					<div className="border-border flex items-center gap-2 border-b pb-3">
						<TriangleAlert className="text-red-500" />
						<h2 className="text-lg font-semibold text-red-500">Arcade Ownership</h2>
					</div>
					<ArcadeOwnership />
				</div>
			</div>
		</div>
	)
}

export default AdminDashboard
