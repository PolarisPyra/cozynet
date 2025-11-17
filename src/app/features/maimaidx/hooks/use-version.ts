import { useMutation, useQuery } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"

import { useAuth } from "@/app/shared/hooks/auth/use-auth"
import { useCurrentUser } from "@/app/shared/hooks/users"

export const useMaimaiDxVersion = (): number => {
	const { versions } = useCurrentUser()
	return versions.maimaidx_version
}

export const useMaimaiDxVersions = () => {
	return useQuery({
		queryKey: ["mai2Versions"],
		queryFn: async () => {
			const response = await api.maimaidx.cozynet.versions.$get()
			if (!response.ok) {
				throw new Error()
			}

			return await response.json()
		}
	})
}

export const useUpdateMaimaiDxVersion = () => {
	const { setUser } = useAuth()
	return useMutation({
		mutationFn: async (version: number) => {
			const response = await api.maimaidx.cozynet.update.$post({
				json: { version }
			})
			if (!response.ok) {
				throw new Error()
			}

			const user = await response.json()
			setUser(user)
		}
	})
}
