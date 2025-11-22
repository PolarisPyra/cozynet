import { zodResolver } from "@hookform/resolvers/zod"
import { Lock } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import Spinner from "@/app/shared/components/common/spinner"
import { Button } from "@/app/shared/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/shared/components/ui/form"
import { Input } from "@/app/shared/components/ui/input"
import { useUpdatePassword } from "@/app/shared/hooks/users"
import { passwordSchema } from "@/app/shared/types/validation/auth"

const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: passwordSchema,
		confirmPassword: z.string().min(1, "Please confirm your new password")
	})
	.refine(data => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"]
	})

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

export function ChangePassword() {
	const { mutate, isPending } = useUpdatePassword()

	const form = useForm<ChangePasswordFormValues>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
		mode: "onChange"
	})

	const onSubmit = (values: ChangePasswordFormValues) => {
		mutate(
			{ currentPassword: values.currentPassword, newPassword: values.newPassword },
			{
				onSuccess: () => {
					form.reset()
					toast.success("Password updated")
				},
				onError: (err: Error) => toast.error(err.message || "Failed to update password")
			}
		)
	}

	const { newPassword, confirmPassword } = form.watch()
	const passwordsMatch =
		newPassword &&
		confirmPassword &&
		newPassword === confirmPassword &&
		!form.formState.errors.confirmPassword &&
		!form.formState.errors.newPassword

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="currentPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-muted-foreground text-xs font-medium">Current Password</FormLabel>
							<FormControl>
								<Input
									{...field}
									type="password"
									placeholder="Enter your current password"
									disabled={isPending}
									autoComplete="current-password"
									className="h-9"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="newPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-muted-foreground text-xs font-medium">New Password</FormLabel>
							<FormControl>
								<Input
									{...field}
									type="password"
									placeholder="Enter your new password (min. 8 characters)"
									disabled={isPending}
									autoComplete="off"
									readOnly
									onFocus={e => e.target.removeAttribute("readonly")}
									data-1p-ignore
									data-lpignore="true"
									data-form-type="other"
									className="h-9"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="confirmPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-muted-foreground text-xs font-medium">Confirm New Password</FormLabel>
							<FormControl>
								<Input
									{...field}
									type="password"
									placeholder="Re-enter your new password"
									disabled={isPending}
									autoComplete="off"
									readOnly
									onFocus={e => e.target.removeAttribute("readonly")}
									data-1p-ignore
									data-lpignore="true"
									data-form-type="other"
									className="h-9"
								/>
							</FormControl>
							<FormMessage />
							{passwordsMatch && <p className="text-muted-foreground text-sm">Passwords match</p>}
						</FormItem>
					)}
				/>

				<Button variant="outline" size="sm" type="submit" disabled={!form.formState.isValid || isPending}>
					{isPending ? <Spinner className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
					Change Password
				</Button>
			</form>
		</Form>
	)
}
