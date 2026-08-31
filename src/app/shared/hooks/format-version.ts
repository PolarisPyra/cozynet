/**
 * The bridge reports a composite version string "{rom.major.minor}/{data.major.minor.release}"
 * (e.g. "1.55/2.07.00") so Artemis's lobby matching can enforce compatibility
 * at the exact granularity the game itself displays.
 *
 * For UI we map the data.release number to the Excel-column-style alphabet
 * suffix the game uses in its bottom-right "Ver.1.55-A" display (see
 * Common/Assembly-CSharp_unpacked/MU3.Sys/VersionNo.cs releaseNoAlphabet).
 *
 * These helpers are game-agnostic — any title whose bridge reports a
 * "{rom}/{data.major.minor.release}" composite gets this rendering for free.
 */
export interface ParsedVersion {
	rom?: string
	dataRaw?: string
	dataLetter?: string
	raw: string
}

/** Port of VersionNo.releaseNoAlphabet — bijective base-26. */
export function releaseNumberToAlphabet(release: number): string {
	let out = ""
	let n = release | 0
	while (n > 0) {
		n--
		out = String.fromCharCode(65 + (n % 26)) + out
		n = Math.floor(n / 26)
	}
	return out
}

export function parseVersion(v: string | undefined | null): ParsedVersion {
	if (!v) return { raw: "" }
	const slash = v.indexOf("/")
	if (slash < 0) return { rom: v, raw: v }
	const rom = v.slice(0, slash)
	const dataRaw = v.slice(slash + 1)
	const parts = dataRaw.split(".")
	let dataLetter: string | undefined
	if (parts.length >= 3) {
		const release = Number(parts[2])
		if (Number.isFinite(release)) {
			dataLetter = releaseNumberToAlphabet(release)
		}
	}
	return { rom, dataRaw, dataLetter, raw: v }
}

/** "Ver.1.55-A" — matches the cabinet's bottom-right display. */
export function formatVersionGameStyle(v: string | undefined | null): string {
	const p = parseVersion(v)
	if (!p.rom) return ""
	if (!p.dataLetter) return `Ver.${p.rom}`
	return `Ver.${p.rom}-${p.dataLetter}`
}

/** "{gameLabel} 1.55-A" or just "{gameLabel} 1.55" if no letter suffix. */
export function formatVersionLong(v: string | undefined | null, gameLabel = ""): string {
	const p = parseVersion(v)
	if (!p.rom) return ""
	const base = p.dataLetter ? `${p.rom}-${p.dataLetter}` : p.rom
	return gameLabel ? `${gameLabel} ${base}` : base
}

/** "1.55-A" or "1.55" — compact form for lobby cards. */
export function formatVersionCompact(v: string | undefined | null): string {
	const p = parseVersion(v)
	if (!p.rom) return ""
	if (!p.dataLetter) return p.rom
	return `${p.rom}-${p.dataLetter}`
}
