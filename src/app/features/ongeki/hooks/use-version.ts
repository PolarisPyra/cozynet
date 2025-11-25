import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "@/app/shared/hooks/auth/use-auth"
import { useCurrentUser } from "@/app/shared/hooks/users"
import { api } from "@/app/shared/utils"

interface VersionsResponse {
	versions?: number[]
}

export const useOngekiVersion = () => {
	const { versions } = useCurrentUser()
	return versions.ongeki_version
}

export const useOngekiVersions = () => {
	return useQuery({
		queryKey: ["ongekiVersions"],
		queryFn: async () => {
			const response = await api.ongeki.settings.versions.$get()

			if (!response.ok) {
				throw new Error()
			}

			const data = (await response.json()) as VersionsResponse

			if (!data.versions) {
				throw new Error()
			}

			return data.versions
		}
	})
}

export const useUpdateOngekiVersion = () => {
	const { setUser } = useAuth()
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (version: number) => {
			const response = await api.ongeki.settings.update.$post({
				json: { version }
			})

			if (!response.ok) {
				throw new Error()
			}

			const user = await response.json()
			setUser(user)
			// Invalidate and update the verify session query to ensure the new user data is used
			queryClient.setQueryData(["auth", "verify"], user)
			queryClient.invalidateQueries({ queryKey: ["auth", "verify"] })
		}
	})
}
