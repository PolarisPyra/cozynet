import { useMemo } from "react"

import { useAvatarPending } from "@/app/features/chunithm/components/userbox/avatar-pending-context"
import { AvatarSlot, useCurrentAvatar, useSearchAvatarItems } from "@/app/features/chunithm/hooks/userbox/avatar"
import { CDN } from "@/app/shared/utils/constants"

const staticPath = `${CDN}/chunithm/avatarStatic`
const nonStaticPath = `${CDN}/chunithm/avatar`

const maybeImg = (path?: string) => (path && path.trim() && !path.endsWith("/") ? <img src={path} alt="" /> : null)

export function AvatarPreview() {
	const { data: currentAvatar } = useCurrentAvatar()
	const { pendingSelections } = useAvatarPending()
	// Fetch all items to resolve pending IDs
	const { data: allItemsData } = useSearchAvatarItems({ category: null, locked: null })
	const allItems = useMemo(() => allItemsData?.items ?? [], [allItemsData])

	// Create optimistic avatar by merging currentAvatar with pending selections
	const optimisticAvatar = useMemo(() => {
		if (!currentAvatar) return null

		const optimistic = { ...currentAvatar }

		// Replace slots with pending selections if they exist
		Object.entries(pendingSelections).forEach(([slot, id]) => {
			const item = allItems.find(item => item.avatarAccessoryId === id)
			if (item) {
				optimistic[slot as AvatarSlot] = item
			}
		})

		return optimistic
	}, [currentAvatar, pendingSelections, allItems])

	const avatarImages = useMemo(() => {
		const defaultImages = {
			back: "",
			wear: "",
			skin: `${staticPath}/CHU_UI_Avatar_Tex_01400001.webp`,
			handL: `${staticPath}/CHU_UI_Avatar_Tex_LeftHand.webp`,
			handR: `${staticPath}/CHU_UI_Avatar_Tex_RightHand.webp`,
			head: "",
			item: "",
			face: "",
			front: "",
			faceStatic: `${staticPath}/CHU_UI_Avatar_Tex_Face.webp`,
			skinfootL: `${staticPath}/CHU_UI_Avatar_Tex_01400001.webp`,
			skinfootR: `${staticPath}/CHU_UI_Avatar_Tex_01400001.webp`
		}

		const avatar = optimisticAvatar || currentAvatar
		if (!avatar) return defaultImages

		return {
			...defaultImages,
			back:
				avatar.back?.imagePath && avatar.back?.label !== "ノーマル"
					? `${nonStaticPath}/${avatar.back.imagePath}`
					: defaultImages.back,
			wear:
				avatar.wear?.imagePath && avatar.wear?.label !== "ノーマル"
					? `${nonStaticPath}/${avatar.wear.imagePath}`
					: defaultImages.wear,
			head:
				avatar.head?.imagePath && avatar.head?.label !== "ノーマル"
					? `${nonStaticPath}/${avatar.head.imagePath}`
					: defaultImages.head,
			item:
				avatar.item?.imagePath && avatar.item?.label !== "ノーマル"
					? `${nonStaticPath}/${avatar.item.imagePath}`
					: defaultImages.item,
			face:
				avatar.face?.imagePath && avatar.face?.label !== "ノーマル"
					? `${nonStaticPath}/${avatar.face.imagePath}`
					: defaultImages.face,
			front:
				avatar.front?.imagePath && avatar.front?.label !== "ノーマル"
					? `${nonStaticPath}/${avatar.front.imagePath}`
					: defaultImages.front
		}
	}, [optimisticAvatar, currentAvatar])

	return (
		<div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg">
			<div className="avatar_group relative z-10 flex h-full w-full items-center justify-center">
				<div
					className="avatar_base"
					style={{
						transform: "scale(1.1)",
						display: "flex",
						justifyContent: "center",
						alignItems: "center"
					}}
				>
					<div className="avatar_back">{maybeImg(avatarImages.back)}</div>
					<div className="avatar_wear">{maybeImg(avatarImages.wear)}</div>
					<div className="avatar_skin">{maybeImg(avatarImages.skin)}</div>
					<div className="avatar_hand_l">{maybeImg(avatarImages.handL)}</div>
					<div className="avatar_hand_r">{maybeImg(avatarImages.handR)}</div>
					<div className="avatar_head">{maybeImg(avatarImages.head)}</div>
					<div className="avatar_face_static">{maybeImg(avatarImages.faceStatic)}</div>
					<div className="avatar_face">{maybeImg(avatarImages.face)}</div>
					<div className="avatar_item_l">{maybeImg(avatarImages.item)}</div>
					<div className="avatar_item_r">{maybeImg(avatarImages.item)}</div>
					<div className="avatar_skinfoot_l">{maybeImg(avatarImages.skinfootL)}</div>
					<div className="avatar_skinfoot_r">{maybeImg(avatarImages.skinfootR)}</div>
					<div className="avatar_front">{maybeImg(avatarImages.front)}</div>
				</div>
			</div>
		</div>
	)
}
