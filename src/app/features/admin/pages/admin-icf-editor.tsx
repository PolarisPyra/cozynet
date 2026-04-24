import { useEffect } from "react"

import { useNavigate } from "react-router-dom"

import { IcfEditor } from "@/app/features/admin/components/icf-editor"
import { useIsAdmin } from "@/app/features/admin/hooks"
import Header from "@/app/shared/components/common/header"
import Spinner from "@/app/shared/components/common/spinner"
import { useAuth } from "@/app/shared/hooks/auth/use-auth"

const AdminIcfEditor = () => {
	const isAdmin = useIsAdmin()
	const { isLoading } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		if (!isLoading && !isAdmin) {
			navigate("/home", { replace: true })
		}
	}, [isAdmin, isLoading, navigate])

	if (isLoading) {
		return (
			<div className="relative flex-1 overflow-auto">
				<Header title="ICF Editor" />
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
			<Header title="ICF Editor" />
			<div className="mb-4 p-4 sm:px-6 sm:py-0">
				<div className="bg-card text-card-foreground space-y-6 rounded-sm p-6">
					<IcfEditor />
				</div>
			</div>
		</div>
	)
}

export default AdminIcfEditor
