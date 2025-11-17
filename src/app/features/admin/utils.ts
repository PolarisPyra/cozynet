export function hasAdminAccess(systemAdmin: any): boolean {
	return systemAdmin?.hasAdminAccess ?? false
}
