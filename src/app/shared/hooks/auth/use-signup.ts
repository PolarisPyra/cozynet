import { useMutation } from "@tanstack/react-query"

import { api } from "@/app/shared/utils"
import type { UserMeta } from "@/server/types/jwt"

interface SignupCredentials {
	username: string
	password: string
	accessCode: string
}

interface ApiErrorResponse {
	error: string
}

const extractErrorMessage = async (response: Response): Promise<string> => {
	try {
		const errorData = (await response.json()) as ApiErrorResponse
		return errorData.error || "Signup failed. Please check your information and try again."
	} catch {
		return "Signup failed. Please check your information and try again."
	}
}

export function useSignup() {
	return useMutation({
		mutationFn: async ({ username, password, accessCode }: SignupCredentials): Promise<UserMeta> => {
			const response = await api.signup.$post({
				json: { username, password, accessCode }
			})

			if (!response.ok) {
				const errorMessage = await extractErrorMessage(response)
				throw new Error(errorMessage)
			}

			return (await response.json()) as UserMeta
		}
	})
}
