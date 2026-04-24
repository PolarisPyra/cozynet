import { useMutation } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"
import type { UserMeta } from "@/server/types/jwt"

interface LoginCredentials {
	username: string
	password: string
	turnstileToken?: string
}

interface ApiErrorResponse {
	error: string
}

const extractErrorMessage = async (response: Response): Promise<string> => {
	try {
		const errorData = (await response.json()) as ApiErrorResponse
		return errorData.error || "Invalid username or password"
	} catch {
		return "Invalid username or password"
	}
}

export function useLogin() {
	return useMutation({
		mutationFn: async ({ username, password, turnstileToken }: LoginCredentials): Promise<UserMeta> => {
			const response = await api.login.$post({
				json: { username, password, turnstileToken }
			})

			if (!response.ok) {
				const errorMessage = await extractErrorMessage(response)
				throw new Error(errorMessage)
			}

			return (await response.json()) as UserMeta
		}
	})
}
