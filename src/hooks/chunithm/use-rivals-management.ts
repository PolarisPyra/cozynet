import { useState } from "react"

import { toast } from "sonner"

import { useAddRival, useRemoveRival, useRivalCount, useRivalUsers, useRivals } from "@/hooks/chunithm"

const useRivalsManagement = () => {
	const { data: rivalIds = [], isLoading: isLoadingRivals } = useRivals()
	const { data: rivalCount = 0, isLoading: isLoadingCount } = useRivalCount()
	const { data: users = [], isLoading: isLoadingUsers } = useRivalUsers()
	const { mutate: addRival } = useAddRival()
	const { mutate: removeRival } = useRemoveRival()
	const [searchQuery, setSearchQuery] = useState("")

	const filteredRivals = users.filter(user => user.username.toLowerCase().includes(searchQuery.toLowerCase()))

	const handleAddRival = (id: number) => {
		if (rivalCount >= 3) {
			toast.error("You can only have up to 3 rivals.")
			return
		}

		addRival(id, {
			onSuccess: () => {
				toast.success("Rival added successfully!")
			},
			onError: () => {
				toast.error("Failed to add rival")
			}
		})
	}

	const handleRemoveRival = (id: number) => {
		removeRival(id, {
			onSuccess: () => {
				toast.success("Rival removed successfully!")
			},
			onError: () => {
				toast.error("Failed to remove rival")
			}
		})
	}

	const isLoading = isLoadingRivals || isLoadingCount || isLoadingUsers

	return {
		rivalIds,
		rivalCount,
		users,
		filteredRivals,
		searchQuery,
		setSearchQuery,
		handleAddRival,
		handleRemoveRival,
		isLoading
	}
}

export default useRivalsManagement
