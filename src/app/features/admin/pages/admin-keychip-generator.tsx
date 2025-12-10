import { useEffect } from "react"

import { useNavigate } from "react-router-dom"

import { KeychipGenerator } from "@/app/features/admin/components/keychip-generator"
import { useIsAdmin } from "@/app/features/admin/hooks"
import Header from "@/app/shared/components/common/header"
import Spinner from "@/app/shared/components/common/spinner"
import { useAuth } from "@/app/shared/hooks/auth/use-auth"

const AdminKeychipGenerator = () => {
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
				<Header title="Keychip Generator" />
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
