import { toast } from "sonner";

import VersionManagement from "@/components/common/version-management";
import { useMaimaiDxVersion, useMaimaiDxVersions, useUpdateMaimaiDxVersion } from "@/hooks/maimaidx";
import { MaimaiDxVersions } from "@/utils/enums";

const MaimaiDxVersionManager = () => {
	const version = useMaimaiDxVersion();
	const { data: availableVersions } = useMaimaiDxVersions();
	const { mutate: updateVersion, isPending } = useUpdateMaimaiDxVersion();

	const handleUpdateVersion = (version: number) => {
		updateVersion(version, {
			onSuccess: () => toast.success("Maimai DX version updated successfully!"),
			onError: () => toast.error("Failed to update Maimai DX  version"),
		});
	};

	return (
		<VersionManagement
			title="Set Maimai DX version"
			currentVersion={version}
			availableVersions={availableVersions}
			isUpdating={isPending}
			onUpdateVersion={handleUpdateVersion}
			versions={MaimaiDxVersions}
			buttonLabel="Update Maimai DX settings"
			updatingLabel="Updating..."
		/>
	);
};

export default MaimaiDxVersionManager;
