import { PermissionValue } from "@/utils/enums"

interface UserRoles {
	upload: number
	download: number
	special: number
}

export function hasSpecialAccess(userRoles: UserRoles | undefined): boolean {
	return userRoles?.special === PermissionValue.Enabled
}

export function hasDownloadAccess(userRoles: UserRoles | undefined): boolean {
	return userRoles?.download === PermissionValue.Enabled
}
export function hasAdminAccess(systemAdmin: any): boolean {
	const hasAdminPerms = systemAdmin?.hasAdminAccess ?? false
	return hasAdminPerms
}
