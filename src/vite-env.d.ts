/// <reference types="vite/client" />

interface ClientEnv {
	// Any custom env variables set in
	// vite.config.ts -> define -> env
	readonly CDN_URL: string
	readonly BUILD_HASH: string
	readonly TURNSTILE_SITE_KEY: string
	readonly BUILD_DATE_YEAR_MONTH_DAY: string
	readonly BUILD_TIME_12_HOUR: string

	/** Base URL for the Artemis party-play WebSocket (wss://... or ws://...).
	 * Shown in the in-page setup instructions so users know what to paste
	 * into their cabinet's mu3.ini / equivalent. Leave empty to hide. */
	readonly ARTEMIS_WS_URL: string

	// Meh, could just expose the NODE_ENV
	// directly instead of this
	readonly USE_REACT_STRICT: boolean
}

declare const env: ClientEnv
