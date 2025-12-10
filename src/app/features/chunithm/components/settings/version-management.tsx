import { toast } from "sonner"

import { VersionManagement } from "@/app/shared/components/common/version-management"
import { useChunithmVersion, useChunithmVersions, useUpdateChunithmVersion } from "@/app/features/chunithm/hooks"
import { ChunithmVersions } from "@/app/shared/utils/chunithm"

const ChunithmVersionManager = () => {
	const version = useChunithmVersion()
	const { data: availableVersions } = useChunithmVersions()
	const { mutate: updateVersion, isPending } = useUpdateChunithmVersion()

	const handleUpdateVersion = (version: number) => {
		updateVersion(version, {
			onSuccess: () => toast.success("Chunithm version updated successfully!"),
			onError: () => toast.error("Failed to update Chunithm version")
		})
	}

	return (
		<VersionManagement
			title="Set Chunithm Version"
			currentVersion={version}
			availableVersions={availableVersions}
			isUpdating={isPending}
			onUpdateVersion={handleUpdateVersion}
			versions={ChunithmVersions}
			buttonLabel="Update Chunithm settings"
			updatingLabel="Updating..."
		/>
	)
}

export default ChunithmVersionManager
