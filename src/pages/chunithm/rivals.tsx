import RivalCard from "@/components/chunithm/rival-card";
import Header from "@/components/common/header";
import ResponsiveGrid from "@/components/common/responsive-grid";
import Spinner from "@/components/common/spinner";
import { useChunithmVersion } from "@/hooks/chunithm";
import useRivalsManagement from "@/hooks/chunithm/use-rivals-management";
import { Body, Container } from "@/pages/layout/layout";

const ChunithmRivals = () => {
	const version = useChunithmVersion();
	const {
		rivalIds,
		rivalCount,
		users,
		filteredRivals,
		searchQuery,
		setSearchQuery,
		handleAddRival,
		handleRemoveRival,
		isLoading,
	} = useRivalsManagement();

	const searchItems = users.map((user) => ({
		id: user.id,
		title: user.username || "",
	}));

	if (isLoading) return <LoadingState />;
	if (!version) return <NoVersionState />;

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
					groupLabel: "Users",
				}}
			/>
			<Body>
				<ResponsiveGrid
					items={filteredRivals}
					CardComponent={(props) => (
						<RivalCard
							{...props}
							rivalIds={rivalIds}
							rivalCount={rivalCount}
							onAddRival={handleAddRival}
							onRemoveRival={handleRemoveRival}
						/>
					)}
				/>
			</Body>
		</Container>
	);
};

const LoadingState = () => (
	<div className="relative flex-1 overflow-auto">
		<Header title="Rivals" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<Spinner />
		</div>
	</div>
);

const NoVersionState = () => (
	<div className="relative flex-1 overflow-auto">
		<Header title="Rivals" />
		<div className="flex h-[calc(100vh-64px)] items-center justify-center">
			<p className="text-primary">Please set your Chunithm version in settings first</p>
		</div>
	</div>
);

export default ChunithmRivals;
