import { Link, Navigate, Outlet } from "react-router-dom"

// BgGame removed
import { Button } from "@/app/shared/components/ui/button"
import { useAuth } from "@/app/shared/hooks/auth/use-auth"

export const WelcomeContent = () => (
	<div className="bg-card mx-4 w-full max-w-md rounded-sm p-8">
		<h1 className="text-primary mb-8 text-center text-4xl font-bold">Welcome</h1>
		<div className="flex flex-col gap-5">
			<Link to="/login">
				<Button variant="outline" size="sm" className="w-full">
					Login
				</Button>
			</Link>
			<Link to="/signup">
				<Button variant="outline" size="sm" className="w-full">
					Sign up
				</Button>
			</Link>
		</div>
		<p className="text-primary mt-6 text-center text-sm">Join our community today!</p>
	</div>
)

const WelcomePage = () => {
	const { user, isLoading } = useAuth()

	// Don't redirect while still loading - prevents redirect loops
	if (isLoading) {
		return (
			<div className="bg-background z-10 flex min-h-screen items-center justify-center p-4">
				<div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
			</div>
		)
	}

	// Only redirect if user is authenticated
	return user ? (
		<Navigate to="/home" replace />
	) : (
		<>
			<div className="bg-background z-10 flex min-h-screen items-center justify-center p-4">
				<Outlet />
			</div>
		</>
	)
}

export default WelcomePage
