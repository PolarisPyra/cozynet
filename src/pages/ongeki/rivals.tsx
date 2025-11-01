import { useState } from "react"

import { toast } from "sonner"

import Header from "@/components/common/header"
import ResponsiveGrid from "@/components/common/responsive-grid"
import { RivalInfoCard } from "@/components/common/rival-info-card"
import Spinner from "@/components/common/spinner"
import { useAddRival, useOngekiVersion, useRemoveRival, useRivalCount, useRivalUsers, useRivals } from "@/hooks/ongeki"
import { Body, Container } from "@/pages/layout/layout"

export function OngekiRivals() {
	const [searchQuery, setSearchQuery] = useState("")

	const version = useOngekiVersion()
	const { data: rivalIds = [], isLoading: isLoadingRivals } = useRivals()
	const { data: rivalCount = 0, isLoading: isLoadingCount } = useRivalCount()
	const { data: users = [], isLoading: isLoadingUsers } = useRivalUsers()
	const { mutate: addRival } = useAddRival()
	const { mutate: removeRival } = useRemoveRival()

	const filteredRivals = users.filter(user => user.username.toLowerCase().includes(searchQuery.toLowerCase()))

	const searchItems = users.map(user => ({
		id: user.id,
		title: user.username || ""
	}))

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

	const RivalCard = ({ score }: { score: any }) => {
		const isRival = rivalIds.includes(score.id)
		return (
			<RivalInfoCard
				user={score}
				isRival={isRival}
				onAddRival={handleAddRival}
				onRemoveRival={handleRemoveRival}
				rivalCount={rivalCount}
			/>
		)
	}

	if (isLoading) {
		return (
			<Container>
				<Header title="Rivals" />
				<div className="flex h-[calc(100vh-64px)] items-center justify-center">
					<Spinner />
				</div>
			</Container>
		)
	}

	return (
		<Container>
			<Header
				title={`Rivals ${rivalCount}/3`}
				searchProps={{
					items: searchItems,
					searchQuery,
					onSearchChange: setSearchQuery,
					placeholder: "Search users...",
					emptyMessage: "No users found.",
					groupLabel: "Users"
				}}
			/>
			{version ? (
				<Body>
					<ResponsiveGrid items={filteredRivals} CardComponent={RivalCard} />
				</Body>
			) : (
				<div className="flex h-[calc(100vh-64px)] items-center justify-center">
					<p className="text-primary">Please set your Ongeki version in settings first</p>
				</div>
			)}
		</Container>
	)
}
