import { CreditCardIcon, Gamepad, TriangleAlert } from "lucide-react";

import KeychipGenerator from "@/components/admin/keychip-generator";
import Header from "@/components/common/header";
import AimeCardSwap from "@/components/settings/common/aime-card";
import ArcadeLocation from "@/components/settings/common/arcade-location";
import ArcadeName from "@/components/settings/common/arcade-name";
import ArcadeOwnership from "@/components/settings/common/arcade-ownership";
import { useAdmin } from "@/hooks/admin";
import { hasAdminAccess } from "@/utils/permissions";

const Account = () => {
	const { data: systemAdmin } = useAdmin();
	const adminPerms = hasAdminAccess(systemAdmin);

	return (
		<div className="relative flex-1 overflow-auto">
			<Header title={adminPerms ? "Admin Dashboard" : "Account Dashboard"} />
			<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
				{adminPerms && (
					<div className="bg-card text-card-foreground space-y-6 rounded-sm p-6">
						<div className="border-border flex items-center gap-2 border-b pb-3">
							<TriangleAlert className="text-red-500" />
							<h2 className="text-lg font-semibold text-red-500">Keychip Generator</h2>
						</div>
						<KeychipGenerator />
					</div>
				)}
				{adminPerms && (
					<div className="bg-card text-card-foreground space-y-6 rounded-sm p-6">
						<div className="border-border flex items-center gap-2 border-b pb-3">
							<TriangleAlert className="text-red-500" />
							<h2 className="text-lg font-semibold text-red-500">Arcade Ownership</h2>
						</div>
						<ArcadeOwnership />
					</div>
				)}

				<div className="bg-card text-card-foreground space-y-6 rounded-sm p-6">
					<div className="border-border flex items-center gap-2 border-b pb-3">
						<Gamepad className="text-amber-400" />
						<h2 className="text-lg font-semibold text-amber-400">Arcade Settings</h2>
					</div>
					<ArcadeName />
					<ArcadeLocation />
				</div>

				<div className="bg-card text-card-foreground space-y-6 rounded-sm p-6">
					<div className="border-border flex items-center gap-2 border-b pb-3">
						<CreditCardIcon className="text-blue-400" />
						<h2 className="text-lg font-semibold text-blue-400">Aime Card</h2>
					</div>
					<AimeCardSwap />
				</div>
			</div>
		</div>
	);
};

export default Account;
