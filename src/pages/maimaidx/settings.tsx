import React from "react";

import Header from "@/components/common/header";
import MaimaiDxVersionManager from "@/components/settings/maimaidx/version-management";

interface GameSettingsProps {
	onUpdate?: () => void;
}

const MaimaiDxSettings: React.FC<GameSettingsProps> = () => {
	return (
		<div className="relative flex-1 overflow-auto">
			<Header title={"Maimai DX Settings"} />
			<div className="mb-4 px-4 pb-4 sm:py-0">
				<MaimaiDxVersionManager />
			</div>
		</div>
	);
};

export default MaimaiDxSettings;
