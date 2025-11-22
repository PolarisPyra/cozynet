import { useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { Edit2, Save, X } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import Spinner from "@/app/shared/components/common/spinner"
import { Button } from "@/app/shared/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/app/shared/components/ui/form"
import { Input } from "@/app/shared/components/ui/input"
import { useUpdateUsername } from "@/app/shared/hooks/users"

const usernameSchema = z.object({
	username: z.string().min(1, "Username cannot be empty").max(50, "Username is too long")
})

type UsernameFormValues = z.infer<typeof usernameSchema>

export function ChangeUsername({ username }: { username: string }) {
	const [editing, setEditing] = useState(false)
	const { mutate, isPending } = useUpdateUsername()

	const form = useForm<UsernameFormValues>({
		resolver: zodResolver(usernameSchema),
		defaultValues: { username }
	})

	const onSubmit = (values: UsernameFormValues) => {
		if (values.username === username) return setEditing(false)
		mutate(
			{ username: values.username },
			{
				onSuccess: data => {
					form.reset({ username: data.username })
					setEditing(false)
					toast.success("Username updated")
				},
				onError: (err: Error) => toast.error(err.message || "Update failed")
			}
		)
	}

	const cancel = () => {
		form.reset({ username })
		setEditing(false)
	}

	if (!editing) {
		return (
			<div className="flex items-center gap-2">
				<span className="text-lg font-semibold">{username}</span>
				<Button size="icon" variant="ghost" onClick={() => setEditing(true)} className="text-muted-foreground h-8 w-8">
					<Edit2 className="h-4 w-4" />
				</Button>
			</div>
		)
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem className="flex-1">
							<FormControl>
								<Input
									{...field}
									onKeyDown={e => e.key === "Escape" && cancel()}
									disabled={isPending}
									maxLength={50}
									autoFocus
									className="h-9 max-w-xs"
								/>
							</FormControl>
						</FormItem>
					)}
				/>
				<Button size="icon" variant="ghost" type="submit" disabled={isPending}>
					{isPending ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
				</Button>
				<Button size="icon" variant="ghost" type="button" onClick={cancel} disabled={isPending}>
					<X className="h-4 w-4" />
				</Button>
			</form>
		</Form>
	)
}

