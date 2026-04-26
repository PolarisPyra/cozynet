import { useEffect } from "react"

import { TriangleAlert } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { useIsAdmin } from "@/app/features/admin/hooks"
import Header from "@/app/shared/components/common/header"
import Spinner from "@/app/shared/components/common/spinner"
import { Button } from "@/app/shared/components/ui/button"
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
						<h2 className="text-lg font-semibold text-red-500">ICF Editor</h2>
					</div>
					<p className="text-muted-foreground text-sm">
						Browser-side ICF tool for import, entry rename, hex inspection, export.
					</p>
					<Button asChild variant="outline" className="w-fit">
						<Link to="/admin/icf">Open ICF Editor</Link>
					</Button>
				</div>
			</div>
		</div>
	)
}

export default AdminDashboard
