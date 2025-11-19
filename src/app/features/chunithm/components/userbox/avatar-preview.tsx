import { useMemo } from "react"

import { useCurrentAvatar } from "@/app/features/chunithm/hooks/userbox/avatar"
import { CDN } from "@/app/shared/utils/constants"

const staticPath = `${CDN}/chunithm/avatarStatic`
const nonStaticPath = `${CDN}/chunithm/avatar`

const maybeImg = (path?: string) =>
	path && path.trim() && !path.endsWith("/") ? <img src={path} alt="" /> : null

export function AvatarPreview() {
	const { data: currentAvatar } = useCurrentAvatar()

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
			faceStatic: `${staticPath}/CHU_UI_Avatar_Tex_Face.webp`,
			skinfootL: `${staticPath}/CHU_UI_Avatar_Tex_01400001.webp`,
			skinfootR: `${staticPath}/CHU_UI_Avatar_Tex_01400001.webp`
		}

		if (!currentAvatar) return defaultImages

		return {
			...defaultImages,
			back: currentAvatar.back?.imagePath
				? `${nonStaticPath}/${currentAvatar.back.imagePath}`
				: defaultImages.back,
			wear: currentAvatar.wear?.imagePath
				? `${nonStaticPath}/${currentAvatar.wear.imagePath}`
				: defaultImages.wear,
			head: currentAvatar.head?.imagePath
				? `${nonStaticPath}/${currentAvatar.head.imagePath}`
				: defaultImages.head,
			item: currentAvatar.item?.imagePath
				? `${nonStaticPath}/${currentAvatar.item.imagePath}`
				: defaultImages.item,
			face: currentAvatar.face?.imagePath
				? `${nonStaticPath}/${currentAvatar.face.imagePath}`
				: defaultImages.face
		}
	}, [currentAvatar])

	return (
		<div className="bg-card border-border rounded-sm border p-2">
			<h3 className="text-foreground mb-1 text-center text-sm font-semibold">Current Avatar</h3>
			<div className="flex items-center justify-center overflow-hidden" style={{ height: "140px" }}>
				<div className="avatar_group" style={{ display: "flex", justifyContent: "center", transform: "scale(0.5)" }}>
					<div className="avatar_base">
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
					</div>
				</div>
			</div>
		</div>
	)
}

