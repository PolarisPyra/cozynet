import { useEffect } from "react"

import { useNavigate } from "react-router-dom"

import { useIsAdmin } from "@/app/features/admin/hooks"
import Header from "@/app/shared/components/common/header"
import Spinner from "@/app/shared/components/common/spinner"
import ArcadeOwnership from "@/app/shared/components/settings/arcade-ownership"
import { useAuth } from "@/app/shared/hooks/auth/use-auth"

const AdminArcadeOwnership = () => {
	const isAdmin = useIsAdmin()
	const { isLoading } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		if (!isLoading && !isAdmin) {
			navigate("/home", { replace: true })
		}
	}, [isAdmin, navigate, isLoading])

	if (isLoading) {
		return (
			<div className="relative flex-1 overflow-auto">
				<Header title="Arcade Ownership" />
				<div className="flex h-64 items-center justify-center">
					<Spinner />
				</div>
			</div>
		)
	}

	if (!isAdmin) {
		return null
	}

	return (
		<div className="relative flex-1 overflow-auto">
			<Header title="Arcade Ownership" />
			<div className="mb-4 p-4 sm:px-6 sm:py-0">
				<div className="bg-card text-card-foreground space-y-6 rounded-sm p-6">
					<ArcadeOwnership />
				</div>
			</div>
		</div>
	)
}

export default AdminArcadeOwnership
