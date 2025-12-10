import { useAuth } from "@/app/shared/hooks/auth/use-auth"
import { UserRole } from "@/app/shared/types"

/**
 * Hook to check if the current user has admin permissions
 * @returns boolean indicating if user is an admin
 */
export const useIsAdmin = (): boolean => {
	const { user } = useAuth()
	return user?.permissions === UserRole.Admin
}
