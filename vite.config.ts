import { webUpdateNotice } from "@plugin-web-update-notification/vite"
import tailwindcss from "@tailwindcss/vite"
import path from "path"
import { defineConfig, loadEnv } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

// Generate a random hash for cache busting
const buildHash = Math.floor(Math.random() * 90000) + 10000

const buildDateYearMonthDay = date => {
	const d = new Date(date)
	const year = d.getFullYear()
	const month = String(d.getMonth() + 1).padStart(2, "0")
	const day = String(d.getDate()).padStart(2, "0")
	return `${year}-${month}-${day}`
}

const buildTime12HourFormat = date => {
	const d = new Date(date)
	let hours = d.getHours()
	const minutes = String(d.getMinutes()).padStart(2, "0")
	const ampm = hours >= 12 ? "PM" : "AM"
	hours = hours % 12
	hours = hours ? hours : 12
	return `${hours}:${minutes} ${ampm}`
}

export default defineConfig(({ mode }) => {
	// Load environment variables based on the current mode
	const env = loadEnv(mode, process.cwd(), "")
	const isDev = mode === "development"

	return {
		ssr: {
			external: ["react", "react-dom"]
		},
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src")
			},
			dedupe: ["react", "react-dom"]
		},
		build: {
			sourcemap: isDev ? true : "hidden",
			target: "esnext", // Use modern JS for better performance
			rollupOptions: {
				input: "./index.html",
				onwarn(warning, warn) {
					// Filter out specific warnings
					if (
						warning.message.includes("Module level directives cause errors when bundled") ||
						warning.message.includes("Can't resolve original location of error")
					) {
						return
					}
					warn(warning)
				},
				output: {
					entryFileNames: `[name]-${buildHash}.js`,
					chunkFileNames: `assets/[name]-[hash]-${buildHash}.js`,
					assetFileNames: assetInfo => {
						// Keep images/fonts in organized folders
						const name = assetInfo.name || ""
						if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(name)) {
							return `assets/images/[name]-[hash]-${buildHash}[extname]`
						}
						if (/\.(woff2?|ttf|otf|eot)$/.test(name)) {
							return `assets/fonts/[name]-[hash]-${buildHash}[extname]`
						}
						return `assets/[name]-[hash]-${buildHash}[extname]`
					},
					manualChunks(id) {
						// Core React, routing, and TanStack Query (TanStack depends on React, so bundle together)
						if (
							id.includes("node_modules/react/") ||
							id.includes("node_modules/react-dom/") ||
							id.includes("node_modules/scheduler/") ||
							id.includes("node_modules/@tanstack/react-query")
						) {
							return "vendor-react"
						}

						if (id.includes("node_modules/react-router-dom/")) {
							return "vendor-router"
						}

						// Radix UI components - split into smaller chunks
						if (id.includes("node_modules/@radix-ui/")) {
							if (
								id.includes("/react-dialog/") ||
								id.includes("/react-dropdown-menu/") ||
								id.includes("/react-tooltip/")
							) {
								return "vendor-radix-popups"
							}
							if (id.includes("/react-avatar/") || id.includes("/react-separator/") || id.includes("/react-slot/")) {
								return "vendor-radix-basics"
							}
							return "vendor-radix-other"
						}

						// Date handling
						if (id.includes("node_modules/date-fns")) {
							return "vendor-dates"
						}

						// Charting and visualization
						if (id.includes("node_modules/recharts") || id.includes("node_modules/d3")) {
							return "vendor-charts"
						}

						// Animation and UI enhancements
						if (id.includes("node_modules/framer-motion")) {
							return "vendor-animations"
						}

						// UI utilities and icons
						if (
							id.includes("node_modules/lucide-react") ||
							id.includes("node_modules/clsx") ||
							id.includes("node_modules/tailwind-merge") ||
							id.includes("node_modules/class-variance-authority")
						) {
							return "vendor-ui-utils"
						}

						// Theme management
						if (id.includes("node_modules/next-themes")) {
							return "vendor-theming"
						}

						// Notifications and toast
						if (id.includes("node_modules/sonner")) {
							return "vendor-notifications"
						}

						// App-specific chunks by feature
						if (id.includes("/src/pages/chunithm/")) {
							return "feature-chunithm"
						}

						if (id.includes("/src/pages/ongeki/")) {
							return "feature-ongeki"
						}

						if (id.includes("/src/pages/account/")) {
							return "feature-account"
						}

						if (id.includes("/src/components/chunithm/")) {
							return "components-chunithm"
						}

						if (id.includes("/src/components/ongeki/")) {
							return "components-ongeki"
						}
					}
				}
			},
			minify: "esbuild", // Explicitly set for clarity
			cssMinify: "esbuild",
			emptyOutDir: true,
			copyPublicDir: true,
			// Performance optimizations
			reportCompressedSize: false, // Faster builds
			chunkSizeWarningLimit: 1000 // Increase if you have large chunks
		},
		assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.ttf", "**/*.woff", "**/*.woff2", "**/*.svg"],
		plugins: [
			tsconfigPaths(),
			tailwindcss(),
			webUpdateNotice({
				hiddenDefaultNotification: false,
				checkInterval: 60 * 1000,
				checkImmediately: true,
				checkOnLoadFileError: true,
				notificationProps: {
					title: "Site Update Available",
					description: "A new version is available. Please refresh to update.",
					buttonText: "Update Now",
					dismissButtonText: "Later"
				},
				// Add this to reduce console noise in production
				logVersion: isDev
			})
		],
		esbuild: {
			sourcemap: isDev,
			legalComments: "none", // Remove comments in production
			treeShaking: true
		},
		base: "/",
		server: {
			proxy: {
				"/api": {
					target: `http://${env.DOMAIN}:${env.SERVER_PORT}`,
					changeOrigin: true,
					secure: false,
					rewrite: path => path
				}
			},
			port: parseInt(env.CLIENT_PORT) || 3000,
			cors: {
				origin: true,
				credentials: true
			},
			host: true,
			strictPort: false // Allow fallback if port is busy
		},
		// Optimize dependency pre-bundling
		optimizeDeps: {
			include: ["react", "react-dom", "react-router-dom", "@tanstack/react-query", "date-fns", "lucide-react"],
			exclude: ["@plugin-web-update-notification/vite"]
		},
		define: {
			// For client env variables, add the type in src/vite-env.d.ts
			env: {
				CFTurnstileKey: env.CFTurnstileKey,
				BUILD_DATE_YEAR_MONTH_DAY: buildDateYearMonthDay(new Date().toISOString()),
				BUILD_TIME_12_HOUR: buildTime12HourFormat(new Date().toISOString()),
				CDN_URL: env.CDN_URL,
				USE_REACT_STRICT: env.NODE_ENV === "development",
				BUILD_HASH: buildHash
			}
		}
	}
})
