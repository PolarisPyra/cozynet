import type { BaseFilter, DB, FilterValues, UseFilteringParams } from "@/app/shared/types"

export type OngekiCard = DB.OngekiUserCard & DB.OngekiStaticCards

export interface CardFilter<T = string> extends BaseFilter<T> {
	predicate: (card: OngekiCard, value: T) => boolean
}

export type CardFilterValues = FilterValues

export interface UseCardFilteringParams extends UseFilteringParams {}
