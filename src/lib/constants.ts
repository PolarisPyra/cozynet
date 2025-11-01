import { TrophyRareType } from "./enums"

export const CDN = env.CDN_URL
export const turnstile = env.CFTurnstileKey

export const honorBackgrounds: Record<TrophyRareType, string> = {
	[TrophyRareType.Normal]: `honor_bg_normal.webp`,
	[TrophyRareType.Bronze]: `honor_bg_bronze.webp`,
	[TrophyRareType.Silver]: `honor_bg_silver.webp`,
	[TrophyRareType.Gold]: `honor_bg_gold.webp`,
	[TrophyRareType.Gold2]: `honor_bg_gold.webp`,
	[TrophyRareType.Platinum]: `honor_bg_platina.webp`,
	[TrophyRareType.Platinum2]: `honor_bg_platina.webp`,
	[TrophyRareType.Rainbow]: `honor_bg_rainbow.webp`,
	[TrophyRareType.Staff]: `honor_bg_staff.webp`,
	[TrophyRareType.Ongeki]: `honor_bg_ongeki.webp`,
	[TrophyRareType.Maimai]: `honor_bg_maimai.webp`,
	[TrophyRareType.Duals]: `honor_bg_platina.webp`,
	[TrophyRareType.Idori]: `honor_bg_platina.webp`,
	[TrophyRareType.Pheonix_g]: `honor_bg_phoenix_g.webp`,
	[TrophyRareType.Pheonix_p]: `honor_bg_phoenix_p.webp`,
	[TrophyRareType.Pheonix_r]: `honor_bg_phoenix_r.webp`,
	[TrophyRareType.Lamp]: ``,
	[TrophyRareType.Lamp2]: ``,
	[TrophyRareType.Lamp3]: ``,
	[TrophyRareType.Kop]: ``,
	[TrophyRareType.Kop2]: ``
}
