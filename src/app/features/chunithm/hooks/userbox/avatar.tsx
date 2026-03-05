import { useCallback, useEffect, useMemo, useState } from "react"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { InferResponseType } from "hono"

import { api } from "@/app/shared/utils"
import { CDN } from "@/app/shared/utils/constants"

// Infer types from API routes
type AvatarItem = InferResponseType<typeof api.chunithm.userbox.avatar.$get>[0]
type AvatarSearchResponse = InferResponseType<typeof api.chunithm.userbox.avatar.search.$post>
type AvatarImages = {
	back: string
	wear: string
	skin: string
	handL: string
	handR: string
	head: string
	face: string
	item: string
	front: string
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
	front: "",
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
			: initialImages.face,
		front: avatarItems.find(item => item.slot === "front")?.imagePath
			? `${nonStaticPath}/${avatarItems.find(item => item.slot === "front")?.imagePath}`
			: initialImages.front
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

// Avatar slot enum - matches backend
export enum AvatarSlot {
	BACK = "back",
	FACE = "face",
	FRONT = "front",
	HEAD = "head",
	ITEM = "item",
	SKIN = "skin",
	WEAR = "wear"
}

// New hooks for the simplified userbox
export interface AvatarAccessoryItem {
	avatarAccessoryId: number
	imagePath: string
	label: string
	slot: AvatarSlot
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

// Category ID to slot mapping (from chuni_static_avatar)
const CATEGORY_TO_SLOT: Record<number, AvatarSlot> = {
	1: AvatarSlot.WEAR,
	2: AvatarSlot.HEAD,
	3: AvatarSlot.FACE,
	4: AvatarSlot.SKIN,
	5: AvatarSlot.ITEM,
	6: AvatarSlot.FRONT,
	7: AvatarSlot.BACK
} as const

const ALL_SEARCHABLE_SLOTS: AvatarSlot[] = [
	AvatarSlot.BACK,
	AvatarSlot.WEAR,
	AvatarSlot.HEAD,
	AvatarSlot.FACE,
	AvatarSlot.ITEM,
	AvatarSlot.SKIN,
	AvatarSlot.FRONT
] as const

export function useSearchAvatarItems(filters: { category: number | null; locked: boolean | null }) {
	const slots: AvatarSlot[] = filters.category === null ? ALL_SEARCHABLE_SLOTS : [CATEGORY_TO_SLOT[filters.category]]

	return useQuery({
		queryKey: ["userbox", "avatar", "search", filters.category, filters.locked],
		queryFn: async () => {
			const response = await api.chunithm.userbox.avatar.search.$post({
				json: {
					filter: {
						slot: slots,
						locked: filters.locked
					}
				}
			})

			if (!response.ok) {
				throw new Error("Failed to search avatar items")
			}

			const data: AvatarSearchResponse = await response.json()
			return data
		}
	})
}

export function useEquipAvatarItem() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (params: { avatarAccessoryId: number; slot: AvatarSlot }) => {
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
