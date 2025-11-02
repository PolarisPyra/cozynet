import { useQuery } from "@tanstack/react-query"

import { useOngekiVersion } from "@/hooks/ongeki"
import { api } from "@/utils"

interface B45ExportData {
	honor: string
	name: string
	rating: number
	ratingMax: number
	updatedAt: string
	best: Array<{
		title: string
		artist: string
		score: number
		rank: string
		diff: string
		const: number
		rating: number
		date: number
		is_fullbell: number
		is_allbreak: number
		is_fullcombo: number
	}>
	news: Array<{
		title: string
		artist: string
		score: number
		rank: string
		diff: string
		const: number
		rating: number
		date: number
		is_fullbell: number
		is_allbreak: number
		is_fullcombo: number
	}>
	recent: Array<{
		title: string
		artist: string
		score: number
		rank: string
		diff: string
		const: number
		rating: number
		date: number
	}>
}

/**
 * Hook to fetch Ongeki Reiwa export data
 * @returns Query result with Reiwa export data
 */
export const useReiwaExport = () => {
	const version = useOngekiVersion()
	const isRefreshOrAbove = version ? Number(version) >= 8 : false

	return useQuery<B45ExportData>({
		queryKey: ["ongeki", "reiwa", "export", version],
		queryFn: async () => {
			const response = await api.ongeki.reiwa.export.$get()

			if (!response.ok) {
				throw new Error()
			}

			return response.json() as Promise<B45ExportData>
		},
		enabled: !!version && !isRefreshOrAbove
	})
}

interface RefreshExportData {
	honor: string
	name: string
	rating: number
	updatedAt: string
	best: Array<{
		id: number
		title: string
		artist: string
		const: number
		diff: string
		score: number
		rank: string
		update: number
		lamps: {
			is_fullbell: boolean
			is_allbreak: boolean
			is_fullcombo: boolean
		}
		rating: number
		is_unknown: boolean
	}>
	new: Array<{
		id: number
		title: string
		artist: string
		const: number
		diff: string
		score: number
		rank: string
		update: number
		lamps: {
			is_fullbell: boolean
			is_allbreak: boolean
			is_fullcombo: boolean
		}
		rating: number
		is_unknown: boolean
	}>
	pscore: Array<{
		id: number
		title: string
		artist: string
		const: number
		diff: string
		score: number
		rank: string
		update: number
		lamps: {
			is_fullbell: boolean
			is_allbreak: boolean
			is_fullcombo: boolean
		}
		rating: number
		p_score: number
		p_star: number
		p_rating: number
		is_unknown: boolean
	}>
}

/**
 * Hook to fetch Ongeki Re:Fresh Reiwa export data
 * @returns Query result with Re:Fresh Reiwa export data
 */
export const useReiwaRefreshExport = () => {
	const version = useOngekiVersion()
	const isRefreshOrAbove = version ? Number(version) >= 8 : false

	return useQuery<RefreshExportData>({
		queryKey: ["ongeki", "reiwa", "exportRefresh", version],
		queryFn: async () => {
			const response = await api.ongeki.reiwa.exportRefresh.$get()

			if (!response.ok) {
				throw new Error()
			}

			return response.json() as Promise<RefreshExportData>
		},
		enabled: !!version && isRefreshOrAbove
	})
}
