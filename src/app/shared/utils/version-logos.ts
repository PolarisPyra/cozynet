import { CDN } from "@/app/shared/utils/constants"

const CHUNITHM_LOGOS: Record<number, string> = {
	[0]: `${CDN}/chunithm/logos/0.webp`, // chunithm
	[1]: `${CDN}/chunithm/logos/1.webp`, // chunithm Plus
	[2]: `${CDN}/chunithm/logos/2.webp`, // air
	[3]: `${CDN}/chunithm/logos/3.webp`, // air Plus
	[4]: `${CDN}/chunithm/logos/4.webp`, // star
	[5]: `${CDN}/chunithm/logos/5.webp`, // star Plus
	[6]: `${CDN}/chunithm/logos/6.webp`, // amazon
	[7]: `${CDN}/chunithm/logos/7.webp`, // amazon Plus
	[8]: `${CDN}/chunithm/logos/8.webp`, // crystal
	[9]: `${CDN}/chunithm/logos/9.webp`, // crystal Plus
	[10]: `${CDN}/chunithm/logos/10.webp`, // Paradise / lost
	[11]: `${CDN}/chunithm/logos/11.webp`, // New
	[12]: `${CDN}/chunithm/logos/12.webp`, // New Plus
	[13]: `${CDN}/chunithm/logos/13.webp`, // Sun
	[14]: `${CDN}/chunithm/logos/14.webp`, // Sun Plus
	[15]: `${CDN}/chunithm/logos/15.webp`, // Luminous
	[16]: `${CDN}/chunithm/logos/16.webp`, // Luminous Plus
	[17]: `${CDN}/chunithm/logos/17.webp`, // Verse
	[18]: `${CDN}/chunithm/logos/18.webp` // XVerse
}

export const getChunithmLogo = {
	getLogo(version?: number | null): string | null {
		if (version === null || version === undefined) return null
		return CHUNITHM_LOGOS[version] ?? null
	}
}

const ONGEKI_LOGOS: Record<number, string> = {
	[0]: `${CDN}/ongeki/logos/0.webp`, // O.N.G.E.K.I.
	[1]: `${CDN}/ongeki/logos/1.webp`, // O.N.G.E.K.I. PLUS
	[2]: `${CDN}/ongeki/logos/2.webp`, // SUMMER
	[3]: `${CDN}/ongeki/logos/3.webp`, // SUMMER PLUS
	[4]: `${CDN}/ongeki/logos/4.webp`, // R.E.D.
	[5]: `${CDN}/ongeki/logos/5.webp`, // R.E.D. PLUS
	[6]: `${CDN}/ongeki/logos/6.webp`, // bright
	[7]: `${CDN}/ongeki/logos/7.webp`, // bright MEMORY
	[8]: `${CDN}/ongeki/logos/8.webp` // Re:Refresh
}

export const getOngekiLogo = {
	getLogo(version?: number | null): string | null {
		if (version === null || version === undefined) return null
		return ONGEKI_LOGOS[version] ?? null
	}
}
