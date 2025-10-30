import { Link, Navigate, Outlet } from "react-router-dom";

// BgGame removed
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth";

export const WelcomeContent = () => (
	<div className="bg-card mx-4 w-full max-w-md rounded-sm p-8">
		<h1 className="text-primary mb-8 text-center text-4xl font-bold">Welcome</h1>
		<div className="flex flex-col gap-5">
			<Link to="/login">
				<Button variant="custom" className="w-full">
					Login
				</Button>
			</Link>
			<Link to="/signup">
				<Button variant="custom" className="w-full">
					Sign up
				</Button>
			</Link>
		</div>
		<p className="text-primary mt-6 text-center text-sm">Join our community today!</p>
	</div>
);

const WelcomePage = () => {
	const { user } = useAuth();

	return user ? (
		<Navigate to="/home" />
	) : (
		<>
			<div className="bg-background z-10 flex min-h-screen items-center justify-center p-4">
				<Outlet />
			</div>
		</>
	);
};

export default WelcomePage;
