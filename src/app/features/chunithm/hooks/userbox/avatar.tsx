import React, { useCallback, useEffect, useMemo, useState } from "react"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { InferResponseType } from "hono"

import { api } from "@/app/shared/utils"
import { CDN } from "@/app/shared/utils/constants"

type AvatarItem = InferResponseType<typeof api.chunithm.userbox.avatar.$get>[0]
type AvatarImages = {
	back: string
	wear: string
	skin: string
	handL: string
	handR: string
	head: string
	face: string
	item: string
	faceStatic: string
	skinfootL: string
	skinfootR: string
}
const staticPath = `${CDN}/chunithm/avatarStatic`
const nonStaticPath = `${CDN}/chunithm/avatar`

const getInitialAvatarImages = (): AvatarImages => ({
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
})

const updateImages = (avatarItems: AvatarItem[], initialImages: AvatarImages): AvatarImages => {
	const updatedImages = {
		...initialImages,
		back: avatarItems.find(item => item.slot === "back")?.imagePath
			? `${nonStaticPath}/${avatarItems.find(item => item.slot === "back")?.imagePath}`
			: initialImages.back,
		wear: avatarItems.find(item => item.slot === "wear")?.imagePath
			? `${nonStaticPath}/${avatarItems.find(item => item.slot === "wear")?.imagePath}`
			: initialImages.wear,
		head: avatarItems.find(item => item.slot === "head")?.imagePath
			? `${nonStaticPath}/${avatarItems.find(item => item.slot === "head")?.imagePath}`
			: initialImages.head,
		item: avatarItems.find(item => item.slot === "item")?.imagePath
			? `${nonStaticPath}/${avatarItems.find(item => item.slot === "item")?.imagePath}`
			: initialImages.item,
		face: avatarItems.find(item => item.slot === "face")?.imagePath
			? `${nonStaticPath}/${avatarItems.find(item => item.slot === "face")?.imagePath}`
			: initialImages.face
	}
	return updatedImages
}

const maybeImg = (path?: string) =>
	path && path.trim() && !path.endsWith("/") ? <img src={path.replace(".dds", ".webp")} /> : null

export const useAvatar = () => {
	const [avatarItems, setAvatarItems] = useState<AvatarItem[]>([])
	const [isLoading, setIsLoading] = useState(false)

	const avatarImages = useMemo(() => {
		const initialImages = getInitialAvatarImages()
		const updatedImages = updateImages(avatarItems, initialImages)
		return updatedImages
	}, [avatarItems])

	const fetchAvatar = useCallback(async () => {
		if (isLoading) return
		setIsLoading(true)
		try {
			const response = await api.chunithm.userbox.avatar.$get()
			if (response.ok) {
				const data = await response.json()
				setAvatarItems(data)
			} else {
				console.error("Failed to fetch avatar items")
			}
		} catch (error) {
			console.error("Error fetching avatar:", error)
		} finally {
			setIsLoading(false)
		}
	}, [isLoading])

	const equip = useCallback(
		async (itemId: number, slot: string) => {
			try {
				const updatedItems = await api.chunithm.userbox.avatar
					.$post({
						json: {
							[slot]: itemId
						}
					})
					.then(res => res.json())
				setAvatarItems(updatedItems)
			} catch (error) {
				console.error("Error equipping item:", error)
			}
		},
		[avatarItems]
	)

	useEffect(() => {
		if (avatarItems.length === 0 && !isLoading) {
			fetchAvatar()
		}
	}, [avatarItems.length, isLoading, fetchAvatar])

	const renderAvatar = useMemo(() => {
		const avatarKey = `avatar-${avatarItems.length}-${Object.values(avatarImages).join("-")}`

		return (
			<div key={avatarKey}>
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
		)
	}, [avatarImages, avatarItems.length])

	return {
		items: avatarItems,
		render: renderAvatar,
		equip,
		isLoading
	}
}

// New hooks for the simplified userbox
export interface AvatarAccessoryItem {
	avatarAccessoryId: number
	imagePath: string
	label: string
	slot: "back" | "wear" | "head" | "face" | "item" | "skin" | "front"
	locked: boolean
}

export function useCurrentAvatar() {
	return useQuery({
		queryKey: ["userbox", "avatar", "current"],
		queryFn: async () => {
			const response = await api.chunithm.userbox.avatar.$get()
			if (!response.ok) {
				throw new Error("Failed to fetch current avatar")
			}
			const items = await response.json()
			// Convert array to object with slots as keys
			const avatarObj: Record<string, AvatarAccessoryItem> = {}
			items.forEach(item => {
				avatarObj[item.slot] = item
			})
			return avatarObj
		}
	})
}

export function useSearchAvatarItems(filters: { category: number | null; locked: boolean | null }) {
	// Map category to slot - matches chuni_static_avatar.category values
	const slotMap: Record<number, string> = {
		1: "wear",
		2: "head",
		3: "face",
		4: "skin",
		5: "item",
		6: "front",
		7: "back"
	}

	// If category is null, search all slots
	const slots =
		filters.category === null ? ["back", "wear", "head", "face", "item", "skin"] : [slotMap[filters.category]]

	return useQuery({
		queryKey: ["userbox", "avatar", "search", filters.category, filters.locked],
		queryFn: async () => {
			const response = await api.chunithm.userbox.avatar.search.$post({
				json: {
					filter: {
						slot: slots as ("back" | "wear" | "head" | "face" | "item" | "skin")[],
						locked: filters.locked
					}
				}
			})

			if (!response.ok) {
				throw new Error("Failed to search avatar items")
			}

			return await response.json()
		}
	})
}

export function useEquipAvatarItem() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (params: {
			avatarAccessoryId: number
			slot: "back" | "wear" | "head" | "face" | "item" | "skin" | "front"
		}) => {
			const response = await api.chunithm.userbox.avatar.$post({
				json: {
					[params.slot]: params.avatarAccessoryId
				}
			})

			if (!response.ok) {
				throw new Error("Failed to equip avatar item")
			}

			return await response.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["userbox", "avatar", "current"] })
		}
	})
}

export function useUnlockAvatarItem() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (avatarAccessoryId: number) => {
			const response = await api.chunithm.userbox.avatar.unlock[":id"].$patch({
				param: { id: avatarAccessoryId.toString() }
			})

			if (!response.ok) {
				throw new Error("Failed to unlock avatar item")
			}

			return await response.json()
		},
		onSuccess: (_, avatarAccessoryId) => {
			// Update search results to mark item as unlocked
			queryClient.setQueriesData({ queryKey: ["userbox", "avatar", "search"] }, (old: any) => {
				if (!old?.items) return old
				return {
					...old,
					items: old.items.map((item: AvatarAccessoryItem) =>
						item.avatarAccessoryId === avatarAccessoryId ? { ...item, locked: false } : item
					)
				}
			})
		}
	})
}
