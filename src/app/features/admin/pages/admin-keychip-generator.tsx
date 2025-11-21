import { useEffect } from "react"

import { useNavigate } from "react-router-dom"

import { KeychipGenerator } from "@/app/features/admin/components/keychip-generator"
import { useAdmin } from "@/app/features/admin/hooks"
import { hasAdminAccess } from "@/app/features/admin/utils"
import Header from "@/app/shared/components/common/header"
import Spinner from "@/app/shared/components/common/spinner"

const AdminKeychipGenerator = () => {
	const { data: systemAdmin, isLoading, isError } = useAdmin()
	const adminPerms = hasAdminAccess(systemAdmin)
	const navigate = useNavigate()

	useEffect(() => {
		if (!isLoading && !isError && systemAdmin !== undefined && !adminPerms) {
			navigate("/home", { replace: true })
		}
	}, [systemAdmin, adminPerms, navigate, isLoading, isError])

	// Show loading state while checking permissions
	if (isLoading) {
		return (
			<div className="relative flex-1 overflow-auto">
				<Header title="Keychip Generator" />
				<div className="flex h-64 items-center justify-center">
					<Spinner />
				</div>
			</div>
		)
	}

	if (isError) {
		return (
			<div className="relative flex-1 overflow-auto">
				<Header title="Keychip Generator" />
				<div className="mb-4 p-4 sm:px-6 sm:py-0">
					<div className="bg-card text-card-foreground rounded-sm p-6">
						<p className="text-muted-foreground">Failed to load admin permissions.</p>
					</div>
				</div>
			</div>
		)
	}

	if (!adminPerms) {
		return null
	}

	return (
		<div className="relative flex-1 overflow-auto">
			<Header title="Keychip Generator" />
			<div className="mb-4 p-4 sm:px-6 sm:py-0">
				<div className="bg-card text-card-foreground space-y-6 rounded-sm p-6">
					<KeychipGenerator />
				</div>
			</div>
		</div>
	)
}

export default AdminKeychipGenerator
